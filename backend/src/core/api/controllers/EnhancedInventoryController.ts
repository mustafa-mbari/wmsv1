import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from './BaseController';
import { CreateInventoryMovementUseCase } from '../../application/useCases/inventory/CreateInventoryMovementUseCase';
import { GetInventoryByLocationUseCase } from '../../application/useCases/inventory/GetInventoryByLocationUseCase';
import { GetInventoryByProductUseCase } from '../../application/useCases/inventory/GetInventoryByProductUseCase';
import { UpdateInventoryUseCase } from '../../application/useCases/inventory/UpdateInventoryUseCase';
import { GetInventoryHistoryUseCase } from '../../application/useCases/inventory/GetInventoryHistoryUseCase';
import { PerformInventoryCountUseCase } from '../../application/useCases/inventory/PerformInventoryCountUseCase';
import { SearchInventoryUseCase } from '../../application/useCases/inventory/SearchInventoryUseCase';
import { EntityId } from '../../domain/valueObjects/common/EntityId';

export interface CreateInventoryMovementDto {
  product_id: string;
  location_id: string;
  movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  unit_cost?: number;
  reference_number?: string;
  notes?: string;
  source_location_id?: string;
  destination_location_id?: string;
}

export interface UpdateInventoryDto {
  quantity: number;
  reserved_quantity?: number;
  min_quantity?: number;
  max_quantity?: number;
  notes?: string;
}

export interface InventoryCountDto {
  location_id: string;
  counted_items: Array<{
    product_id: string;
    counted_quantity: number;
    notes?: string;
  }>;
  count_type: 'CYCLE' | 'FULL' | 'SPOT';
  notes?: string;
}

export interface InventorySearchFilters {
  product_id?: string;
  location_id?: string;
  warehouse_id?: string;
  zone_id?: string;
  movement_type?: string;
  date_from?: string;
  date_to?: string;
  low_stock?: boolean;
  out_of_stock?: boolean;
  status?: string;
}

@injectable()
export class EnhancedInventoryController extends BaseController {
  constructor(
    @inject('CreateInventoryMovementUseCase') private createMovementUseCase: CreateInventoryMovementUseCase,
    @inject('GetInventoryByLocationUseCase') private getByLocationUseCase: GetInventoryByLocationUseCase,
    @inject('GetInventoryByProductUseCase') private getByProductUseCase: GetInventoryByProductUseCase,
    @inject('UpdateInventoryUseCase') private updateInventoryUseCase: UpdateInventoryUseCase,
    @inject('GetInventoryHistoryUseCase') private getHistoryUseCase: GetInventoryHistoryUseCase,
    @inject('PerformInventoryCountUseCase') private performCountUseCase: PerformInventoryCountUseCase,
    @inject('SearchInventoryUseCase') private searchInventoryUseCase: SearchInventoryUseCase
  ) {
    super();
  }

  /**
   * Create inventory movement
   * POST /api/v2/inventory/movements
   */
  createMovement = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = this.getCurrentUser(req);
    const movementData: CreateInventoryMovementDto = req.body;

    this.validateRequired(movementData, ['product_id', 'location_id', 'movement_type', 'quantity']);

    if (!['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'].includes(movementData.movement_type)) {
      this.badRequest(res, 'Invalid movement type. Must be IN, OUT, TRANSFER, or ADJUSTMENT');
      return;
    }

    if (movementData.movement_type === 'TRANSFER') {
      this.validateRequired(movementData, ['source_location_id', 'destination_location_id']);
    }

    const result = await this.createMovementUseCase.execute({
      ...movementData,
      createdBy: user.id
    });

    if (!result.success) {
      this.badRequest(res, result.error, result.errors);
      return;
    }

