import { OpenAPIMCPServer } from '../src/index.js';

// Cat Facts API OpenAPI specification
const catFactsSpec = {
  "openapi": "3.0.0",
  "info": {
    "title": "Cat Fact API",
    "description": "An API for facts about cats",
    "version": "1.0.0"
  },
  "paths": {
    "/breeds": {
      "get": {
        "summary": "Get a list of breeds",
        "description": "Returns a list of cat breeds"
      }
    },
    "/fact": {
      "get": {
        "summary": "Get Random Fact",
        "description": "Returns a random cat fact"
      }
    },
    "/facts": {
      "get": {
        "summary": "Get a list of facts",
        "description": "Returns a list of cat facts"
      }
    }
  }
};

// Initialize the OpenAPI MCP Server
const server = new OpenAPIMCPServer({
  name: "cat-facts-mcp",
  version: "1.0.0",
  apiBaseUrl: "https://catfact.ninja",
  openApiSpec: catFactsSpec
});

// Start the server
server.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
