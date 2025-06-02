# Contributing to BatchData MCP Server

Thank you for your interest in contributing to the BatchData MCP Server! This document provides guidelines and information for contributors.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style and Standards](#code-style-and-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

## Development Setup

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git**
- **BatchData API Key** - Get yours from [BatchData Settings](https://app.batchdata.com/settings/api)

### Local Development

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/batchdata-mcp-real-estate.git
   cd batchdata-mcp-real-estate
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your BATCHDATA_API_KEY
   ```

4. **Build and test**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
batchdata-mcp-real-estate/
├── batchdata_mcp_server.ts    # Main TypeScript source file
├── batchdata_mcp_server.js    # Compiled JavaScript (generated)
├── package.json               # Node.js dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .env                      # Environment variables (local)
├── .env.example              # Environment template
├── setup.sh                  # Linux/macOS setup script
├── setup.bat                 # Windows setup script
├── README.md                 # Project documentation
├── CONTRIBUTING.md           # This file
└── LICENSE                   # MIT license
```

## Development Workflow

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled server
- `npm run dev` - Build and run in one command
- `npm run clean` - Remove compiled JavaScript files
- `npm run check` - Type check without emitting files

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in `batchdata_mcp_server.ts`

3. **Test your changes**:
   ```bash
   npm run dev
   ```

4. **Verify type checking**:
   ```bash
   npm run check
   ```

## Code Style and Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Follow strict type checking (enabled in tsconfig.json)
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Use Zod schemas for runtime validation

### Code Organization

- Keep tool handlers modular and focused
- Use consistent error handling patterns
- Validate all inputs using Zod schemas
- Log appropriately for debugging

### Example Code Style

```typescript
/**
 * Validates and standardizes an address using USPS verification
 */
const verifyAddress = async (args: {
  street: string;
  city: string;
  state: string;
  zip: string;
  requestId?: string;
}): Promise<AddressVerificationResult> => {
  // Implementation here
};
```

## Testing

### Manual Testing

1. **Test with Claude Desktop**:
   - Configure the MCP server in Claude Desktop
   - Test each tool with various inputs
   - Verify error handling with invalid data

2. **Test API Integration**:
   - Verify all BatchData.io endpoints work correctly
   - Test rate limiting behavior
   - Check error responses

3. **Test Environment Setup**:
   - Verify setup scripts work on different platforms
   - Test with different Node.js versions

### What to Test

- **Address Tools**: verify-address, autocomplete-address, geocode-address, reverse-geocode
- **Property Tools**: lookup-property, search-properties, search-properties-by-boundary, count-properties
- **Error Handling**: Invalid API keys, malformed requests, network failures
- **Edge Cases**: Empty results, rate limiting, large datasets

## Submitting Changes

### Pull Request Process

1. **Fork the repository** and create your feature branch

2. **Make your changes** following the code style guidelines

3. **Test thoroughly** using manual testing procedures

4. **Update documentation** if needed:
   - Update README.md for new features
   - Add JSDoc comments for new functions
   - Update this CONTRIBUTING.md if changing development process

5. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "Add: New property search filter for year built"
   git commit -m "Fix: Handle empty geocoding responses"
   git commit -m "Docs: Update setup instructions for Windows"
   ```

6. **Push to your fork** and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Testing**: Describe how you tested the changes
- **Breaking Changes**: Clearly note any breaking changes
- **Related Issues**: Link to any related GitHub issues

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested with Claude Desktop
- [ ] Verified all affected tools work correctly
- [ ] Tested error handling
- [ ] Updated documentation if needed

## Additional Notes
Any additional information about the changes.
```

## Release Process

For maintainers:

1. **Version Bump**: Update version in package.json
2. **Update Changelog**: Document changes since last release
3. **Test Release**: Ensure all functionality works
4. **Tag Release**: Create git tag with version number
5. **Publish**: Create GitHub release with release notes

## Getting Help

### Resources

- **BatchData API Documentation**: [developer.batchdata.com](https://developer.batchdata.com/)
- **MCP Protocol Documentation**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **TypeScript Documentation**: [typescriptlang.org](https://www.typescriptlang.org/)

### Support Channels

- **GitHub Issues**: For bugs, feature requests, and general questions
- **GitHub Discussions**: For community discussions and questions
- **Email**: Contact the maintainer for security issues or urgent matters

### Issue Templates

When creating issues, please use these templates:

**Bug Report**:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (Node.js version, OS, etc.)
- Relevant logs or error messages

**Feature Request**:
- Description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Alternative solutions considered

**Question/Help**:
- What you're trying to accomplish
- What you've tried so far
- Specific questions or areas where you need help

## Code of Conduct

This project adheres to a code of conduct that promotes a welcoming and inclusive environment for all contributors. Please be respectful, constructive, and collaborative in all interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

Thank you for contributing to the BatchData MCP Server! Your contributions help make real estate data more accessible and useful for developers and professionals worldwide.
