import { Server, Resource, ListResourcesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { OpenAPIV3 } from 'openapi-types';
import axios from 'axios';

export interface OpenAPIMCPServerConfig {
  name: string;
  version: string;
  apiBaseUrl: string;
  openApiSpec: OpenAPIV3.Document;
  headers?: Record<string, string>;
}

export class OpenAPIMCPServer {
  private server: Server;
  private config: OpenAPIMCPServerConfig;
  private resources: Map<string, Resource> = new Map();

  constructor(config: OpenAPIMCPServerConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          resources: {
            listChanged: true
          }
        }
      }
    );

    this.initializeHandlers();
    this.parseOpenAPISpec();
  }

  private parseOpenAPISpec(): void {
    const spec = this.config.openApiSpec;
    
    // Convert each OpenAPI path to an MCP resource
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, pathItemValue] of Object.entries(pathItem)) {
        if (method === 'parameters') continue; // Skip common parameters
        
        // Type guard to ensure we have an operation object
        if (typeof pathItemValue === 'object' && pathItemValue !== null && 'summary' in pathItemValue) {
          const operation = pathItemValue as OpenAPIV3.OperationObject;
          const resourceUri = `openapi://${path}/${method}`;
          const resource: Resource = {
            uri: resourceUri,
            name: operation.summary || `${method.toUpperCase()} ${path}`,
            description: operation.description || undefined,
            mimeType: 'application/json'
          };

        this.resources.set(resourceUri, resource);
      }
    }
  }

  private initializeHandlers(): void {
    // Handle resource listing
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: Array.from(this.resources.values())
      };
    });

    // Handle resource reading
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: { params: { uri: string } }) => {
      const { uri } = request.params;
      const resource = this.resources.get(uri);
      
      if (!resource) {
        throw new Error(`Resource not found: ${uri}`);
      }

      // Parse the URI to get path and method
      const [, path, method] = uri.split('openapi://')[1].split('/');
      
      try {
        // Make the actual API call
        const response = await axios({
          method,
          url: `${this.config.apiBaseUrl}${path}`,
          headers: this.config.headers,
        });

        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`API request failed: ${error.message}`);
        }
        throw error;
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
