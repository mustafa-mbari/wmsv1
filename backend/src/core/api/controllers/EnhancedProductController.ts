import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from './BaseController';
import { CreateProductUseCase } from '../../application/useCases/product/CreateProductUseCase';
import { GetProductByIdUseCase } from '../../application/useCases/product/GetProductByIdUseCase';
import { GetProductBySkuUseCase } from '../../application/useCases/product/GetProductBySkuUseCase';
import { UpdateProductUseCase } from '../../application/useCases/product/UpdateProductUseCase';
import { UpdateProductStockUseCase } from '../../application/useCases/product/UpdateProductStockUseCase';
import { DeleteProductUseCase } from '../../application/useCases/product/DeleteProductUseCase';
import { SearchProductsUseCase } from '../../application/useCases/product/SearchProductsUseCase';
import { EntityId } from '../../domain/valueObjects/common/EntityId';

// DTOs for type safety
export interface CreateProductDto {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  cost: number;
  category_id?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  status?: string;
  stock_quantity?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  category_id?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  status?: string;
}

export interface UpdateProductStockDto {
  quantity: number;
  operation: 'add' | 'subtract' | 'set';
  reason?: string;
}

export interface ProductSearchFilters {
  category_id?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  tags?: string[];
}

@injectable()
export class EnhancedProductController extends BaseController {
  constructor(
    @inject('CreateProductUseCase') private createProductUseCase: CreateProductUseCase,
    @inject('GetProductByIdUseCase') private getProductByIdUseCase: GetProductByIdUseCase,
    @inject('GetProductBySkuUseCase') private getProductBySkuUseCase: GetProductBySkuUseCase,
    @inject('UpdateProductUseCase') private updateProductUseCase: UpdateProductUseCase,
    @inject('UpdateProductStockUseCase') private updateProductStockUseCase: UpdateProductStockUseCase,
    @inject('DeleteProductUseCase') private deleteProductUseCase: DeleteProductUseCase,
    @inject('SearchProductsUseCase') private searchProductsUseCase: SearchProductsUseCase
  ) {
    super();
  }

  /**
   * Create a new product
   * POST /api/v2/products
   */
  createProduct = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = this.getCurrentUser(req);
    const productData: CreateProductDto = req.body;

    // Validate required fields
    this.validateRequired(productData, ['name', 'price', 'cost']);

    const result = await this.createProductUseCase.execute({
      ...productData,
      createdBy: user.id
    });

    if (!result.success) {
      this.badRequest(res, result.error, result.errors);
      return;
    }

