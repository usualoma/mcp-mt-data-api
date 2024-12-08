#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OpenAPIV3 } from "openapi-types";
import axios from "axios";
import { readFile } from "fs/promises";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Resource,
  TextResourceContents,
} from "@modelcontextprotocol/sdk/types.js";

interface OpenAPIMCPServerConfig {
  name: string;
  version: string;
  apiBaseUrl: string;
  openApiSpec: OpenAPIV3.Document | string;
  headers?: Record<string, string>;
}

function loadConfigFromEnv(): OpenAPIMCPServerConfig {
  if (!process.env.API_BASE_URL) {
    throw new Error("API_BASE_URL environment variable is required");
  }
  if (!process.env.OPENAPI_SPEC_PATH) {
    throw new Error("OPENAPI_SPEC_PATH environment variable is required");
  }

  // Parse headers from env if present
  // Format: "key1:value1,key2:value2"
  const headers: Record<string, string> = {};
  if (process.env.API_HEADERS) {
    process.env.API_HEADERS.split(",").forEach((header) => {
      const [key, value] = header.split(":");
      if (key && value) headers[key.trim()] = value.trim();
    });
  }

  return {
    name: process.env.SERVER_NAME || "mcp-openapi-server",
    version: process.env.SERVER_VERSION || "1.0.0",
    apiBaseUrl: process.env.API_BASE_URL,
    openApiSpec: process.env.OPENAPI_SPEC_PATH,
    headers,
  };
}

class OpenAPIMCPServer {
  private server: Server;
  private config: OpenAPIMCPServerConfig;
  private resources: Map<string, Resource> = new Map();

  constructor(config: OpenAPIMCPServerConfig) {
    this.config = config;
    this.server = new Server({
      name: config.name,
      version: config.version,
    });

    this.initializeHandlers();
  }

  private async loadOpenAPISpec(): Promise<OpenAPIV3.Document> {
    if (typeof this.config.openApiSpec === "string") {
      if (this.config.openApiSpec.startsWith("http")) {
        // Load from URL
        const response = await axios.get(this.config.openApiSpec);
        return response.data as OpenAPIV3.Document;
      } else {
        // Load from local file
        const content = await readFile(this.config.openApiSpec, "utf-8");
        return JSON.parse(content) as OpenAPIV3.Document;
      }
    }
    return this.config.openApiSpec as OpenAPIV3.Document;
  }

  private async parseOpenAPISpec(): Promise<void> {
    const spec = await this.loadOpenAPISpec();

    // Convert each OpenAPI path to an MCP resource
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      if (!pathItem) continue;

      for (const [method, operation] of Object.entries(pathItem)) {
        if (method === "parameters" || !operation) continue; // Skip common parameters

        const op = operation as OpenAPIV3.OperationObject;
        const resourceUri = `openapi://${path}/${method}`;
        const resource: Resource = {
          uri: resourceUri,
          name: op.summary || `${method.toUpperCase()} ${path}`,
          description: op.description,
          mimeType: "application/json",
        };

        this.resources.set(resourceUri, resource);
      }
    }
  }

  private initializeHandlers(): void {
    // change this from resources to mcp tools AI!
    //
    // Handle resource listing
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: Array.from(this.resources.values()),
      };
    });

    // Handle resource reading
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const { uri } = request.params;
        const resource = this.resources.get(uri);

        if (!resource) {
          throw new Error(`Resource not found: ${uri}`);
        }

        // Parse the URI to get path and method
        const [, pathAndMethod] = uri.split("openapi://");
        const [path, method] = pathAndMethod.split("/");

        try {
          // Make the actual API call
          const response = await axios({
            method,
            url: `${this.config.apiBaseUrl}${path}`,
            headers: this.config.headers,
          });

          const contents: TextResourceContents = {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(response.data, null, 2),
          };

          return {
            contents: [contents],
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(`API request failed: ${error.message}`);
          }
          throw error;
        }
      },
    );
  }

  async start(): Promise<void> {
    await this.parseOpenAPISpec();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("OpenAPI MCP Server running on stdio");
  }
}

async function main(): Promise<void> {
  try {
    const config = loadConfigFromEnv();
    const server = new OpenAPIMCPServer(config);
    await server.start();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();

export { OpenAPIMCPServer, loadConfigFromEnv };
