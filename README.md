# Movable Type MCP Server via Data API

> [!IMPORTANT]
> This project was created based on [mcp-openapi-server](https://github.com/ivo-toby/mcp-openapi-server). We would like to express our utmost appreciation to the project.

> [!IMPORTANT]
> This project is currently very alpha state. It is not recommended for production use. Please use at your own risk.

A Model Context Protocol (MCP) server for Movable Type using the Data API. This server allows you to interact with Movable Type's Data API in a standardized way, making it easier to integrate with other applications and services.

## Quick Start

You do not need to clone this repository to use this MCP server. You can simply configure it in Claude Desktop:

1. Install node.js and npm if you haven't already.

2. Locate or create your Claude Desktop configuration file:
   - On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

3. Add the following configuration to enable the OpenAPI MCP server:

```json
{
  "mcpServers": {
    "openapi": {
      "command": "npx",
      "args": ["-y", "@usualoma/mcp-mt-data-api"]
    }
  }
}
```

## License

MIT
