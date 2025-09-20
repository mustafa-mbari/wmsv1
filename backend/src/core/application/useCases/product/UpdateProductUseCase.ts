import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { IEventBus } from '../../../domain/events/IEventBus';
import { Product } from '../../../domain/entities/product/Product';
import { ProductName } from '../../../domain/valueObjects/product/ProductName';
import { ProductSku } from '../../../domain/valueObjects/product/ProductSku';
import { ProductDescription } from '../../../domain/valueObjects/product/ProductDescription';
import { ProductStatus } from '../../../domain/valueObjects/product/ProductStatus';
import { Money } from '../../../domain/valueObjects/common/Money';
import { Weight } from '../../../domain/valueObjects/common/Weight';
import { Dimensions } from '../../../domain/valueObjects/common/Dimensions';
import { EntityId } from '../../../domain/valueObjects/common/EntityId';

export interface UpdateProductRequest {
    id: string;
    name?: string;
    sku?: string;
    barcode?: string;
    description?: string;
    categoryId?: string;
    price?: number;
    cost?: number;
    currency?: string;
    weight?: {
        value: number;
        unit: string;
    };
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    reorderLevel?: number;
    maxStockLevel?: number;
    status?: string;
    tags?: string[];
    images?: string[];
    specifications?: Record<string, any>;
    updatedBy?: string;
}

export interface UpdateProductResponse {
    success: boolean;
    product?: Product;
    errors?: string[];
}

