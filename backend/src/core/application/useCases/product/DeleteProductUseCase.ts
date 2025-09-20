import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { IEventBus } from '../../../domain/events/IEventBus';
import { Product } from '../../../domain/entities/product/Product';
import { EntityId } from '../../../domain/valueObjects/common/EntityId';

export interface DeleteProductRequest {
    id: string;
    deletedBy?: string;
    force?: boolean;
}

export interface DeleteProductResponse {
    success: boolean;
    error?: string;
}

export class DeleteProductUseCase {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly eventBus: IEventBus
    ) {}

    async execute(request: DeleteProductRequest): Promise<DeleteProductResponse> {
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

            if (product.isDeleted()) {
                return {
                    success: false,
                    error: 'Product is already deleted'
                };
            }

            if (!request.force) {
                const validationErrors = await this.validateDeletion(product);
                if (validationErrors.length > 0) {
                    return {
                        success: false,
                        error: validationErrors.join('; ')
                    };
                }
            }

            const deletedBy = request.deletedBy ? EntityId.create(request.deletedBy) : undefined;

            product.delete(deletedBy);

            await this.productRepository.delete(productId);

            product.getEvents().forEach(event => {
                this.eventBus.publish(event);
            });

            product.clearEvents();

            return { success: true };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred'
            };
        }
    }

    private async validateDeletion(product: Product): Promise<string[]> {
        const errors: string[] = [];

        if (product.stockQuantity > 0) {
            errors.push('Cannot delete product with stock quantity greater than 0');
        }

        if (product.status.isActive()) {
            errors.push('Cannot delete active product. Change status first');
        }

        return errors;
    }
}