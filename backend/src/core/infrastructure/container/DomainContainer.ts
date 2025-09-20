import { Container } from 'inversify';
import { IEventBus } from '../../domain/events/IEventBus';
import { InMemoryEventBus } from '../events/InMemoryEventBus';

// Product Domain
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CreateProductUseCase } from '../../application/useCases/product/CreateProductUseCase';
import { GetProductByIdUseCase } from '../../application/useCases/product/GetProductByIdUseCase';
import { GetProductBySkuUseCase } from '../../application/useCases/product/GetProductBySkuUseCase';
import { UpdateProductUseCase } from '../../application/useCases/product/UpdateProductUseCase';
import { UpdateProductStockUseCase } from '../../application/useCases/product/UpdateProductStockUseCase';
import { DeleteProductUseCase } from '../../application/useCases/product/DeleteProductUseCase';
import { SearchProductsUseCase } from '../../application/useCases/product/SearchProductsUseCase';
import { ProductController } from '../../interface/controllers/ProductController';
import { InventoryController } from '../../interface/controllers/InventoryController';
import { WarehouseController } from '../../interface/controllers/WarehouseController';
import { UserController } from '../../interface/controllers/UserController';

// Inventory Domain
import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository';

// Warehouse Domain
import { IWarehouseRepository } from '../../domain/repositories/IWarehouseRepository';

// User Domain
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';

export class DomainContainer {
    private static _instance: Container;

    public static getInstance(): Container {
        if (!DomainContainer._instance) {
            DomainContainer._instance = new Container();
            DomainContainer.registerDependencies();
        }
        return DomainContainer._instance;
    }

    private static registerDependencies(): void {
        const container = DomainContainer._instance;

        // Core Infrastructure
        container.bind<IEventBus>('IEventBus').to(InMemoryEventBus).inSingletonScope();

        // Product Domain Use Cases
        container.bind<CreateProductUseCase>('CreateProductUseCase').to(CreateProductUseCase);
        container.bind<GetProductByIdUseCase>('GetProductByIdUseCase').to(GetProductByIdUseCase);
        container.bind<GetProductBySkuUseCase>('GetProductBySkuUseCase').to(GetProductBySkuUseCase);
        container.bind<UpdateProductUseCase>('UpdateProductUseCase').to(UpdateProductUseCase);
        container.bind<UpdateProductStockUseCase>('UpdateProductStockUseCase').to(UpdateProductStockUseCase);
        container.bind<DeleteProductUseCase>('DeleteProductUseCase').to(DeleteProductUseCase);
        container.bind<SearchProductsUseCase>('SearchProductsUseCase').to(SearchProductsUseCase);

        // Controllers
        container.bind<ProductController>('ProductController').to(ProductController);
        container.bind<InventoryController>('InventoryController').to(InventoryController);
        container.bind<WarehouseController>('WarehouseController').to(WarehouseController);
        container.bind<UserController>('UserController').to(UserController);

        // Note: Repository implementations will be registered separately
        // This allows for different implementations (Prisma, MongoDB, etc.)
        DomainContainer.registerRepositoryInterfaces();
    }

    private static registerRepositoryInterfaces(): void {
        const container = DomainContainer._instance;

        // Import repository implementations
        const { PrismaProductRepository } = require('../../persistence/prisma/repositories/PrismaProductRepository');
        const { PrismaCategoryRepository } = require('../../persistence/prisma/repositories/PrismaCategoryRepository');

        // Product repositories
        container.bind<IProductRepository>('IProductRepository').to(PrismaProductRepository);
        container.bind<ICategoryRepository>('ICategoryRepository').to(PrismaCategoryRepository);

        // Inventory repositories
        // container.bind<IInventoryRepository>('IInventoryRepository').to(PrismaInventoryRepository);

        // Warehouse repositories
        // container.bind<IWarehouseRepository>('IWarehouseRepository').to(PrismaWarehouseRepository);

        // User repositories
        // container.bind<IUserRepository>('IUserRepository').to(PrismaUserRepository);
        // container.bind<IRoleRepository>('IRoleRepository').to(PrismaRoleRepository);
        // container.bind<IPermissionRepository>('IPermissionRepository').to(PrismaPermissionRepository);
    }

    public static bindRepository<T>(serviceIdentifier: string, implementation: new (...args: any[]) => T): void {
        const container = DomainContainer.getInstance();
        container.bind<T>(serviceIdentifier).to(implementation as any);
    }

    public static get<T>(serviceIdentifier: string): T {
        const container = DomainContainer.getInstance();
        return container.get<T>(serviceIdentifier);
    }

    public static rebind<T>(serviceIdentifier: string, implementation: new (...args: any[]) => T): void {
        const container = DomainContainer.getInstance();
        container.rebind<T>(serviceIdentifier).to(implementation as any);
    }
}