import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { IProductRepository, ProductSearchFilters, ProductSearchOptions, ProductSearchResult, ProductStatistics } from '../../../../domain/repositories/IProductRepository';
import { Product } from '../../../../domain/entities/product/Product';
import { EntityId } from '../../../../domain/base/EntityId';
import { ProductSku } from '../../../../domain/valueObjects/product/ProductSku';
import { ProductStatus } from '../../../../domain/valueObjects/product/ProductStatus';
import { ProductName } from '../../../../domain/valueObjects/product/ProductName';
import { ProductDescription } from '../../../../domain/valueObjects/product/ProductDescription';
import { Money } from '../../../../domain/valueObjects/common/Money';
import { Weight } from '../../../../domain/valueObjects/common/Weight';
import { Dimensions } from '../../../../domain/valueObjects/common/Dimensions';

@injectable()
export class PrismaProductRepository implements IProductRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findById(id: EntityId): Promise<Product | null> {
        const productData = await this.prisma.products.findFirst({
            where: {
                product_id: id.value,
                deleted_at: null
            }
        });

        if (!productData) {
            return null;
        }

        return this.mapToDomain(productData);
    }

    async findBySku(sku: ProductSku): Promise<Product | null> {
        const productData = await this.prisma.products.findFirst({
            where: {
                sku: sku.value,
                deleted_at: null
            }
        });

        if (!productData) {
            return null;
        }

        return this.mapToDomain(productData);
    }

    async findByBarcode(barcode: string): Promise<Product | null> {
        const productData = await this.prisma.products.findFirst({
            where: {
                barcode: barcode,
                deleted_at: null
            }
        });

        if (!productData) {
            return null;
        }

        return this.mapToDomain(productData);
    }

    async findByCategory(categoryId: EntityId, options?: ProductSearchOptions): Promise<ProductSearchResult> {
        const where = {
            category_id: categoryId.value,
            deleted_at: null
        };

        return this.executeSearch(where, options);
    }

    async search(filters: ProductSearchFilters, options?: ProductSearchOptions): Promise<ProductSearchResult> {
        const where: any = { deleted_at: null };

        if (filters.name) {
            where.product_name = {
                contains: filters.name,
                mode: 'insensitive'
            };
        }

        if (filters.sku) {
            where.sku = {
                contains: filters.sku,
                mode: 'insensitive'
            };
        }

        if (filters.categoryId) {
            where.category_id = filters.categoryId;
        }

        if (filters.status) {
            where.status = filters.status.value;
        }

        if (filters.minPrice || filters.maxPrice) {
            where.price = {};
            if (filters.minPrice) {
                where.price.gte = filters.minPrice.amount;
            }
            if (filters.maxPrice) {
                where.price.lte = filters.maxPrice.amount;
            }
        }

        if (filters.inStock !== undefined) {
            if (filters.inStock) {
                where.stock_quantity = { gt: 0 };
            } else {
                where.stock_quantity = { lte: 0 };
            }
        }

        if (filters.tags && filters.tags.length > 0) {
            where.tags = {
                hasSome: filters.tags
            };
        }

        return this.executeSearch(where, options);
    }

    async findAll(options?: ProductSearchOptions): Promise<ProductSearchResult> {
        const where = { deleted_at: null };
        return this.executeSearch(where, options);
    }

    async findActiveProducts(options?: ProductSearchOptions): Promise<ProductSearchResult> {
        const where = {
            deleted_at: null,
            status: 'active'
        };
        return this.executeSearch(where, options);
    }

    async findLowStockProducts(threshold: number, options?: ProductSearchOptions): Promise<ProductSearchResult> {
        const where = {
            deleted_at: null,
            stock_quantity: { lte: threshold }
        };
        return this.executeSearch(where, options);
    }

    async findOutOfStockProducts(options?: ProductSearchOptions): Promise<ProductSearchResult> {
        const where = {
            deleted_at: null,
            stock_quantity: { lte: 0 }
        };
        return this.executeSearch(where, options);
    }

    async findByPriceRange(minPrice: Money, maxPrice: Money, options?: ProductSearchOptions): Promise<ProductSearchResult> {
        const where = {
            deleted_at: null,
            price: {
                gte: minPrice.amount,
                lte: maxPrice.amount
            }
        };
        return this.executeSearch(where, options);
    }

    async findSimilarProducts(productId: EntityId, limit?: number): Promise<Product[]> {
        // Simplified similar products logic - in practice, this would be more sophisticated
        const product = await this.findById(productId);
        if (!product) {
            return [];
        }

        const products = await this.prisma.products.findMany({
            where: {
                category_id: product.categoryId?.value,
                product_id: { not: productId.value },
                deleted_at: null
            },
            take: limit || 10
        });

        return Promise.all(products.map(p => this.mapToDomain(p)));
    }

    async findProductsByIds(ids: EntityId[]): Promise<Product[]> {
        const products = await this.prisma.products.findMany({
            where: {
                product_id: { in: ids.map(id => id.value) },
                deleted_at: null
            }
        });

        return Promise.all(products.map(p => this.mapToDomain(p)));
    }

    async save(product: Product): Promise<Product> {
        const data = this.mapToPersistence(product, true);

        const savedProduct = await this.prisma.products.create({
            data
        });

        return this.mapToDomain(savedProduct);
    }

    async update(product: Product): Promise<Product> {
        const data = this.mapToPersistence(product, false);

        const updatedProduct = await this.prisma.products.update({
            where: { product_id: product.id.value },
            data
        });

        return this.mapToDomain(updatedProduct);
    }

    async delete(id: EntityId): Promise<void> {
        await this.prisma.products.delete({
            where: { product_id: id.value }
        });
    }

    async exists(id: EntityId): Promise<boolean> {
        const count = await this.prisma.products.count({
            where: {
                product_id: id.value,
                deleted_at: null
            }
        });
        return count > 0;
    }

    async existsBySku(sku: ProductSku): Promise<boolean> {
        const count = await this.prisma.products.count({
            where: {
                sku: sku.value,
                deleted_at: null
            }
        });
        return count > 0;
    }

    async existsByBarcode(barcode: string): Promise<boolean> {
        const count = await this.prisma.products.count({
            where: {
                barcode: barcode,
                deleted_at: null
            }
        });
        return count > 0;
    }

    async count(filters?: ProductSearchFilters): Promise<number> {
        const where: any = { deleted_at: null };
        // Apply filters similar to search method
        return this.prisma.products.count({ where });
    }

    async getStatistics(): Promise<ProductStatistics> {
        const [
            totalProducts,
            activeProducts,
            inactiveProducts,
            outOfStockProducts,
            avgPrice
        ] = await Promise.all([
            this.prisma.products.count({ where: { deleted_at: null } }),
            this.prisma.products.count({ where: { deleted_at: null, status: 'active' } }),
            this.prisma.products.count({ where: { deleted_at: null, status: 'inactive' } }),
            this.prisma.products.count({ where: { deleted_at: null, stock_quantity: { lte: 0 } } }),
            this.prisma.products.aggregate({
                where: { deleted_at: null },
                _avg: { price: true }
            })
        ]);

        return {
            totalProducts,
            activeProducts,
            inactiveProducts,
            outOfStockProducts,
            lowStockProducts: 0, // Would need reorder_point logic
            averagePrice: Money.create(avgPrice._avg.price || 0),
            totalValue: Money.create(0) // Would need to calculate
        };
    }

    async bulkUpdate(products: Product[]): Promise<Product[]> {
        const updatedProducts: Product[] = [];

        for (const product of products) {
            const updated = await this.update(product);
            updatedProducts.push(updated);
        }

        return updatedProducts;
    }

    async bulkDelete(ids: EntityId[]): Promise<void> {
        await this.prisma.products.deleteMany({
            where: {
                product_id: { in: ids.map(id => id.value) }
            }
        });
    }

    async validateBusinessRules(product: Product): Promise<string[]> {
        const errors: string[] = [];

        // Check SKU uniqueness
        if (await this.existsBySku(product.sku)) {
            errors.push('SKU already exists');
        }

        // Check barcode uniqueness if provided
        if (product.barcode && await this.existsByBarcode(product.barcode)) {
            errors.push('Barcode already exists');
        }

        return errors;
    }

    // Helper methods
    private async executeSearch(where: any, options?: ProductSearchOptions): Promise<ProductSearchResult> {
        const limit = options?.limit || 50;
        const offset = options?.offset || 0;

        const orderBy: any = {};
        if (options?.sortBy && options?.sortOrder) {
            orderBy[this.mapSortField(options.sortBy)] = options.sortOrder;
        } else {
            orderBy.created_at = 'desc';
        }

        const [products, total] = await Promise.all([
            this.prisma.products.findMany({
                where,
                orderBy,
                take: limit,
                skip: offset
            }),
            this.prisma.products.count({ where })
        ]);

        const domainProducts = await Promise.all(products.map(p => this.mapToDomain(p)));

        return {
            products: domainProducts,
            total,
            hasMore: offset + limit < total
        };
    }

    private mapSortField(sortBy: string): string {
        const fieldMap: { [key: string]: string } = {
            'name': 'product_name',
            'sku': 'sku',
            'price': 'price',
            'stock': 'stock_quantity',
            'createdAt': 'created_at',
            'updatedAt': 'updated_at'
        };
        return fieldMap[sortBy] || 'created_at';
    }

    private async mapToDomain(data: any): Promise<Product> {
        const name = ProductName.create(data.product_name);
        const sku = ProductSku.create(data.sku);
        const price = Money.create(Number(data.price), data.currency || 'USD');
        const cost = Money.create(Number(data.cost || 0), data.currency || 'USD');

        const options: any = {
            categoryId: data.category_id ? EntityId.create(data.category_id) : undefined,
            stockQuantity: Number(data.stock_quantity || 0),
            reorderLevel: Number(data.reorder_point || 0),
            maxStockLevel: Number(data.max_stock_level || 1000),
            status: data.status ? ProductStatus.create(data.status) : ProductStatus.draft(),
            tags: data.tags || [],
            images: data.images || [],
            specifications: data.specifications || {}
        };

        if (data.barcode) {
            options.barcode = data.barcode;
        }

        if (data.description) {
            options.description = ProductDescription.create(data.description);
        }

        if (data.weight) {
            options.weight = Weight.create(Number(data.weight), data.weight_unit || 'kg');
        }

        if (data.dimensions) {
            try {
                const dims = typeof data.dimensions === 'string'
                    ? JSON.parse(data.dimensions)
                    : data.dimensions;
                options.dimensions = Dimensions.create(
                    dims.length || 0,
                    dims.width || 0,
                    dims.height || 0,
                    dims.unit || 'cm'
                );
            } catch {
                // Invalid dimensions data, skip
            }
        }

        const createdBy = data.created_by ? EntityId.create(data.created_by) : undefined;

        // Create product with existing ID
        const product = Product.create(name, sku, price, cost, options, createdBy);

        // Set the actual ID and timestamps from database
        (product as any)._id = EntityId.create(data.product_id);
        (product as any)._createdAt = data.created_at;
        (product as any)._updatedAt = data.updated_at;
        if (data.updated_by) {
            (product as any)._updatedBy = EntityId.create(data.updated_by);
        }

        return product;
    }

    private mapToPersistence(product: Product, isCreate: boolean): any {
        const data: any = {
            product_name: product.name.value,
            sku: product.sku.value,
            price: product.price.amount,
            cost: product.cost.amount,
            currency: product.price.currency,
            stock_quantity: product.stockQuantity,
            reorder_point: product.reorderLevel,
            max_stock_level: product.maxStockLevel,
            status: product.status.value,
            tags: product.tags,
            images: product.images,
            specifications: product.specifications
        };

        if (isCreate) {
            data.product_id = product.id.value;
            data.created_at = new Date();
            if (product.createdBy) {
                data.created_by = product.createdBy.value;
            }
        } else {
            data.updated_at = new Date();
            if (product.updatedBy) {
                data.updated_by = product.updatedBy.value;
            }
        }

        if (product.categoryId) {
            data.category_id = product.categoryId.value;
        }

        if (product.barcode) {
            data.barcode = product.barcode;
        }

        if (product.description) {
            data.description = product.description.value;
        }

        if (product.weight) {
            data.weight = product.weight.value;
            data.weight_unit = product.weight.unit;
        }

        if (product.dimensions) {
            data.dimensions = JSON.stringify({
                length: product.dimensions.length,
                width: product.dimensions.width,
                height: product.dimensions.height,
                unit: product.dimensions.unit
            });
        }

        return data;
    }

    // Additional repository methods would be implemented here
    async findDuplicateSkus(): Promise<{ sku: string; count: number; productIds: EntityId[] }[]> {
        // Implementation would group by SKU and find duplicates
        return [];
    }

    async findExpiredProducts(): Promise<Product[]> {
        // Implementation would find products past expiry date
        return [];
    }

    async findProductsRequiringReorder(): Promise<Product[]> {
        const products = await this.prisma.products.findMany({
            where: {
                deleted_at: null,
                stock_quantity: { lte: this.prisma.products.fields.reorder_point }
            }
        });

        return Promise.all(products.map(p => this.mapToDomain(p)));
    }

    async getTopSellingProducts(limit?: number, dateRange?: { from: Date; to: Date }): Promise<Product[]> {
        // Implementation would join with sales/order data
        return [];
    }

    async getMostViewedProducts(limit?: number, dateRange?: { from: Date; to: Date }): Promise<Product[]> {
        // Implementation would join with analytics data
        return [];
    }

    async findRecentlyAddedProducts(days?: number, limit?: number): Promise<Product[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (days || 7));

        const products = await this.prisma.products.findMany({
            where: {
                deleted_at: null,
                created_at: { gte: cutoffDate }
            },
            orderBy: { created_at: 'desc' },
            take: limit || 10
        });

        return Promise.all(products.map(p => this.mapToDomain(p)));
    }

    async findRecentlyUpdatedProducts(days?: number, limit?: number): Promise<Product[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (days || 7));

        const products = await this.prisma.products.findMany({
            where: {
                deleted_at: null,
                updated_at: { gte: cutoffDate }
            },
            orderBy: { updated_at: 'desc' },
            take: limit || 10
        });

        return Promise.all(products.map(p => this.mapToDomain(p)));
    }

    async getRecommendedProducts(productId: EntityId, limit?: number): Promise<Product[]> {
        // Implementation would use recommendation algorithm
        return this.findSimilarProducts(productId, limit);
    }

    async findByTag(tag: string, options?: ProductSearchOptions): Promise<ProductSearchResult> {
        const where = {
            deleted_at: null,
            tags: { has: tag }
        };
        return this.executeSearch(where, options);
    }

    async findProductsNeedingAttention(): Promise<Product[]> {
        const products = await this.prisma.products.findMany({
            where: {
                deleted_at: null,
                OR: [
                    { status: 'pending_approval' },
                    { status: 'out_of_stock' },
                    { stock_quantity: { lte: this.prisma.products.fields.reorder_point } }
                ]
            }
        });

        return Promise.all(products.map(p => this.mapToDomain(p)));
    }

    async getProductTrends(dateRange: { from: Date; to: Date }): Promise<{
        newProducts: number;
        updatedProducts: number;
        discontinuedProducts: number;
        stockChanges: number;
    }> {
        // Implementation would analyze trends within date range
        return {
            newProducts: 0,
            updatedProducts: 0,
            discontinuedProducts: 0,
            stockChanges: 0
        };
    }
}