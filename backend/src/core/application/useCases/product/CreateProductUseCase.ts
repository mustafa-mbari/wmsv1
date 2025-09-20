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

export interface CreateProductRequest {
    name: string;
    sku?: string;
    barcode?: string;
    description?: string;
    categoryId: string;
    price: number;
    cost: number;
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
    stockQuantity?: number;
    reorderLevel?: number;
    maxStockLevel?: number;
    status?: string;
    tags?: string[];
    images?: string[];
    specifications?: Record<string, any>;
    createdBy?: string;
}

export interface CreateProductResponse {
    success: boolean;
    product?: Product;
    errors?: string[];
}

export class CreateProductUseCase {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly categoryRepository: ICategoryRepository,
        private readonly eventBus: IEventBus
    ) {}

    async execute(request: CreateProductRequest): Promise<CreateProductResponse> {
        try {
            const errors = await this.validateRequest(request);
            if (errors.length > 0) {
                return { success: false, errors };
            }

            const name = ProductName.create(request.name);

            let sku: ProductSku;
            if (request.sku) {
                sku = ProductSku.create(request.sku);

                if (await this.productRepository.existsBySku(sku)) {
                    return {
                        success: false,
                        errors: [`Product with SKU ${request.sku} already exists`]
                    };
                }
            } else {
                sku = ProductSku.generateFromName(request.name);

                let counter = 1;
                let generatedSku = sku;
                while (await this.productRepository.existsBySku(generatedSku)) {
                    generatedSku = ProductSku.create(`${sku.value}-${counter}`);
                    counter++;
                }
                sku = generatedSku;
            }

            if (request.barcode && await this.productRepository.existsByBarcode(request.barcode)) {
                return {
                    success: false,
                    errors: [`Product with barcode ${request.barcode} already exists`]
                };
            }

            const price = Money.create(request.price, request.currency);
            const cost = Money.create(request.cost, request.currency);

            const categoryId = EntityId.create(request.categoryId);

            const productOptions: any = {
                categoryId,
                stockQuantity: request.stockQuantity || 0,
                reorderLevel: request.reorderLevel || 0,
                maxStockLevel: request.maxStockLevel || 1000,
                status: request.status ? ProductStatus.create(request.status) : ProductStatus.draft(),
                tags: request.tags || [],
                images: request.images || [],
                specifications: request.specifications || {}
            };

            if (request.barcode) {
                productOptions.barcode = request.barcode;
            }

            if (request.description) {
                productOptions.description = ProductDescription.create(request.description);
            }

            if (request.weight) {
                productOptions.weight = Weight.create(request.weight.value, request.weight.unit);
            }

            if (request.dimensions) {
                productOptions.dimensions = Dimensions.create(
                    request.dimensions.length,
                    request.dimensions.width,
                    request.dimensions.height,
                    request.dimensions.unit
                );
            }

            const createdBy = request.createdBy ? EntityId.create(request.createdBy) : undefined;

            const product = Product.create(name, sku, price, cost, productOptions, createdBy);

            const businessRuleErrors = await this.productRepository.validateBusinessRules(product);
            if (businessRuleErrors.length > 0) {
                return { success: false, errors: businessRuleErrors };
            }

            const savedProduct = await this.productRepository.save(product);

            product.getEvents().forEach(event => {
                this.eventBus.publish(event);
            });

            product.clearEvents();

            return { success: true, product: savedProduct };

        } catch (error) {
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'An unexpected error occurred']
            };
        }
    }

    private async validateRequest(request: CreateProductRequest): Promise<string[]> {
        const errors: string[] = [];

        if (!request.name || request.name.trim().length === 0) {
            errors.push('Product name is required');
        }

        if (!request.categoryId) {
            errors.push('Category ID is required');
        } else {
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

        if (typeof request.price !== 'number' || request.price < 0) {
            errors.push('Price must be a non-negative number');
        }

        if (typeof request.cost !== 'number' || request.cost < 0) {
            errors.push('Cost must be a non-negative number');
        }

        if (request.stockQuantity !== undefined && (typeof request.stockQuantity !== 'number' || request.stockQuantity < 0)) {
            errors.push('Stock quantity must be a non-negative number');
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