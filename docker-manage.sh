#!/bin/bash

# Docker management scripts for BatchData MCP Server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Please create one based on .env.example"
        if [ -f ".env.example" ]; then
            log_info "Copying .env.example to .env"
            cp .env.example .env
            log_warning "Please edit .env file and add your BATCHDATA_API_KEY"
        fi
        return 1
    fi
    
    if ! grep -q "BATCHDATA_API_KEY=" .env || grep -q "your_api_key_here" .env; then
        log_error "Please set your BATCHDATA_API_KEY in the .env file"
        return 1
    fi
    
    return 0
}

# Build the Docker image
build() {
    log_info "Building BatchData MCP Server Docker image..."
    
    docker build \
        --tag batchdata-mcp-server:latest \
        --tag batchdata-mcp-server:$(date +%Y%m%d) \
        --target production \
        .
    
    log_success "Docker image built successfully!"
}

# Run the container using docker-compose
run() {
    log_info "Starting BatchData MCP Server with docker-compose..."
    
    if ! check_env_file; then
        exit 1
    fi
    
    docker-compose up -d
    log_success "BatchData MCP Server is running!"
    log_info "Use 'docker-compose logs -f' to view logs"
}

# Stop the container
stop() {
    log_info "Stopping BatchData MCP Server..."
    docker-compose down
    log_success "BatchData MCP Server stopped!"
}

# View logs
logs() {
    docker-compose logs -f batchdata-mcp-server
}

# Run container directly with Docker (for testing)
run_direct() {
    log_info "Running BatchData MCP Server directly with Docker..."
    
    if ! check_env_file; then
        exit 1
    fi
    
    docker run \
        --rm \
        --interactive \
        --tty \
        --env-file .env \
        --name batchdata-mcp-server-test \
        batchdata-mcp-server:latest
}

# Test the server by running it in the background and checking if it starts
test() {
    log_info "Testing BatchData MCP Server..."
    
    if ! check_env_file; then
        exit 1
    fi
    
    # Build first
    build
    
    # Run in background for testing
    log_info "Starting server for testing..."
    container_id=$(docker run -d --env-file .env batchdata-mcp-server:latest)
    
    # Wait a moment for startup
    sleep 5
    
    # Check if container is still running
    if docker ps -q --filter "id=$container_id" | grep -q .; then
        log_success "Server started successfully!"
        docker logs "$container_id"
    else
        log_error "Server failed to start!"
        docker logs "$container_id"
        exit 1
    fi
    
    # Clean up
    docker stop "$container_id" > /dev/null
    docker rm "$container_id" > /dev/null
    log_success "Test completed successfully!"
}

# Clean up Docker resources
clean() {
    log_info "Cleaning up Docker resources..."
    
    # Stop and remove containers
    docker-compose down 2>/dev/null || true
    
    # Remove images
    docker rmi batchdata-mcp-server:latest 2>/dev/null || true
    docker rmi batchdata-mcp-server:$(date +%Y%m%d) 2>/dev/null || true
    
    # Remove dangling images
    docker image prune -f
    
    log_success "Cleanup completed!"
}

# Show help
help() {
    echo "BatchData MCP Server Docker Management"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build       Build the Docker image"
    echo "  run         Start the server with docker-compose"
    echo "  stop        Stop the server"
    echo "  logs        View server logs"
    echo "  run-direct  Run directly with Docker (for testing)"
    echo "  test        Build and test the server"
    echo "  clean       Clean up Docker resources"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build && $0 run"
    echo "  $0 test"
    echo "  $0 logs"
}

# Main script logic
case "${1:-help}" in
    build)
        build
        ;;
    run)
        run
        ;;
    stop)
        stop
        ;;
    logs)
        logs
        ;;
    run-direct)
        run_direct
        ;;
    test)
        test
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        log_error "Unknown command: $1"
        help
        exit 1
        ;;
esac