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
      name: 'Warehouses',
      description: 'Warehouse management endpoints',
    },
    {
      name: 'Warehouse Zones',
      description: 'Warehouse zone management endpoints',
    },
    {
      name: 'Warehouse Aisles',
      description: 'Warehouse aisle management endpoints',
    },
    {
      name: 'Warehouse Racks',
      description: 'Warehouse rack management endpoints',
    },
    {
      name: 'Warehouse Levels',
      description: 'Warehouse level management endpoints',
    },
    {
      name: 'Warehouse Locations',
      description: 'Warehouse location management endpoints',
    },
    {
      name: 'Inventory',
      description: 'Inventory management endpoints',
    },
    {
      name: 'Inventory Movements',
      description: 'Inventory movement tracking endpoints',
    },
    {
      name: 'Inventory Counts',
      description: 'Inventory counting and cycle count endpoints',
    },
    {
      name: 'Inventory Reservations',
      description: 'Inventory reservation management endpoints',
    },
    {
      name: 'Bin Types',
      description: 'Bin type management endpoints',
    },
    {
      name: 'Bins',
      description: 'Bin management endpoints',
    },
    {
      name: 'Bin Movements',
      description: 'Bin movement tracking endpoints',
    },
    {
      name: 'Bin Contents',
      description: 'Bin content management endpoints',
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
      Warehouse: {
        type: 'object',
        properties: {
          warehouse_id: {
            type: 'string',
            description: 'Warehouse unique identifier',
            maxLength: 10,
          },
          warehouse_name: {
            type: 'string',
            description: 'Warehouse name',
            maxLength: 100,
          },
          warehouse_code: {
            type: 'string',
            description: 'Unique warehouse code',
            maxLength: 20,
          },
          address: {
            type: 'string',
            description: 'Warehouse address',
            nullable: true,
          },
          city: {
            type: 'string',
            description: 'City',
            maxLength: 50,
            nullable: true,
          },
          state: {
            type: 'string',
            description: 'State/Province',
            maxLength: 50,
            nullable: true,
          },
          country: {
            type: 'string',
            description: 'Country',
            maxLength: 50,
            nullable: true,
          },
          postal_code: {
            type: 'string',
            description: 'Postal code',
            maxLength: 20,
            nullable: true,
          },
          contact_person: {
            type: 'string',
            description: 'Contact person name',
            maxLength: 100,
            nullable: true,
          },
          contact_email: {
            type: 'string',
            format: 'email',
            description: 'Contact email',
            maxLength: 100,
            nullable: true,
          },
          contact_phone: {
            type: 'string',
            description: 'Contact phone',
            maxLength: 20,
            nullable: true,
          },
          total_area: {
            type: 'number',
            format: 'decimal',
            description: 'Total warehouse area',
            nullable: true,
          },
          area_unit: {
            type: 'string',
            description: 'Unit of area measurement',
            maxLength: 10,
            nullable: true,
          },
          storage_capacity: {
            type: 'integer',
            description: 'Storage capacity',
            nullable: true,
          },
          warehouse_type: {
            type: 'string',
            description: 'Type of warehouse',
            maxLength: 50,
            nullable: true,
          },
          temperature_controlled: {
            type: 'boolean',
            description: 'Temperature controlled facility',
            default: false,
          },
          operational_status: {
            type: 'string',
            enum: ['operational', 'maintenance', 'closed'],
            description: 'Current operational status',
            default: 'operational',
          },
          is_active: {
            type: 'boolean',
            description: 'Warehouse active status',
            default: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['warehouse_id', 'warehouse_name'],
      },
      WarehouseZone: {
        type: 'object',
        properties: {
          zone_id: {
            type: 'string',
            description: 'Zone unique identifier',
            maxLength: 15,
          },
          warehouse_id: {
            type: 'string',
            description: 'Warehouse ID',
            maxLength: 10,
          },
          zone_name: {
            type: 'string',
            description: 'Zone name',
            maxLength: 100,
          },
          zone_code: {
            type: 'string',
            description: 'Unique zone code',
            maxLength: 20,
          },
          zone_type: {
            type: 'string',
            enum: ['receiving', 'shipping', 'storage', 'picking', 'packing', 'staging'],
            description: 'Type of zone',
          },
          description: {
            type: 'string',
            description: 'Zone description',
            nullable: true,
          },
          area: {
            type: 'number',
            format: 'decimal',
            description: 'Zone area',
            nullable: true,
          },
          capacity: {
            type: 'integer',
            description: 'Zone capacity',
            nullable: true,
          },
          center_x: {
            type: 'number',
            format: 'double',
            description: 'X coordinate of zone center',
          },
          center_y: {
            type: 'number',
            format: 'double',
            description: 'Y coordinate of zone center',
          },
          temperature_controlled: {
            type: 'boolean',
            description: 'Temperature controlled zone',
            default: false,
          },
          status: {
            type: 'string',
            enum: ['operational', 'maintenance', 'blocked'],
            description: 'Zone status',
            default: 'operational',
          },
          is_active: {
            type: 'boolean',
            description: 'Zone active status',
            default: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['zone_id', 'warehouse_id', 'zone_name', 'zone_code', 'zone_type', 'center_x', 'center_y'],
      },
      WarehouseAisle: {
        type: 'object',
        properties: {
          aisle_id: {
            type: 'string',
            description: 'Aisle unique identifier',
            maxLength: 20,
          },
          zone_id: {
            type: 'string',
            description: 'Zone ID',
            maxLength: 15,
          },
          aisle_name: {
            type: 'string',
            description: 'Aisle name',
            maxLength: 50,
          },
          aisle_code: {
            type: 'string',
            description: 'Unique aisle code',
            maxLength: 20,
          },
          description: {
            type: 'string',
            description: 'Aisle description',
            nullable: true,
          },
          length: {
            type: 'number',
            format: 'decimal',
            description: 'Aisle length',
            nullable: true,
          },
          width: {
            type: 'number',
            format: 'decimal',
            description: 'Aisle width',
            nullable: true,
          },
          height: {
            type: 'number',
            format: 'decimal',
            description: 'Aisle height',
            nullable: true,
          },
          capacity: {
            type: 'integer',
            description: 'Aisle capacity',
            nullable: true,
          },
          start_x: {
            type: 'number',
            format: 'double',
            description: 'X coordinate of aisle start',
          },
          start_y: {
            type: 'number',
            format: 'double',
            description: 'Y coordinate of aisle start',
          },
          end_x: {
            type: 'number',
            format: 'double',
            description: 'X coordinate of aisle end',
          },
          end_y: {
            type: 'number',
            format: 'double',
            description: 'Y coordinate of aisle end',
          },
          status: {
            type: 'string',
            enum: ['operational', 'blocked'],
            description: 'Aisle status',
            default: 'operational',
          },
          is_active: {
            type: 'boolean',
            description: 'Aisle active status',
            default: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['aisle_id', 'zone_id', 'aisle_name', 'aisle_code', 'start_x', 'start_y', 'end_x', 'end_y'],
      },
      WarehouseRack: {
        type: 'object',
        properties: {
          rack_id: {
            type: 'string',
            description: 'Rack unique identifier',
            maxLength: 25,
          },
          aisle_id: {
            type: 'string',
            description: 'Aisle ID',
            maxLength: 20,
          },
          rack_name: {
            type: 'string',
            description: 'Rack name',
            maxLength: 50,
          },
          rack_code: {
            type: 'string',
            description: 'Unique rack code',
            maxLength: 20,
          },
          rack_type: {
            type: 'string',
            enum: ['pallet', 'shelving', 'cantilever', 'drive-in'],
            description: 'Type of rack',
            nullable: true,
          },
          description: {
            type: 'string',
            description: 'Rack description',
            nullable: true,
          },
          total_levels: {
            type: 'integer',
            description: 'Total number of levels in rack',
          },
          center_x: {
            type: 'number',
            format: 'double',
            description: 'X coordinate of rack center',
          },
          center_y: {
            type: 'number',
            format: 'double',
            description: 'Y coordinate of rack center',
          },
          status: {
            type: 'string',
            enum: ['operational', 'maintenance'],
            description: 'Rack status',
            default: 'operational',
          },
          is_active: {
            type: 'boolean',
            description: 'Rack active status',
            default: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['rack_id', 'aisle_id', 'rack_name', 'rack_code', 'total_levels', 'center_x', 'center_y'],
      },
      WarehouseLevel: {
        type: 'object',
        properties: {
          level_id: {
            type: 'string',
            description: 'Level unique identifier',
            maxLength: 30,
          },
          rack_id: {
            type: 'string',
            description: 'Rack ID',
            maxLength: 25,
          },
          level_name: {
            type: 'string',
            description: 'Level name',
            maxLength: 50,
          },
          level_code: {
            type: 'string',
            description: 'Unique level code',
            maxLength: 20,
          },
          level_number: {
            type: 'integer',
            description: 'Level number within rack',
          },
          capacity: {
            type: 'integer',
            description: 'Level capacity',
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['operational', 'blocked'],
            description: 'Level status',
            default: 'operational',
          },
          is_active: {
            type: 'boolean',
            description: 'Level active status',
            default: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['level_id', 'rack_id', 'level_name', 'level_code', 'level_number'],
      },
      WarehouseLocation: {
        type: 'object',
        properties: {
          location_id: {
            type: 'string',
            description: 'Location unique identifier',
            maxLength: 35,
          },
          level_id: {
            type: 'string',
            description: 'Level ID',
            maxLength: 30,
          },
          location_name: {
            type: 'string',
            description: 'Location name',
            maxLength: 50,
          },
          location_code: {
            type: 'string',
            description: 'Unique location code',
            maxLength: 20,
          },
          location_type: {
            type: 'string',
            enum: ['picking', 'storage', 'bulk', 'returns'],
            description: 'Type of location',
            nullable: true,
          },
          barcode: {
            type: 'string',
            description: 'Location barcode',
            maxLength: 50,
            nullable: true,
          },
          location_priority: {
            type: 'string',
            enum: ['HIGH', 'MEDIUM', 'LOW'],
            description: 'Location priority for picking',
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['available', 'occupied', 'reserved', 'blocked'],
            description: 'Location status',
            default: 'available',
          },
          is_active: {
            type: 'boolean',
            description: 'Location active status',
            default: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['location_id', 'level_id', 'location_name', 'location_code'],
      },
      Inventory: {
        type: 'object',
        properties: {
          inventory_id: {
            type: 'string',
            description: 'Inventory unique identifier',
            maxLength: 36,
          },
          product_id: {
            type: 'string',
            description: 'Product ID',
            maxLength: 20,
          },
          location_id: {
            type: 'string',
            description: 'Location ID',
            maxLength: 35,
          },
          quantity: {
            type: 'number',
            format: 'decimal',
            description: 'Current quantity',
          },
          uom_id: {
            type: 'string',
            description: 'Unit of measure ID',
            maxLength: 10,
          },
          lot_number: {
            type: 'string',
            description: 'Lot number for batch tracking',
            maxLength: 50,
            nullable: true,
          },
          serial_number: {
            type: 'string',
            description: 'Serial number for individual tracking',
            maxLength: 50,
            nullable: true,
          },
          expiry_date: {
            type: 'string',
            format: 'date',
            description: 'Expiry date',
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['available', 'reserved', 'damaged', 'expired', 'quarantine'],
            description: 'Inventory status',
            default: 'available',
          },
          is_active: {
            type: 'boolean',
            description: 'Inventory active status',
            default: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['inventory_id', 'product_id', 'location_id', 'quantity', 'uom_id'],
      },
      InventoryMovement: {
        type: 'object',
        properties: {
          movement_id: {
            type: 'string',
            description: 'Movement unique identifier',
            maxLength: 36,
          },
          inventory_id: {
            type: 'string',
            description: 'Inventory ID',
            maxLength: 36,
          },
          source_location_id: {
            type: 'string',
            description: 'Source location ID',
            maxLength: 35,
            nullable: true,
          },
          destination_location_id: {
            type: 'string',
            description: 'Destination location ID',
            maxLength: 35,
            nullable: true,
          },
          quantity: {
            type: 'number',
            format: 'decimal',
            description: 'Moved quantity',
          },
          movement_type: {
            type: 'string',
            enum: ['inbound', 'outbound', 'transfer', 'adjustment', 'cycle_count'],
            description: 'Type of movement',
          },
          movement_reason: {
            type: 'string',
            description: 'Reason for movement',
            maxLength: 50,
            nullable: true,
          },
          approval_status: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected'],
            description: 'Approval status',
            default: 'pending',
          },
          movement_date: {
            type: 'string',
            format: 'date-time',
            description: 'Movement date',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
        },
        required: ['movement_id', 'inventory_id', 'quantity', 'movement_type'],
      },
      BinType: {
        type: 'object',
        properties: {
          type_id: {
            type: 'string',
            description: 'Bin type unique identifier',
            maxLength: 20,
          },
          type_code: {
            type: 'string',
            description: 'Bin type code',
            maxLength: 10,
          },
          type_name: {
            type: 'string',
            description: 'Bin type name',
            maxLength: 50,
          },
          description: {
            type: 'string',
            description: 'Bin type description',
            nullable: true,
          },
          standard_length: {
            type: 'number',
            format: 'decimal',
            description: 'Standard length in cm',
          },
          standard_width: {
            type: 'number',
            format: 'decimal',
            description: 'Standard width in cm',
          },
          standard_height: {
            type: 'number',
            format: 'decimal',
            description: 'Standard height in cm',
          },
          max_payload: {
            type: 'number',
            format: 'decimal',
            description: 'Maximum payload in kg',
          },
          material: {
            type: 'string',
            description: 'Material type',
            maxLength: 30,
          },
          is_stackable: {
            type: 'boolean',
            description: 'Can be stacked',
            default: true,
          },
          is_active: {
            type: 'boolean',
            description: 'Bin type active status',
            default: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['type_id', 'type_code', 'type_name', 'standard_length', 'standard_width', 'standard_height', 'max_payload', 'material'],
      },
      Bin: {
        type: 'object',
        properties: {
          bin_id: {
            type: 'string',
            description: 'Bin unique identifier',
            maxLength: 20,
          },
          bin_barcode: {
            type: 'string',
            description: 'Bin barcode',
            maxLength: 50,
            nullable: true,
          },
          bin_name: {
            type: 'string',
            description: 'Bin name',
            maxLength: 100,
            nullable: true,
          },
          current_location_id: {
            type: 'string',
            description: 'Current location ID',
            maxLength: 35,
            nullable: true,
          },
          bin_type: {
            type: 'string',
            description: 'Bin type ID',
            maxLength: 20,
            nullable: true,
          },
          bin_status: {
            type: 'string',
            enum: ['available', 'occupied', 'disabled', 'maintenance', 'missing'],
            description: 'Bin status',
            default: 'available',
          },
          is_active: {
            type: 'boolean',
            description: 'Bin active status',
            default: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['bin_id'],
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