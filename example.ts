import { OpenAPIMCPServer } from './openapi-mcp-server';
import { OpenAPIV3 } from 'openapi-types';

// Example OpenAPI spec
const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Example API',
    version: '1.0.0'
  },
  paths: {
    '/users': {
      get: {
        summary: 'List users',
        description: 'Returns a list of users',
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

async function main() {
  const server = new OpenAPIMCPServer({
    name: 'openapi-mcp-server',
    version: '1.0.0',
    apiBaseUrl: 'https://api.example.com',
    openApiSpec,
    headers: {
      'Authorization': 'Bearer your-token'
    }
  });

  await server.start();
}

main().catch(console.error);