    this.created(res, result.data, 'Product created successfully');
  });

  /**
   * Get product by ID
   * GET /api/v2/products/:id
   */
  getProductById = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const productId = this.getEntityId(req);

    const result = await this.getProductByIdUseCase.execute(productId);

    if (!result.success) {
      this.notFound(res, result.error);
      return;
    }

    this.ok(res, result.data);
  });

  /**
   * Get product by SKU
   * GET /api/v2/products/sku/:sku
   */
  getProductBySku = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sku } = req.params;

    if (!sku) {
      this.badRequest(res, 'SKU parameter is required');
      return;
    }

    const result = await this.getProductBySkuUseCase.execute(sku);

    if (!result.success) {
      this.notFound(res, result.error);
      return;
    }

    this.ok(res, result.data);
  });

  /**
   * Search and list products with pagination and filters
   * GET /api/v2/products
   */
  searchProducts = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = this.getQueryOptions(req);
    const filters: ProductSearchFilters = {
      category_id: req.query.category_id as string,
      status: req.query.status as string,
      min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
      max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
      in_stock: req.query.in_stock === 'true',
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined
    };

    const result = await this.searchProductsUseCase.execute({
      ...options,
      filters
    });

    if (!result.success) {
      this.badRequest(res, result.error);
      return;
    }

    if (result.pagination) {
      this.okPaginated(
        res,
        result.data,
        result.pagination.total,
        result.pagination.page,
        result.pagination.limit,
        'Products retrieved successfully'
      );
    } else {
      this.ok(res, result.data, 'Products retrieved successfully');
    }
  });

  /**
   * Update product
   * PUT /api/v2/products/:id
   */
  updateProduct = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const productId = this.getEntityId(req);
    const user = this.getCurrentUser(req);
    const updateData: UpdateProductDto = req.body;

    const result = await this.updateProductUseCase.execute({
      id: productId,
      ...updateData,
      updatedBy: user.id
    });

    if (!result.success) {
      if (result.error?.includes('not found')) {
        this.notFound(res, result.error);
      } else {
        this.badRequest(res, result.error, result.errors);
      }
      return;
    }

    this.ok(res, result.data, 'Product updated successfully');
  });

  /**
   * Update product stock
   * PATCH /api/v2/products/:id/stock
   */
  updateProductStock = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const productId = this.getEntityId(req);
    const user = this.getCurrentUser(req);
    const stockData: UpdateProductStockDto = req.body;

    // Validate required fields
    this.validateRequired(stockData, ['quantity', 'operation']);

    // Validate operation type
    if (!['add', 'subtract', 'set'].includes(stockData.operation)) {
      this.badRequest(res, 'Invalid operation. Must be add, subtract, or set');
      return;
    }

    const result = await this.updateProductStockUseCase.execute({
      productId,
      ...stockData,
      updatedBy: user.id
    });

    if (!result.success) {
      if (result.error?.includes('not found')) {
        this.notFound(res, result.error);
      } else {
        this.badRequest(res, result.error);
      }
      return;
    }

    this.ok(res, result.data, 'Product stock updated successfully');
  });

  /**
   * Delete product (soft delete)
   * DELETE /api/v2/products/:id
   */
  deleteProduct = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const productId = this.getEntityId(req);
    const user = this.getCurrentUser(req);

    // Check if user has admin role for delete operations
    if (!this.requireRole(req, 'admin') && !this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Admin role required for delete operations');
      return;
    }

    const result = await this.deleteProductUseCase.execute({
      id: productId,
      deletedBy: user.id
    });

    if (!result.success) {
      if (result.error?.includes('not found')) {
        this.notFound(res, result.error);
      } else {
        this.badRequest(res, result.error);
      }
      return;
    }

    this.noContent(res);
  });

  /**
   * Bulk operations
   * POST /api/v2/products/bulk
   */
  bulkOperations = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = this.getCurrentUser(req);
    const { operation, products } = req.body;

    if (!operation || !products || !Array.isArray(products)) {
      this.badRequest(res, 'Operation and products array are required');
      return;
    }

    // Check admin role for bulk operations
    if (!this.requireRole(req, 'admin') && !this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Admin role required for bulk operations');
      return;
    }

    let results = [];
    let errors = [];

    try {
      switch (operation) {
        case 'create':
          for (const productData of products) {
            const result = await this.createProductUseCase.execute({
              ...productData,
              createdBy: user.id
            });
            if (result.success) {
              results.push(result.data);
            } else {
              errors.push({ product: productData, error: result.error });
            }
          }
          break;

        case 'update':
          for (const productData of products) {
            if (!productData.id) {
              errors.push({ product: productData, error: 'ID is required for update' });
              continue;
            }
            const result = await this.updateProductUseCase.execute({
              ...productData,
              updatedBy: user.id
            });
            if (result.success) {
              results.push(result.data);
            } else {
              errors.push({ product: productData, error: result.error });
            }
          }
          break;

        case 'delete':
          for (const { id } of products) {
            if (!id) {
              errors.push({ id, error: 'ID is required for delete' });
              continue;
            }
            const result = await this.deleteProductUseCase.execute({
              id: EntityId.fromString(id),
              deletedBy: user.id
            });
            if (result.success) {
              results.push({ id, deleted: true });
            } else {
              errors.push({ id, error: result.error });
            }
          }
          break;

        default:
          this.badRequest(res, 'Invalid operation. Supported: create, update, delete');
          return;
      }

      this.ok(res, {
        operation,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }, `Bulk ${operation} completed`);

    } catch (error) {
      this.internalServerError(res, 'Bulk operation failed', error);
    }
  });

  /**
   * Get product analytics/statistics
   * GET /api/v2/products/analytics
   */
  getProductAnalytics = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // This would require an analytics use case
    // For now, return a placeholder response
    this.ok(res, {
      totalProducts: 0,
      lowStockCount: 0,
      topCategories: [],
      recentlyCreated: 0,
      averagePrice: 0
    }, 'Product analytics retrieved');
  });

  /**
   * Export products to CSV/Excel
   * GET /api/v2/products/export
   */
  exportProducts = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const format = req.query.format as string || 'csv';
    const options = this.getQueryOptions(req);

    // This would require an export use case
    // For now, return a placeholder response
    this.ok(res, {
      downloadUrl: `/exports/products-${Date.now()}.${format}`,
      format,
      generatedAt: new Date().toISOString()
    }, 'Export initiated');
  });
}