import { IProductRepository, ProductSearchFilters, ProductSearchOptions, ProductSearchResult } from '../../../domain/repositories/IProductRepository';
import { ProductStatus } from '../../../domain/valueObjects/product/ProductStatus';
import { Money } from '../../../domain/valueObjects/common/Money';

export interface SearchProductsRequest {
    name?: string;
    sku?: string;
    categoryId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    inStock?: boolean;
    tags?: string[];
    sortBy?: 'name' | 'sku' | 'price' | 'stock' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export interface SearchProductsResponse {
    success: boolean;
    result?: ProductSearchResult;
    error?: string;
}

export class SearchProductsUseCase {
    constructor(
        private readonly productRepository: IProductRepository
    ) {}

    async execute(request: SearchProductsRequest): Promise<SearchProductsResponse> {
        try {
            const filters = this.buildFilters(request);
            const options = this.buildOptions(request);

            const result = await this.productRepository.search(filters, options);

            return {
                success: true,
                result
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred'
            };
        }
    }

    private buildFilters(request: SearchProductsRequest): ProductSearchFilters {
        const filters: ProductSearchFilters = {};

        if (request.name) {
            filters.name = request.name;
        }

        if (request.sku) {
            filters.sku = request.sku;
        }

        if (request.categoryId) {
            filters.categoryId = request.categoryId;
        }

        if (request.status) {
            try {
                filters.status = ProductStatus.create(request.status);
            } catch {
                throw new Error('Invalid product status');
            }
        }

        if (request.minPrice !== undefined) {
            try {
                filters.minPrice = Money.create(request.minPrice, request.currency);
            } catch {
                throw new Error('Invalid minimum price or currency');
            }
        }

        if (request.maxPrice !== undefined) {
            try {
                filters.maxPrice = Money.create(request.maxPrice, request.currency);
            } catch {
                throw new Error('Invalid maximum price or currency');
            }
        }

        if (request.inStock !== undefined) {
            filters.inStock = request.inStock;
        }

        if (request.tags && request.tags.length > 0) {
            filters.tags = request.tags;
        }

        return filters;
    }

    private buildOptions(request: SearchProductsRequest): ProductSearchOptions {
        const options: ProductSearchOptions = {};

        if (request.sortBy) {
            options.sortBy = request.sortBy;
        }

        if (request.sortOrder) {
            options.sortOrder = request.sortOrder;
        }

        if (request.limit !== undefined) {
            if (request.limit < 1 || request.limit > 1000) {
                throw new Error('Limit must be between 1 and 1000');
            }
            options.limit = request.limit;
        }

        if (request.offset !== undefined) {
            if (request.offset < 0) {
                throw new Error('Offset must be non-negative');
            }
            options.offset = request.offset;
        }

        return options;
    }
}