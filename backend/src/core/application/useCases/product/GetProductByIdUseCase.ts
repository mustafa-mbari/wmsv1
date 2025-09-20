import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { Product } from '../../../domain/entities/product/Product';
import { EntityId } from '../../../domain/valueObjects/common/EntityId';

export interface GetProductByIdRequest {
    id: string;
    includeDeleted?: boolean;
}

export interface GetProductByIdResponse {
    success: boolean;
    product?: Product;
    error?: string;
}

export class GetProductByIdUseCase {
    constructor(
        private readonly productRepository: IProductRepository
    ) {}

    async execute(request: GetProductByIdRequest): Promise<GetProductByIdResponse> {
        try {
            if (!request.id || request.id.trim().length === 0) {
                return {
                    success: false,
                    error: 'Product ID is required'
                };
            }

            let productId: EntityId;
            try {
                productId = EntityId.create(request.id);
            } catch {
                return {
                    success: false,
                    error: 'Invalid product ID format'
                };
            }

            const product = await this.productRepository.findById(productId);

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