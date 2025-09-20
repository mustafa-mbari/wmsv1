import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { Injectable, Inject } from '../../../../di/decorators';
import { BaseSeed, SeedOptions, SeedResult } from '../base/BaseSeed';
import { JsonReader } from '../utils/JsonReader';
import { SeedValidator, ValidationRule } from '../utils/SeedValidator';
import { Result } from '../../../../utils/common/Result';

/**
 * Product seeder with dependency injection
 */
@Injectable()
export class ProductSeeder extends BaseSeed {
    constructor(
        @Inject('PrismaClient') prisma: PrismaClient,
        @Inject('Logger') logger?: any
    ) {
        super(prisma, logger);
    }

    getName(): string {
        return 'ProductSeeder';
    }

    getDomain(): string {
        return 'product';
    }

    getDependencies(): string[] {
        return ['BrandSeeder', 'ProductCategorySeeder'];
    }

    async seed(options?: SeedOptions): Promise<Result<SeedResult>> {
        try {
            // Load product data
            const dataResult = await JsonReader.read('product/products.json');
            if (dataResult.isFailure) {
                return Result.fail(dataResult.error!);
            }

            const productData = dataResult.getValue();

            // Validate data
            const validationResult = await this.validateProductData(productData);
            if (validationResult.isFailure) {
                return Result.fail(validationResult.error!);
            }

            // Execute seeding
            return await this.executeSeed(
                productData,
                this.seedProducts.bind(this),
                options
            );

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return Result.fail(`ProductSeeder failed: ${message}`);
        }
    }

    protected async hasExistingData(): Promise<boolean> {
        const count = await this.prisma.products.count();
        return count > 0;
    }

    private async validateProductData(data: any[]): Promise<Result<void>> {
        const rules: ValidationRule[] = [
            { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 200, unique: true },
            { field: 'sku', required: true, type: 'string', minLength: 1, maxLength: 100, unique: true },
            { field: 'barcode', type: 'string', maxLength: 100 },
            { field: 'description', type: 'string' },
            { field: 'short_description', type: 'string' },
            { field: 'price', type: 'number', min: 0 },
            { field: 'cost', type: 'number', min: 0 },
            { field: 'weight', type: 'number', min: 0 },
            { field: 'length', type: 'number', min: 0 },
            { field: 'width', type: 'number', min: 0 },
            { field: 'height', type: 'number', min: 0 },
            { field: 'status', type: 'string' },
            { field: 'stock_quantity', type: 'number', min: 0 },
            { field: 'min_stock_level', type: 'number', min: 0 },
            ...SeedValidator.getAuditFieldRules()
        ];

        const validationResult = await SeedValidator.validateData(data, rules);
        if (validationResult.isFailure) {
            return Result.fail(validationResult.error!);
        }

        const validation = validationResult.getValue();
        if (!validation.valid) {
            const errorMessage = SeedValidator.formatValidationResult(validation);
            this.logger.error(errorMessage);
            return Result.fail('Product data validation failed');
        }

        this.logger.info(`✅ Product data validation passed: ${validation.recordCount} records`);
        return Result.ok();
    }

    private async seedProducts(products: any[], options?: SeedOptions): Promise<{ created: number; updated: number; skipped: number }> {
        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (let i = 0; i < products.length; i++) {
            const productData = products[i];

            try {
                // Check if product already exists
                const existingProduct = await this.prisma.products.findFirst({
                    where: {
                        OR: [
                            { sku: productData.sku },
                            { name: productData.name }
                        ]
                    }
                });

                if (existingProduct) {
                    if (options?.force) {
                        // Update existing product
                        await this.prisma.products.update({
                            where: { id: existingProduct.id },
                            data: {
                                ...productData,
                                updated_at: new Date()
                            }
                        });
                        updated++;
                        this.logger.info(`  ↻ Updated product: ${productData.name}`);
                    } else {
                        skipped++;
                        this.logger.info(`  ⏭ Skipped existing product: ${productData.name}`);
                    }
                } else {
                    // Create new product
                    await this.prisma.products.create({
                        data: {
                            ...productData,
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    });
                    created++;
                    this.logger.info(`  ✅ Created product: ${productData.name}`);
                }

                // Log progress
                if ((i + 1) % 10 === 0 || i === products.length - 1) {
                    this.logProgress({
                        total: products.length,
                        current: i + 1,
                        message: `Processing products`,
                        percentage: ((i + 1) / products.length) * 100
                    });
                }

            } catch (error) {
                this.logger.error(`❌ Failed to process product ${productData.name}:`, error);
                throw error;
            }
        }

        return { created, updated, skipped };
    }
}