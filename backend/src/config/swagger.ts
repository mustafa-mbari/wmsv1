import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'WMS API Documentation',
    version: '1.0.0',
    description: 'Warehouse Management System API documentation with comprehensive RBAC (Role-Based Access Control) system',
    contact: {
      name: 'WMS Team',
      email: 'support@wms.com',
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Roles',
      description: 'Role management endpoints for RBAC system',
    },
    {
      name: 'Permissions',
      description: 'Permission management endpoints for RBAC system',
    },
    {
      name: 'Role Permissions',
      description: 'Role-Permission assignment endpoints for RBAC system',
    },
    {
      name: 'User Roles',
      description: 'User-Role assignment endpoints for RBAC system',
    },
    {
      name: 'Products',
      description: 'Product management endpoints',
    },
    {
      name: 'Categories',
      description: 'Category management endpoints',
    },
    {
      name: 'Brands',
      description: 'Brand management endpoints',
    },
    {
      name: 'Warehouse',
      description: 'Warehouse management endpoints',
    },
  ],
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
            type: 'integer',
            description: 'User unique identifier',
          },
          username: {
            type: 'string',
            description: 'User username',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          first_name: {
            type: 'string',
            description: 'User first name',
          },
          last_name: {
            type: 'string',
            description: 'User last name',
          },
          is_active: {
            type: 'boolean',
            description: 'User account status',
          },
          is_super_admin: {
            type: 'boolean',
            description: 'Super admin status',
          },
          last_login: {
            type: 'string',
            format: 'date-time',
            description: 'Last login date',
            nullable: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation date',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
        required: ['id', 'username', 'email', 'first_name', 'last_name'],
      },
      Role: {
        type: 'object',
        required: [
          'name',
          'slug'
        ],
        properties: {
          id: {
            type: 'integer',
            description: 'Role ID',
          },
          name: {
            type: 'string',
            description: 'Role name',
          },
          slug: {
            type: 'string',
            description: 'Role slug',
          },
          description: {
            type: 'string',
            description: 'Role description',
          },
          is_active: {
            type: 'boolean',
            description: 'Whether role is active',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Permission: {
        type: 'object',
        required: [
          'name',
          'slug'
        ],
        properties: {
          id: {
            type: 'integer',
            description: 'Permission ID',
          },
          name: {
            type: 'string',
            description: 'Permission name',
          },
          slug: {
            type: 'string',
            description: 'Permission slug',
          },
          description: {
            type: 'string',
            description: 'Permission description',
          },
          module: {
            type: 'string',
            description: 'Module name',
          },
          is_active: {
            type: 'boolean',
            description: 'Whether permission is active',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      RolePermission: {
        type: 'object',
        required: [
          'role_id',
          'permission_id'
        ],
        properties: {
          id: {
            type: 'integer',
            description: 'Role Permission ID',
          },
          role_id: {
            type: 'integer',
            description: 'Role ID',
          },
          permission_id: {
            type: 'integer',
            description: 'Permission ID',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
          },
          role: {
            $ref: '#/components/schemas/Role',
          },
          permission: {
            $ref: '#/components/schemas/Permission',
          },
        },
      },
      UserRole: {
        type: 'object',
        required: [
          'user_id',
          'role_id'
        ],
        properties: {
          id: {
            type: 'integer',
            description: 'User Role ID',
          },
          user_id: {
            type: 'integer',
            description: 'User ID',
          },
          role_id: {
            type: 'integer',
            description: 'Role ID',
          },
          assigned_at: {
            type: 'string',
            format: 'date-time',
          },
          assigned_by: {
            type: 'integer',
            description: 'ID of user who assigned the role',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
          },
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              username: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
              first_name: {
                type: 'string',
              },
              last_name: {
                type: 'string',
              },
            },
          },
          role: {
            $ref: '#/components/schemas/Role',
          },
        },
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