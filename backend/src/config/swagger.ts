import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'WMS API Documentation',
    version: '1.0.0',
    description: 'Warehouse Management System API documentation',
    contact: {
      name: 'WMS Team',
      email: 'support@wms.com',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:8000',
      description: 'Development server',
    },
    {
      url: 'https://api.wms.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
          },
          data: {
            type: 'object',
            description: 'Response data',
            nullable: true,
          },
          message: {
            type: 'string',
            description: 'Response message',
            nullable: true,
          },
          error: {
            type: 'string',
            description: 'Error message if request failed',
            nullable: true,
          },
        },
        required: ['success'],
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User unique identifier',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          firstName: {
            type: 'string',
            description: 'User first name',
          },
          lastName: {
            type: 'string',
            description: 'User last name',
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'USER', 'MANAGER'],
            description: 'User role',
          },
          isActive: {
            type: 'boolean',
            description: 'User account status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
        required: ['id', 'email', 'firstName', 'lastName', 'role'],
      },
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Product unique identifier',
          },
          name: {
            type: 'string',
            description: 'Product name',
          },
          description: {
            type: 'string',
            description: 'Product description',
            nullable: true,
          },
          sku: {
            type: 'string',
            description: 'Product SKU',
          },
          price: {
            type: 'number',
            format: 'decimal',
            description: 'Product price',
          },
          categoryId: {
            type: 'string',
            description: 'Category ID',
            nullable: true,
          },
          familyId: {
            type: 'string',
            description: 'Family ID',
            nullable: true,
          },
          brandId: {
            type: 'string',
            description: 'Brand ID',
            nullable: true,
          },
          unitId: {
            type: 'string',
            description: 'Unit ID',
            nullable: true,
          },
          isActive: {
            type: 'boolean',
            description: 'Product status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Product creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
        required: ['id', 'name', 'sku', 'price'],
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Category unique identifier',
          },
          name: {
            type: 'string',
            description: 'Category name',
          },
          description: {
            type: 'string',
            description: 'Category description',
            nullable: true,
          },
          isActive: {
            type: 'boolean',
            description: 'Category status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Category creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
        required: ['id', 'name'],
      },
      Brand: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Brand unique identifier',
          },
          name: {
            type: 'string',
            description: 'Brand name',
          },
          description: {
            type: 'string',
            description: 'Brand description',
            nullable: true,
          },
          isActive: {
            type: 'boolean',
            description: 'Brand status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Brand creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
        required: ['id', 'name'],
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          data: {
            type: 'null',
            nullable: true,
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          error: {
            type: 'string',
            description: 'Detailed error information',
            nullable: true,
          },
        },
        required: ['success', 'message'],
      },
    },
    responses: {
      Success: {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiResponse',
            },
          },
        },
      },
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              data: null,
              message: 'Bad request',
              error: 'Invalid input data',
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized access',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              data: null,
              message: 'Unauthorized',
              error: 'Authentication required',
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden access',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              data: null,
              message: 'Forbidden',
              error: 'Insufficient permissions',
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              data: null,
              message: 'Not found',
              error: 'Resource not found',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              data: null,
              message: 'Internal server error',
              error: 'An unexpected error occurred',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);