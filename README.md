# THIS IS A WORK IN PROGRESS!

# OpenAPI MCP Server

A Model Context Protocol (MCP) server that exposes OpenAPI endpoints as MCP resources. This server allows MCP clients to discover and interact with REST APIs defined by OpenAPI specifications.

## Features

- Load OpenAPI specifications from:
  - Local JSON files
  - Remote URLs
  - Direct specification objects
- Automatic conversion of OpenAPI endpoints to MCP resources
- Support for custom HTTP headers
- Built on the official MCP SDK

## Installation

```bash
npm install openapi-mcp-server
```

## Usage

### Basic Example

```typescript
import { OpenAPIMCPServer } from "openapi-mcp-server";

const server = new OpenAPIMCPServer({
  name: "petstore-mcp",
  version: "1.0.0",
  apiBaseUrl: "https://petstore.swagger.io/v2",
  openApiSpec: "https://petstore.swagger.io/v2/swagger.json",
});

await server.start();
```

### Cat Facts Example

The repository includes an example implementation using the Cat Facts API:

```typescript
import { OpenAPIMCPServer } from "openapi-mcp-server";

const server = new OpenAPIMCPServer({
  name: "cat-facts-mcp",
  version: "1.0.0",
  apiBaseUrl: "https://catfact.ninja",
  openApiSpec: catFactsSpec, // OpenAPI specification object
});

await server.start();
```

This example demonstrates:

- Creating an inline OpenAPI specification
- Initializing an OpenAPIMCPServer
- Exposing Cat Facts API endpoints as MCP resources
- Basic error handling

To run the example:

```bash
npm run build
node dist/examples/cat-facts.js
```

### Configuration Options

The server accepts the following configuration:

```typescript
interface OpenAPIMCPServerConfig {
  // Name of your MCP server
  name: string;

  // Version of your MCP server
  version: string;

  // Base URL for the API endpoints
  apiBaseUrl: string;

  // OpenAPI specification - can be:
  // - A path to a local JSON file
  // - A URL to a remote specification
  // - An OpenAPI Document object
  openApiSpec: OpenAPIV3.Document | string;

  // Optional HTTP headers to include with API requests
  headers?: Record<string, string>;
}
```

### Loading Specifications

You can load the OpenAPI specification in multiple ways:

```typescript
// From a local file
const localServer = new OpenAPIMCPServer({
  ...config,
  openApiSpec: "./specs/api.json",
});

// From a URL
const remoteServer = new OpenAPIMCPServer({
  ...config,
  openApiSpec: "https://api.example.com/openapi.json",
});

// Direct specification object
const directServer = new OpenAPIMCPServer({
  ...config,
  openApiSpec: {
    openapi: "3.0.0",
    // ... rest of OpenAPI spec
  },
});
```

### Adding Custom Headers

You can include custom headers for API requests:

```typescript
const server = new OpenAPIMCPServer({
  ...config,
  headers: {
    Authorization: "Bearer token123",
    "X-API-Key": "your-api-key",
  },
});
```

## Resource URIs

The server creates MCP resources for each OpenAPI endpoint using the following URI format:

```
openapi://{path}/{method}
```

For example, an endpoint `GET /pets/{id}` becomes:

```
openapi:///pets/{id}/get
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## License

MIT
