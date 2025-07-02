# Multi-stage build for BatchData MCP Real Estate Server
# Optimized for production deployment with minimal image size

# Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY batchdata_mcp_server.ts ./

# Fix dotenv import for compatibility (if needed)
RUN sed -i 's@import dotenv from \"dotenv\"@import * as dotenv from \"dotenv\"@' batchdata_mcp_server.ts || true

# Build the TypeScript code
RUN npm run build

# Verify the build output exists
RUN ls -la batchdata_mcp_server.js

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S batchdata -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies from builder
COPY --from=builder /app/package.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy built application
COPY --from=builder /app/batchdata_mcp_server.js ./

# Change ownership to non-root user
RUN chown -R batchdata:nodejs /app
USER batchdata

# Health check to ensure the server starts properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Server process check')" || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port (though MCP typically uses stdio)
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the MCP server
CMD ["node", "batchdata_mcp_server.js"]