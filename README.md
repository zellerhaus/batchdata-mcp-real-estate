# BatchData MCP Server

A Model Context Protocol (MCP) server that integrates with BatchData.io's comprehensive property and address APIs. This server provides access to property data, address verification, skip tracing, geocoding, and advanced property search capabilities.

## Features

### Address Operations
- **verify-address**: Validate and standardize addresses using USPS verification
- **autocomplete-address**: Get intelligent address suggestions as you type
- **geocode-address**: Convert addresses to latitude/longitude coordinates
- **reverse-geocode**: Convert coordinates back to readable addresses

### Property Operations
- **lookup-property**: Get detailed property information by address or APN (Assessor Parcel Number)
- **search-properties**: Advanced property search with comprehensive filters
- **search-properties-by-boundary**: Geographic boundary searches using bounding boxes or radius
- **count-properties**: Get property counts matching specific criteria (lightweight operation)

## Installation

1. **Clone or download this MCP server to your local machine**

2. **Install dependencies**:
   ```bash
   cd batchdata-mcp-real-estate
   npm install
   ```

3. **Configure your API key**:
   - Get your API key from [BatchData Settings](https://app.batchdata.com/settings/api) or [register here](https://app.batchdata.com/register).
   - Create or update the `.env` file in the project root:
   ```env
   BATCHDATA_API_KEY=your_actual_api_key_here
   ```

4. **Build the TypeScript project**:
   ```bash
   npm run build
   ```

5. **Test the server**:
   ```bash
   npm start
   ```

## Quick Setup

Use the automated setup scripts:

**Linux/macOS:**
```bash
chmod +x setup.sh && ./setup.sh
```

**Windows:**
```cmd
setup.bat
```

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript
- **Start**: `npm start` - Runs the compiled JavaScript server
- **Dev**: `npm run dev` - Builds and runs in one command
- **Clean**: `npm run clean` - Removes compiled JavaScript files

## Configuration for Claude Desktop

To use this MCP server with Claude Desktop, add the following to your Claude configuration file:

### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "batchdata": {
      "command": "node",
      "args": ["/path/to/batchdata-mcp-real-estate/batchdata_mcp_server.js"],
      "env": {
        "BATCHDATA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "batchdata": {
      "command": "node",
      "args": ["C:\\path\\to\\batchdata-mcp-real-estate\\batchdata_mcp_server.js"],
      "env": {
        "BATCHDATA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Tools Available

### Address Tools
- `verify-address` - USPS address verification and standardization
- `autocomplete-address` - Smart address suggestions
- `geocode-address` - Convert address to coordinates
- `reverse-geocode` - Convert coordinates to address

### Property Tools
- `lookup-property` - Detailed property data by address/APN
- `search-properties` - Advanced filtered property search
- `search-properties-by-boundary` - Geographic area searches
- `count-properties` - Property count queries

## Example Usage

### Count Properties in Phoenix
```
I need to count single-family homes in Phoenix, AZ between $250,000 and $600,000
```

### Find Comparable Properties
```
Find properties similar to 2800 N 24th St, Phoenix, AZ 85008 within 1 mile
```

### Verify an Address
```
Verify this address: 2800 N 24th St, Phoenix, Arizona 85008
```

## API Rate Limits

BatchData.io rate limits per endpoint:
- **Address Verification**: 5,000 max (1,000 recommended per batch)
- **Address Geocoding**: 90 max (75 recommended per batch)
- **Property Search**: 1,000 max requests
- **Property Lookup**: Standard API limits

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BATCHDATA_API_KEY` | Your BatchData.io API key | Yes |

## Error Handling

The server includes comprehensive error handling for:
- Invalid API keys
- Network request failures
- Malformed requests
- API rate limit exceeded
- Invalid parameter combinations

## Dependencies

- **@modelcontextprotocol/sdk**: Core MCP framework
- **zod**: Runtime type validation
- **dotenv**: Environment variable loading
- **typescript**: TypeScript compiler
- **@types/node**: Node.js type definitions

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Support

- **BatchData API**: [Documentation](https://developer.batchdata.com/)) | [Dashboard](https://app.batchdata.com)
- **MCP Protocol**: [Documentation](https://modelcontextprotocol.io)
- **Issues**: [GitHub Issues](https://github.com/zellerhaus/batchdata-mcp-real-estate/issues)

---

**Real Estate professionals and developers**: This MCP server enables Claude to access comprehensive property data, perform address verification, and conduct advanced property searches directly through natural language queries.
