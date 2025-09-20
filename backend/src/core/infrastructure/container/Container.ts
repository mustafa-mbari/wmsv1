import { Container } from 'inversify';
import 'reflect-metadata';

// Enhanced middleware services
import { EnhancedRequestLogger, ILogger } from '../../api/middleware/EnhancedRequestLogger';

// Enhanced controllers (only include the working ones for now)
import { EnhancedProductController } from '../../api/controllers/EnhancedProductController';

// Use cases - Product
import { CreateProductUseCase } from '../../application/useCases/product/CreateProductUseCase';
import { GetProductByIdUseCase } from '../../application/useCases/product/GetProductByIdUseCase';
import { GetProductBySkuUseCase } from '../../application/useCases/product/GetProductBySkuUseCase';
import { UpdateProductUseCase } from '../../application/useCases/product/UpdateProductUseCase';
import { UpdateProductStockUseCase } from '../../application/useCases/product/UpdateProductStockUseCase';
import { DeleteProductUseCase } from '../../application/useCases/product/DeleteProductUseCase';
import { SearchProductsUseCase } from '../../application/useCases/product/SearchProductsUseCase';

// TODO: Add other use cases when they're implemented

// Repository interfaces (will need to be implemented)
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository';
import { IWarehouseRepository } from '../../domain/repositories/IWarehouseRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

// Service interfaces for middleware
export interface ITokenService {
  validateToken(token: string): Promise<any>;
  generateToken(payload: any): Promise<string>;
  refreshToken(token: string): Promise<string>;
  revokeToken(token: string): Promise<void>;
}

export interface IUserService {
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  validatePassword(user: any, password: string): Promise<boolean>;
  updateLastLogin(userId: string): Promise<void>;
}

// Simple logger implementation
class ConsoleLogger implements ILogger {
  info(message: string, context?: any): void {
    console.log(`[INFO] ${message}`, context ? JSON.stringify(context) : '');
  }

  warn(message: string, context?: any): void {
    console.warn(`[WARN] ${message}`, context ? JSON.stringify(context) : '');
  }

  error(message: string, context?: any): void {
    console.error(`[ERROR] ${message}`, context ? JSON.stringify(context) : '');
  }

  debug(message: string, context?: any): void {
    console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context) : '');
  }
}

// Container setup
const container = new Container();

// Configure container
container.bind<ILogger>('ILogger').to(ConsoleLogger).inSingletonScope();

// Middleware
container.bind<EnhancedRequestLogger>('EnhancedRequestLogger').to(EnhancedRequestLogger).inSingletonScope();

// Controllers (only working ones for now)
container.bind<EnhancedProductController>('EnhancedProductController').to(EnhancedProductController);

// Product Use Cases
container.bind<CreateProductUseCase>('CreateProductUseCase').to(CreateProductUseCase);
container.bind<GetProductByIdUseCase>('GetProductByIdUseCase').to(GetProductByIdUseCase);
container.bind<GetProductBySkuUseCase>('GetProductBySkuUseCase').to(GetProductBySkuUseCase);
container.bind<UpdateProductUseCase>('UpdateProductUseCase').to(UpdateProductUseCase);
container.bind<UpdateProductStockUseCase>('UpdateProductStockUseCase').to(UpdateProductStockUseCase);
container.bind<DeleteProductUseCase>('DeleteProductUseCase').to(DeleteProductUseCase);
container.bind<SearchProductsUseCase>('SearchProductsUseCase').to(SearchProductsUseCase);

// TODO: Add other domain use cases when they're implemented

// TODO: Repository implementations would be bound here when they exist
// container.bind<IProductRepository>('IProductRepository').to(ProductRepository).inSingletonScope();
// container.bind<IInventoryRepository>('IInventoryRepository').to(InventoryRepository).inSingletonScope();
// container.bind<IWarehouseRepository>('IWarehouseRepository').to(WarehouseRepository).inSingletonScope();
// container.bind<IUserRepository>('IUserRepository').to(UserRepository).inSingletonScope();

// TODO: Service implementations would be bound here when they exist
// container.bind<ITokenService>('ITokenService').to(TokenService).inSingletonScope();
// container.bind<IUserService>('IUserService').to(UserService).inSingletonScope();

export { container };
export * from './ContainerTypes';