    this.created(res, result.data, 'Inventory movement created successfully');
  });

  /**
   * Get inventory by location
   * GET /api/v2/inventory/locations/:locationId
   */
  getInventoryByLocation = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const locationId = this.getEntityId(req, 'locationId');
    const options = this.getQueryOptions(req);

    const result = await this.getByLocationUseCase.execute({
      locationId,
      ...options
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
        'Inventory retrieved successfully'
      );
    } else {
      this.ok(res, result.data, 'Inventory retrieved successfully');
    }
  });

  /**
   * Get inventory by product
   * GET /api/v2/inventory/products/:productId
   */
  getInventoryByProduct = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const productId = this.getEntityId(req, 'productId');
    const warehouseId = req.query.warehouse_id as string;

    const result = await this.getByProductUseCase.execute({
      productId,
      warehouseId: warehouseId ? EntityId.fromString(warehouseId) : undefined
    });

    if (!result.success) {
      this.badRequest(res, result.error);
      return;
    }

    this.ok(res, result.data, 'Inventory retrieved successfully');
  });

  /**
   * Update inventory
   * PUT /api/v2/inventory/:id
   */
  updateInventory = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const inventoryId = this.getEntityId(req);
    const user = this.getCurrentUser(req);
    const updateData: UpdateInventoryDto = req.body;

    const result = await this.updateInventoryUseCase.execute({
      id: inventoryId,
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

    this.ok(res, result.data, 'Inventory updated successfully');
  });

  /**
   * Get inventory movement history
   * GET /api/v2/inventory/history
   */
  getInventoryHistory = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = this.getQueryOptions(req);
    const filters = {
      product_id: req.query.product_id as string,
      location_id: req.query.location_id as string,
      movement_type: req.query.movement_type as string,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string
    };

    const result = await this.getHistoryUseCase.execute({
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
        'Inventory history retrieved successfully'
      );
    } else {
      this.ok(res, result.data, 'Inventory history retrieved successfully');
    }
  });

  /**
   * Perform inventory count
   * POST /api/v2/inventory/counts
   */
  performInventoryCount = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = this.getCurrentUser(req);
    const countData: InventoryCountDto = req.body;

    this.validateRequired(countData, ['location_id', 'counted_items', 'count_type']);

    if (!['CYCLE', 'FULL', 'SPOT'].includes(countData.count_type)) {
      this.badRequest(res, 'Invalid count type. Must be CYCLE, FULL, or SPOT');
      return;
    }

    if (!Array.isArray(countData.counted_items) || countData.counted_items.length === 0) {
      this.badRequest(res, 'At least one counted item is required');
      return;
    }

    const result = await this.performCountUseCase.execute({
      ...countData,
      countedBy: user.id
    });

    if (!result.success) {
      this.badRequest(res, result.error, result.errors);
      return;
    }

    this.created(res, result.data, 'Inventory count completed successfully');
  });

  /**
   * Search inventory with advanced filters
   * GET /api/v2/inventory/search
   */
  searchInventory = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = this.getQueryOptions(req);
    const filters: InventorySearchFilters = {
      product_id: req.query.product_id as string,
      location_id: req.query.location_id as string,
      warehouse_id: req.query.warehouse_id as string,
      zone_id: req.query.zone_id as string,
      movement_type: req.query.movement_type as string,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
      low_stock: req.query.low_stock === 'true',
      out_of_stock: req.query.out_of_stock === 'true',
      status: req.query.status as string
    };

    const result = await this.searchInventoryUseCase.execute({
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
        'Inventory search completed successfully'
      );
    } else {
      this.ok(res, result.data, 'Inventory search completed successfully');
    }
  });

  /**
   * Get inventory analytics/summary
   * GET /api/v2/inventory/analytics
   */
  getInventoryAnalytics = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouseId = req.query.warehouse_id as string;
    const dateRange = {
      from: req.query.date_from as string,
      to: req.query.date_to as string
    };

    // This would require an analytics use case
    // For now, return a placeholder response
    this.ok(res, {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      topMovingProducts: [],
      slowMovingProducts: [],
      warehouseUtilization: 0,
      movementSummary: {
        inbound: 0,
        outbound: 0,
        transfers: 0,
        adjustments: 0
      }
    }, 'Inventory analytics retrieved');
  });

  /**
   * Bulk inventory operations
   * POST /api/v2/inventory/bulk
   */
  bulkOperations = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = this.getCurrentUser(req);
    const { operation, items } = req.body;

    if (!operation || !items || !Array.isArray(items)) {
      this.badRequest(res, 'Operation and items array are required');
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
        case 'movement':
          for (const movementData of items) {
            const result = await this.createMovementUseCase.execute({
              ...movementData,
              createdBy: user.id
            });
            if (result.success) {
              results.push(result.data);
            } else {
              errors.push({ item: movementData, error: result.error });
            }
          }
          break;

        case 'update':
          for (const updateData of items) {
            if (!updateData.id) {
              errors.push({ item: updateData, error: 'ID is required for update' });
              continue;
            }
            const result = await this.updateInventoryUseCase.execute({
              ...updateData,
              updatedBy: user.id
            });
            if (result.success) {
              results.push(result.data);
            } else {
              errors.push({ item: updateData, error: result.error });
            }
          }
          break;

        default:
          this.badRequest(res, 'Invalid operation. Supported: movement, update');
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
}