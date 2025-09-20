// Container type definitions and constants

export const TYPES = {
  // Controllers
  EnhancedProductController: 'EnhancedProductController',
  EnhancedInventoryController: 'EnhancedInventoryController',
  EnhancedWarehouseController: 'EnhancedWarehouseController',
  EnhancedUserController: 'EnhancedUserController',

  // Middleware
  EnhancedAuthMiddleware: 'EnhancedAuthMiddleware',
  EnhancedRequestLogger: 'EnhancedRequestLogger',
  ValidationMiddleware: 'ValidationMiddleware',

  // Services
  ILogger: 'ILogger',
  ITokenService: 'ITokenService',
  IUserService: 'IUserService',

  // Product Use Cases
  CreateProductUseCase: 'CreateProductUseCase',
  GetProductByIdUseCase: 'GetProductByIdUseCase',
  GetProductBySkuUseCase: 'GetProductBySkuUseCase',
  UpdateProductUseCase: 'UpdateProductUseCase',
  UpdateProductStockUseCase: 'UpdateProductStockUseCase',
  DeleteProductUseCase: 'DeleteProductUseCase',
  SearchProductsUseCase: 'SearchProductsUseCase',

  // Inventory Use Cases
  CreateInventoryMovementUseCase: 'CreateInventoryMovementUseCase',
  GetInventoryByLocationUseCase: 'GetInventoryByLocationUseCase',
  GetInventoryByProductUseCase: 'GetInventoryByProductUseCase',
  UpdateInventoryUseCase: 'UpdateInventoryUseCase',
  GetInventoryHistoryUseCase: 'GetInventoryHistoryUseCase',
  PerformInventoryCountUseCase: 'PerformInventoryCountUseCase',
  SearchInventoryUseCase: 'SearchInventoryUseCase',

  // Warehouse Use Cases
  CreateWarehouseUseCase: 'CreateWarehouseUseCase',
  GetWarehouseByIdUseCase: 'GetWarehouseByIdUseCase',
  UpdateWarehouseUseCase: 'UpdateWarehouseUseCase',
  DeleteWarehouseUseCase: 'DeleteWarehouseUseCase',
  SearchWarehousesUseCase: 'SearchWarehousesUseCase',
  CreateZoneUseCase: 'CreateZoneUseCase',
  CreateAisleUseCase: 'CreateAisleUseCase',
  CreateLocationUseCase: 'CreateLocationUseCase',
  GetWarehouseLayoutUseCase: 'GetWarehouseLayoutUseCase',

  // User Use Cases
  CreateUserUseCase: 'CreateUserUseCase',
  GetUserByIdUseCase: 'GetUserByIdUseCase',
  UpdateUserUseCase: 'UpdateUserUseCase',
  DeleteUserUseCase: 'DeleteUserUseCase',
  SearchUsersUseCase: 'SearchUsersUseCase',
  ChangePasswordUseCase: 'ChangePasswordUseCase',
  UpdateUserRolesUseCase: 'UpdateUserRolesUseCase',
  UpdateUserProfileUseCase: 'UpdateUserProfileUseCase',

  // Repositories
  IProductRepository: 'IProductRepository',
  IInventoryRepository: 'IInventoryRepository',
  IWarehouseRepository: 'IWarehouseRepository',
  IUserRepository: 'IUserRepository'
} as const;

// Type for container service identifiers
export type ServiceIdentifier = typeof TYPES[keyof typeof TYPES];

// Container configuration interface
export interface ContainerConfiguration {
  environment: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  enableTracing: boolean;
}

// Default configuration
export const defaultContainerConfig: ContainerConfiguration = {
  environment: process.env.NODE_ENV as any || 'development',
  logLevel: 'info',
  enableMetrics: false,
  enableTracing: false
};