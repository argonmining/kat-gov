import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KAT Governance API',
      version: '1.0.0',
      description: 'API documentation for the KAT Governance system',
      contact: {
        name: 'KAT Governance Team'
      }
    },
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        }
      },
      securitySchemes: {
        // Add any authentication schemes here if needed
      }
    },
    tags: [
      { name: 'Proposals', description: 'Proposal management endpoints' },
      { name: 'Elections', description: 'Election management endpoints' },
      { name: 'Candidates', description: 'Candidate management endpoints' },
      { name: 'Snapshots', description: 'Snapshot management endpoints' },
      { name: 'Config', description: 'Configuration endpoints' }
    ]
  },
  apis: ['./src/controllers/*.ts'] // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options); 