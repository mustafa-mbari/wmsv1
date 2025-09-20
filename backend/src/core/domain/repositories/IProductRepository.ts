import { Product } from '../entities/product/Product';
import { EntityId } from '../base/EntityId';
import { ProductSku } from '../valueObjects/product/ProductSku';
import { ProductStatus } from '../valueObjects/product/ProductStatus';
import { Money } from '../valueObjects/common/Money';

export interface ProductSearchFilters {
    name?: string;
    sku?: string;
    categoryId?: string;
    status?: ProductStatus;
    minPrice?: Money;
    maxPrice?: Money;
    inStock?: boolean;
    tags?: string[];
}

export interface ProductSearchOptions {
    sortBy?: 'name' | 'sku' | 'price' | 'stock' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export interface ProductSearchResult {
    products: Product[];
    total: number;
    hasMore: boolean;
}

export interface ProductStatistics {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    averagePrice: Money;
    totalValue: Money;
}

export interface IProductRepository {
    findById(id: EntityId): Promise<Product | null>;

    findBySku(sku: ProductSku): Promise<Product | null>;

    findByBarcode(barcode: string): Promise<Product | null>;

    findByCategory(categoryId: EntityId, options?: ProductSearchOptions): Promise<ProductSearchResult>;

    search(filters: ProductSearchFilters, options?: ProductSearchOptions): Promise<ProductSearchResult>;

    findAll(options?: ProductSearchOptions): Promise<ProductSearchResult>;

    findActiveProducts(options?: ProductSearchOptions): Promise<ProductSearchResult>;

    findLowStockProducts(threshold: number, options?: ProductSearchOptions): Promise<ProductSearchResult>;

    findOutOfStockProducts(options?: ProductSearchOptions): Promise<ProductSearchResult>;

    findByPriceRange(minPrice: Money, maxPrice: Money, options?: ProductSearchOptions): Promise<ProductSearchResult>;

    findSimilarProducts(productId: EntityId, limit?: number): Promise<Product[]>;

    findProductsByIds(ids: EntityId[]): Promise<Product[]>;

    save(product: Product): Promise<Product>;

    update(product: Product): Promise<Product>;

    delete(id: EntityId): Promise<void>;

    exists(id: EntityId): Promise<boolean>;

    existsBySku(sku: ProductSku): Promise<boolean>;

    existsByBarcode(barcode: string): Promise<boolean>;

    count(filters?: ProductSearchFilters): Promise<number>;

    getStatistics(): Promise<ProductStatistics>;

    bulkUpdate(products: Product[]): Promise<Product[]>;

    bulkDelete(ids: EntityId[]): Promise<void>;

    findDuplicateSkus(): Promise<{ sku: string; count: number; productIds: EntityId[] }[]>;

    findExpiredProducts(): Promise<Product[]>;

    findProductsRequiringReorder(): Promise<Product[]>;

    getTopSellingProducts(limit?: number, dateRange?: { from: Date; to: Date }): Promise<Product[]>;

    getMostViewedProducts(limit?: number, dateRange?: { from: Date; to: Date }): Promise<Product[]>;

    findRecentlyAddedProducts(days?: number, limit?: number): Promise<Product[]>;

    findRecentlyUpdatedProducts(days?: number, limit?: number): Promise<Product[]>;

    validateBusinessRules(product: Product): Promise<string[]>;

    getRecommendedProducts(productId: EntityId, limit?: number): Promise<Product[]>;

    findByTag(tag: string, options?: ProductSearchOptions): Promise<ProductSearchResult>;

    findProductsNeedingAttention(): Promise<Product[]>;

    getProductTrends(dateRange: { from: Date; to: Date }): Promise<{
        newProducts: number;
        updatedProducts: number;
        discontinuedProducts: number;
        stockChanges: number;
    }>;
}