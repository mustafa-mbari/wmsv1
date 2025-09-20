import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { IEventBus } from '../../../domain/events/IEventBus';
import { Product } from '../../../domain/entities/product/Product';
import { EntityId } from '../../../domain/valueObjects/common/EntityId';

export interface UpdateProductStockRequest {
    productId: string;
    operation: 'add' | 'remove' | 'set';
    quantity: number;
    reason?: string;
    updatedBy?: string;
}

export interface UpdateProductStockResponse {
    success: boolean;
    product?: Product;
    previousStock?: number;
    newStock?: number;
    error?: string;
}

export class UpdateProductStockUseCase {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly eventBus: IEventBus
    ) {}

    async execute(request: UpdateProductStockRequest): Promise<UpdateProductStockResponse> {
        try {
            const validationError = this.validateRequest(request);
            if (validationError) {
                return {
                    success: false,
                    error: validationError
                };
            }

            const productId = EntityId.create(request.productId);
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
                    error: 'Cannot update stock for deleted product'
                };
            }

            if (!product.status.isActive() && !product.status.isOutOfStock()) {
                return {
                    success: false,
                    error: 'Cannot update stock for inactive product'
                };
            }

            const previousStock = product.stockQuantity;
            const updatedBy = request.updatedBy ? EntityId.create(request.updatedBy) : undefined;

            try {
                switch (request.operation) {
                    case 'add':
                        product.addStock(request.quantity, updatedBy);
                        break;
                    case 'remove':
                        product.removeStock(request.quantity, updatedBy);
                        break;
                    case 'set':
                        product.setStock(request.quantity, updatedBy);
                        break;
                    default:
                        return {
                            success: false,
                            error: 'Invalid operation'
                        };
                }
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Stock operation failed'
                };
            }

            const updatedProduct = await this.productRepository.update(product);

            product.getEvents().forEach(event => {
                this.eventBus.publish(event);
            });

            product.clearEvents();

            return {
                success: true,
                product: updatedProduct,
                previousStock,
                newStock: updatedProduct.stockQuantity
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred'
            };
        }
    }

    private validateRequest(request: UpdateProductStockRequest): string | null {
        if (!request.productId || request.productId.trim().length === 0) {
            return 'Product ID is required';
        }

        try {
            EntityId.create(request.productId);
        } catch {
            return 'Invalid product ID format';
        }

        if (!['add', 'remove', 'set'].includes(request.operation)) {
            return 'Invalid operation. Must be one of: add, remove, set';
        }

        if (typeof request.quantity !== 'number' || isNaN(request.quantity)) {
            return 'Quantity must be a valid number';
        }

        if (request.quantity < 0) {
            return 'Quantity cannot be negative';
        }

        if (request.operation === 'add' || request.operation === 'remove') {
            if (request.quantity === 0) {
                return 'Quantity must be greater than 0 for add/remove operations';
            }
        }

        return null;
    }
}