export class UpdateProductUseCase {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly categoryRepository: ICategoryRepository,
        private readonly eventBus: IEventBus
    ) {}

    async execute(request: UpdateProductRequest): Promise<UpdateProductResponse> {
        try {
            const errors = await this.validateRequest(request);
            if (errors.length > 0) {
                return { success: false, errors };
            }

            const productId = EntityId.create(request.id);
            const product = await this.productRepository.findById(productId);

            if (!product) {
                return {
                    success: false,
                    errors: ['Product not found']
                };
            }

            if (product.isDeleted()) {
                return {
                    success: false,
                    errors: ['Cannot update deleted product']
                };
            }

            const updatedBy = request.updatedBy ? EntityId.create(request.updatedBy) : undefined;

            if (request.name || request.description || request.categoryId || request.tags !== undefined ||
                request.images !== undefined || request.specifications !== undefined) {

                const updateData: any = {};

                if (request.name) {
                    updateData.name = ProductName.create(request.name);
                }

                if (request.description) {
                    updateData.description = ProductDescription.create(request.description);
                }

                if (request.categoryId) {
                    updateData.categoryId = EntityId.create(request.categoryId);
                }

                if (request.tags !== undefined) {
                    updateData.tags = request.tags;
                }

                if (request.images !== undefined) {
                    updateData.images = request.images;
                }

                if (request.specifications !== undefined) {
                    updateData.specifications = request.specifications;
                }

                product.updateInformation(updateData, updatedBy);
            }

            if (request.price !== undefined || request.cost !== undefined) {
                const currentPrice = request.price !== undefined
                    ? Money.create(request.price, request.currency || product.price.currency)
                    : product.price;

                const currentCost = request.cost !== undefined
                    ? Money.create(request.cost, request.currency || product.cost.currency)
                    : product.cost;

                product.updatePricing(currentPrice, currentCost, updatedBy);
            }

            if (request.sku) {
                const newSku = ProductSku.create(request.sku);

                if (!product.sku.equals(newSku)) {
                    if (await this.productRepository.existsBySku(newSku)) {
                        return {
                            success: false,
                            errors: [`Product with SKU ${request.sku} already exists`]
                        };
                    }
                    product.updateSku(newSku, updatedBy);
                }
            }

            if (request.barcode !== undefined) {
                if (request.barcode && request.barcode !== product.barcode) {
                    if (await this.productRepository.existsByBarcode(request.barcode)) {
                        return {
                            success: false,
                            errors: [`Product with barcode ${request.barcode} already exists`]
                        };
                    }
                }
                product.updateBarcode(request.barcode, updatedBy);
            }

            if (request.weight) {
                const weight = Weight.create(request.weight.value, request.weight.unit);
                product.updateWeight(weight, updatedBy);
            }

            if (request.dimensions) {
                const dimensions = Dimensions.create(
                    request.dimensions.length,
                    request.dimensions.width,
                    request.dimensions.height,
                    request.dimensions.unit
                );
                product.updateDimensions(dimensions, updatedBy);
            }

            if (request.reorderLevel !== undefined) {
                product.updateReorderLevel(request.reorderLevel, updatedBy);
            }

            if (request.maxStockLevel !== undefined) {
                product.updateMaxStockLevel(request.maxStockLevel, updatedBy);
            }

            if (request.status) {
                const newStatus = ProductStatus.create(request.status);
                if (!product.status.equals(newStatus)) {
                    if (!product.status.canTransitionTo(newStatus)) {
                        return {
                            success: false,
                            errors: [`Cannot transition from ${product.status.value} to ${newStatus.value}`]
                        };
                    }
                    product.changeStatus(newStatus, updatedBy);
                }
            }

            const businessRuleErrors = await this.productRepository.validateBusinessRules(product);
            if (businessRuleErrors.length > 0) {
                return { success: false, errors: businessRuleErrors };
            }

            const updatedProduct = await this.productRepository.update(product);

            product.getEvents().forEach(event => {
                this.eventBus.publish(event);
            });

            product.clearEvents();

            return { success: true, product: updatedProduct };

        } catch (error) {
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'An unexpected error occurred']
            };
        }
    }

    private async validateRequest(request: UpdateProductRequest): Promise<string[]> {
        const errors: string[] = [];

        if (!request.id || request.id.trim().length === 0) {
            errors.push('Product ID is required');
        } else {
            try {
                EntityId.create(request.id);
            } catch {
                errors.push('Invalid product ID format');
            }
        }

        if (request.name !== undefined && (!request.name || request.name.trim().length === 0)) {
            errors.push('Product name cannot be empty');
        }

        if (request.categoryId) {
            try {
                const categoryId = EntityId.create(request.categoryId);
                const categoryExists = await this.categoryRepository.exists(categoryId);
                if (!categoryExists) {
                    errors.push('Category does not exist');
                }
            } catch {
                errors.push('Invalid category ID format');
            }
        }

        if (request.price !== undefined && (typeof request.price !== 'number' || request.price < 0)) {
            errors.push('Price must be a non-negative number');
        }

        if (request.cost !== undefined && (typeof request.cost !== 'number' || request.cost < 0)) {
            errors.push('Cost must be a non-negative number');
        }

        if (request.reorderLevel !== undefined && (typeof request.reorderLevel !== 'number' || request.reorderLevel < 0)) {
            errors.push('Reorder level must be a non-negative number');
        }

        if (request.maxStockLevel !== undefined && (typeof request.maxStockLevel !== 'number' || request.maxStockLevel < 0)) {
            errors.push('Maximum stock level must be a non-negative number');
        }

        if (request.weight) {
            if (typeof request.weight.value !== 'number' || request.weight.value < 0) {
                errors.push('Weight value must be a non-negative number');
            }
            if (!request.weight.unit || request.weight.unit.trim().length === 0) {
                errors.push('Weight unit is required when weight is specified');
            }
        }

        if (request.dimensions) {
            const { length, width, height, unit } = request.dimensions;
            if (typeof length !== 'number' || length < 0) {
                errors.push('Dimensions length must be a non-negative number');
            }
            if (typeof width !== 'number' || width < 0) {
                errors.push('Dimensions width must be a non-negative number');
            }
            if (typeof height !== 'number' || height < 0) {
                errors.push('Dimensions height must be a non-negative number');
            }
            if (!unit || unit.trim().length === 0) {
                errors.push('Dimensions unit is required when dimensions are specified');
            }
        }

        if (request.status) {
            try {
                ProductStatus.create(request.status);
            } catch {
                errors.push('Invalid product status');
            }
        }

        if (request.currency) {
            try {
                Money.create(0, request.currency);
            } catch {
                errors.push('Invalid currency code');
            }
        }

        return errors;
    }
}