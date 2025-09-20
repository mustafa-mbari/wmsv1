import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { Product } from '../../../domain/entities/product/Product';
import { ProductSku } from '../../../domain/valueObjects/product/ProductSku';

export interface GetProductBySkuRequest {
    sku: string;
    includeDeleted?: boolean;
}

export interface GetProductBySkuResponse {
    success: boolean;
    product?: Product;
    error?: string;
}

export class GetProductBySkuUseCase {
    constructor(
        private readonly productRepository: IProductRepository
    ) {}

    async execute(request: GetProductBySkuRequest): Promise<GetProductBySkuResponse> {
        try {
            if (!request.sku || request.sku.trim().length === 0) {
                return {
                    success: false,
                    error: 'Product SKU is required'
                };
            }

            let sku: ProductSku;
            try {
                sku = ProductSku.create(request.sku);
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Invalid SKU format'
                };
            }

            const product = await this.productRepository.findBySku(sku);

            if (!product) {
                return {
                    success: false,
                    error: 'Product not found'
                };
            }

            if (!request.includeDeleted && product.isDeleted()) {
                return {
                    success: false,
                    error: 'Product not found'
                };
            }

            return {
                success: true,
                product
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred'
            };
        }
    }
}