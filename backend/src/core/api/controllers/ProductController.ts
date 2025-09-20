import { Request, Response } from 'express';
import { container } from '../../infrastructure/container/Container';
import { CreateProductUseCase } from '../../application/useCases/product/CreateProductUseCase';
import { GetProductByIdUseCase } from '../../application/useCases/product/GetProductByIdUseCase';
import { GetProductBySkuUseCase } from '../../application/useCases/product/GetProductBySkuUseCase';
import { UpdateProductUseCase } from '../../application/useCases/product/UpdateProductUseCase';
import { UpdateProductStockUseCase } from '../../application/useCases/product/UpdateProductStockUseCase';
import { DeleteProductUseCase } from '../../application/useCases/product/DeleteProductUseCase';
import { SearchProductsUseCase } from '../../application/useCases/product/SearchProductsUseCase';
import { ProductMapper } from '../mappers/ProductMapper';

export class ProductController {
    async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const useCase = container.get<CreateProductUseCase>('CreateProductUseCase');

            const result = await useCase.execute({
                ...req.body,
                createdBy: req.user?.id
            });

            if (!result.success) {
                res.status(400).json({
                    success: false,
                    errors: result.errors
                });
                return;
            }

            const productDto = ProductMapper.toDto(result.product!);

            res.status(201).json({
                success: true,
                data: productDto
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const useCase = container.get<GetProductByIdUseCase>('GetProductByIdUseCase');

            const result = await useCase.execute({
                id: req.params.id,
                includeDeleted: req.query.includeDeleted === 'true'
            });

            if (!result.success) {
                res.status(404).json({
                    success: false,
                    error: result.error
                });
                return;
            }

            const productDto = ProductMapper.toDto(result.product!);

            res.json({
                success: true,
                data: productDto
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getProductBySku(req: Request, res: Response): Promise<void> {
        try {
            const useCase = container.get<GetProductBySkuUseCase>('GetProductBySkuUseCase');

            const result = await useCase.execute({
                sku: req.params.sku,
                includeDeleted: req.query.includeDeleted === 'true'
            });

            if (!result.success) {
                res.status(404).json({
                    success: false,
                    error: result.error
                });
                return;
            }

            const productDto = ProductMapper.toDto(result.product!);

            res.json({
                success: true,
                data: productDto
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const useCase = container.get<UpdateProductUseCase>('UpdateProductUseCase');

            const result = await useCase.execute({
                id: req.params.id,
                ...req.body,
                updatedBy: req.user?.id
            });

            if (!result.success) {
                res.status(400).json({
                    success: false,
                    errors: result.errors
                });
                return;
            }

            const productDto = ProductMapper.toDto(result.product!);

            res.json({
                success: true,
                data: productDto
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async updateProductStock(req: Request, res: Response): Promise<void> {
        try {
            const useCase = container.get<UpdateProductStockUseCase>('UpdateProductStockUseCase');

            const result = await useCase.execute({
                productId: req.params.id,
                ...req.body,
                updatedBy: req.user?.id
            });

            if (!result.success) {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
                return;
            }

            const productDto = ProductMapper.toDto(result.product!);

            res.json({
                success: true,
                data: {
                    product: productDto,
                    previousStock: result.previousStock,
                    newStock: result.newStock
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const useCase = container.get<DeleteProductUseCase>('DeleteProductUseCase');

            const result = await useCase.execute({
                id: req.params.id,
                deletedBy: req.user?.id,
                force: req.query.force === 'true'
            });

            if (!result.success) {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
                return;
            }

            res.status(204).send();

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async searchProducts(req: Request, res: Response): Promise<void> {
        try {
            const useCase = container.get<SearchProductsUseCase>('SearchProductsUseCase');

            const result = await useCase.execute({
                name: req.query.name as string,
                sku: req.query.sku as string,
                categoryId: req.query.categoryId as string,
                status: req.query.status as string,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
                currency: req.query.currency as string,
                inStock: req.query.inStock ? req.query.inStock === 'true' : undefined,
                tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
                sortBy: req.query.sortBy as any,
                sortOrder: req.query.sortOrder as any,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
            });

            if (!result.success) {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
                return;
            }

            const productsDto = result.result!.products.map(product => ProductMapper.toDto(product));

            res.json({
                success: true,
                data: {
                    products: productsDto,
                    total: result.result!.total,
                    hasMore: result.result!.hasMore
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}