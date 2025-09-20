import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from './BaseController';
import { CreateWarehouseUseCase } from '../../application/useCases/warehouse/CreateWarehouseUseCase';
import { GetWarehouseByIdUseCase } from '../../application/useCases/warehouse/GetWarehouseByIdUseCase';
import { UpdateWarehouseUseCase } from '../../application/useCases/warehouse/UpdateWarehouseUseCase';
import { DeleteWarehouseUseCase } from '../../application/useCases/warehouse/DeleteWarehouseUseCase';
import { SearchWarehousesUseCase } from '../../application/useCases/warehouse/SearchWarehousesUseCase';
import { CreateZoneUseCase } from '../../application/useCases/warehouse/CreateZoneUseCase';
import { CreateAisleUseCase } from '../../application/useCases/warehouse/CreateAisleUseCase';
import { CreateLocationUseCase } from '../../application/useCases/warehouse/CreateLocationUseCase';
import { GetWarehouseLayoutUseCase } from '../../application/useCases/warehouse/GetWarehouseLayoutUseCase';
import { EntityId } from '../../domain/valueObjects/common/EntityId';

export interface CreateWarehouseDto {
  name: string;
  code: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  contact: {
    phone?: string;
    email?: string;
    manager_name?: string;
  };
  capacity?: {
    total_area: number;
    storage_area: number;
    unit: string;
  };
  operating_hours?: {
    timezone: string;
    schedule: Array<{
      day: string;
      open_time: string;
      close_time: string;
    }>;
  };
  settings?: {
    allow_negative_inventory: boolean;
    require_location_validation: boolean;
    auto_assign_locations: boolean;
  };
  status?: string;
}

export interface UpdateWarehouseDto {
  name?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    manager_name?: string;
  };
  capacity?: {
    total_area?: number;
    storage_area?: number;
    unit?: string;
  };
  operating_hours?: {
    timezone?: string;
    schedule?: Array<{
      day: string;
      open_time: string;
      close_time: string;
    }>;
  };
  settings?: {
    allow_negative_inventory?: boolean;
    require_location_validation?: boolean;
    auto_assign_locations?: boolean;
  };
  status?: string;
}

export interface CreateZoneDto {
  warehouse_id: string;
  name: string;
  code: string;
  description?: string;
  zone_type: 'RECEIVING' | 'STORAGE' | 'PICKING' | 'SHIPPING' | 'QUARANTINE' | 'STAGING';
  temperature_controlled?: boolean;
  security_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  capacity?: {
    max_weight: number;
    max_volume: number;
    unit: string;
  };
  restrictions?: {
    hazmat_allowed: boolean;
    temperature_range: {
      min: number;
      max: number;
      unit: string;
    };
  };
}

export interface CreateAisleDto {
  zone_id: string;
  name: string;
  code: string;
  description?: string;
  aisle_type: 'STANDARD' | 'NARROW' | 'WIDE' | 'DRIVE_IN';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  accessibility?: {
    forklift_accessible: boolean;
    hand_pallet_accessible: boolean;
    person_accessible: boolean;
  };
}

export interface CreateLocationDto {
  aisle_id: string;
  name: string;
  code: string;
  description?: string;
  location_type: 'SHELF' | 'FLOOR' | 'RACK' | 'BIN' | 'PALLET';
  level: number;
  position: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  capacity?: {
    max_weight: number;
    max_volume: number;
    unit: string;
  };
  barcode?: string;
  is_pickable?: boolean;
  is_receivable?: boolean;
}

export interface WarehouseSearchFilters {
  status?: string;
  city?: string;
  state?: string;
  country?: string;
  has_capacity?: boolean;
  zone_types?: string[];
}

@injectable()
export class EnhancedWarehouseController extends BaseController {
  constructor(
    @inject('CreateWarehouseUseCase') private createWarehouseUseCase: CreateWarehouseUseCase,
    @inject('GetWarehouseByIdUseCase') private getWarehouseByIdUseCase: GetWarehouseByIdUseCase,
    @inject('UpdateWarehouseUseCase') private updateWarehouseUseCase: UpdateWarehouseUseCase,
    @inject('DeleteWarehouseUseCase') private deleteWarehouseUseCase: DeleteWarehouseUseCase,
    @inject('SearchWarehousesUseCase') private searchWarehousesUseCase: SearchWarehousesUseCase,
    @inject('CreateZoneUseCase') private createZoneUseCase: CreateZoneUseCase,
    @inject('CreateAisleUseCase') private createAisleUseCase: CreateAisleUseCase,
    @inject('CreateLocationUseCase') private createLocationUseCase: CreateLocationUseCase,
    @inject('GetWarehouseLayoutUseCase') private getWarehouseLayoutUseCase: GetWarehouseLayoutUseCase
  ) {
    super();
  }

  /**
   * Create a new warehouse
   * POST /api/v2/warehouses
   */
  createWarehouse = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = this.getCurrentUser(req);
    const warehouseData: CreateWarehouseDto = req.body;

    this.validateRequired(warehouseData, ['name', 'code', 'address']);
    this.validateRequired(warehouseData.address, ['street', 'city', 'state', 'country', 'postal_code']);

    const result = await this.createWarehouseUseCase.execute({
      ...warehouseData,
      createdBy: user.id
    });

    if (!result.success) {
      this.badRequest(res, result.error, result.errors);
      return;
    }

    this.created(res, result.data, 'Warehouse created successfully');
  });

  /**
   * Get warehouse by ID
   * GET /api/v2/warehouses/:id
   */
  getWarehouseById = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouseId = this.getEntityId(req);
    const includeLayout = req.query.include_layout === 'true';

    const result = await this.getWarehouseByIdUseCase.execute({
      id: warehouseId,
      includeLayout
    });

    if (!result.success) {
      this.notFound(res, result.error);
      return;
    }

    this.ok(res, result.data);
  });

  /**
   * Search and list warehouses with pagination and filters
   * GET /api/v2/warehouses
   */
  searchWarehouses = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = this.getQueryOptions(req);
    const filters: WarehouseSearchFilters = {
      status: req.query.status as string,
      city: req.query.city as string,
      state: req.query.state as string,
      country: req.query.country as string,
      has_capacity: req.query.has_capacity === 'true',
      zone_types: req.query.zone_types ? (req.query.zone_types as string).split(',') : undefined
    };

    const result = await this.searchWarehousesUseCase.execute({
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
        'Warehouses retrieved successfully'
      );
    } else {
      this.ok(res, result.data, 'Warehouses retrieved successfully');
    }
  });

  /**
   * Update warehouse
   * PUT /api/v2/warehouses/:id
   */
  updateWarehouse = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouseId = this.getEntityId(req);
    const user = this.getCurrentUser(req);
    const updateData: UpdateWarehouseDto = req.body;

    const result = await this.updateWarehouseUseCase.execute({
      id: warehouseId,
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

    this.ok(res, result.data, 'Warehouse updated successfully');
  });

  /**
   * Delete warehouse (soft delete)
   * DELETE /api/v2/warehouses/:id
   */
  deleteWarehouse = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouseId = this.getEntityId(req);
    const user = this.getCurrentUser(req);

    // Check if user has admin role for delete operations
    if (!this.requireRole(req, 'admin') && !this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Admin role required for delete operations');
      return;
    }

    const result = await this.deleteWarehouseUseCase.execute({
      id: warehouseId,
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
   * Create zone within warehouse
   * POST /api/v2/warehouses/:warehouseId/zones
   */
  createZone = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouseId = this.getEntityId(req, 'warehouseId');
    const user = this.getCurrentUser(req);
    const zoneData: CreateZoneDto = req.body;

    this.validateRequired(zoneData, ['name', 'code', 'zone_type']);

    if (!['RECEIVING', 'STORAGE', 'PICKING', 'SHIPPING', 'QUARANTINE', 'STAGING'].includes(zoneData.zone_type)) {
      this.badRequest(res, 'Invalid zone type');
      return;
    }

    const result = await this.createZoneUseCase.execute({
      ...zoneData,
      warehouse_id: warehouseId.value,
      createdBy: user.id
    });

    if (!result.success) {
      this.badRequest(res, result.error, result.errors);
      return;
    }

    this.created(res, result.data, 'Zone created successfully');
  });

  /**
   * Create aisle within zone
   * POST /api/v2/warehouses/zones/:zoneId/aisles
   */
  createAisle = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const zoneId = this.getEntityId(req, 'zoneId');
    const user = this.getCurrentUser(req);
    const aisleData: CreateAisleDto = req.body;

    this.validateRequired(aisleData, ['name', 'code', 'aisle_type']);

    if (!['STANDARD', 'NARROW', 'WIDE', 'DRIVE_IN'].includes(aisleData.aisle_type)) {
      this.badRequest(res, 'Invalid aisle type');
      return;
    }

    const result = await this.createAisleUseCase.execute({
      ...aisleData,
      zone_id: zoneId.value,
      createdBy: user.id
    });

    if (!result.success) {
      this.badRequest(res, result.error, result.errors);
      return;
    }

    this.created(res, result.data, 'Aisle created successfully');
  });

  /**
   * Create location within aisle
   * POST /api/v2/warehouses/aisles/:aisleId/locations
   */
  createLocation = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const aisleId = this.getEntityId(req, 'aisleId');
    const user = this.getCurrentUser(req);
    const locationData: CreateLocationDto = req.body;

    this.validateRequired(locationData, ['name', 'code', 'location_type', 'level', 'position']);

    if (!['SHELF', 'FLOOR', 'RACK', 'BIN', 'PALLET'].includes(locationData.location_type)) {
      this.badRequest(res, 'Invalid location type');
      return;
    }

    const result = await this.createLocationUseCase.execute({
      ...locationData,
      aisle_id: aisleId.value,
      createdBy: user.id
    });

    if (!result.success) {
      this.badRequest(res, result.error, result.errors);
      return;
    }

    this.created(res, result.data, 'Location created successfully');
  });

  /**
   * Get warehouse layout (zones, aisles, locations)
   * GET /api/v2/warehouses/:warehouseId/layout
   */
  getWarehouseLayout = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouseId = this.getEntityId(req, 'warehouseId');
    const includeCapacity = req.query.include_capacity === 'true';
    const includeInventory = req.query.include_inventory === 'true';

    const result = await this.getWarehouseLayoutUseCase.execute({
      warehouseId,
      includeCapacity,
      includeInventory
    });

    if (!result.success) {
      this.badRequest(res, result.error);
      return;
    }

    this.ok(res, result.data, 'Warehouse layout retrieved successfully');
  });

  /**
   * Get warehouse analytics/statistics
   * GET /api/v2/warehouses/:warehouseId/analytics
   */
  getWarehouseAnalytics = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouseId = this.getEntityId(req, 'warehouseId');

    // This would require an analytics use case
    // For now, return a placeholder response
    this.ok(res, {
      warehouseId: warehouseId.value,
      capacity: {
        total: 0,
        used: 0,
        available: 0,
        utilization: 0
      },
      zones: {
        total: 0,
        active: 0,
        types: {}
      },
      locations: {
        total: 0,
        occupied: 0,
        available: 0,
        utilization: 0
      },
      inventory: {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        topProducts: []
      },
      activity: {
        dailyMovements: 0,
        weeklyMovements: 0,
        monthlyMovements: 0
      }
    }, 'Warehouse analytics retrieved');
  });

  /**
   * Bulk location creation
   * POST /api/v2/warehouses/locations/bulk
   */
  bulkCreateLocations = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = this.getCurrentUser(req);
    const { aisle_id, pattern, count, starting_position = 1 } = req.body;

    if (!aisle_id || !pattern || !count) {
      this.badRequest(res, 'aisle_id, pattern, and count are required');
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
      for (let i = 0; i < count; i++) {
        const position = starting_position + i;
        const locationCode = pattern.replace('{n}', position.toString().padStart(3, '0'));
        const locationName = `Location ${locationCode}`;

        const result = await this.createLocationUseCase.execute({
          aisle_id,
          name: locationName,
          code: locationCode,
          location_type: 'SHELF',
          level: 1,
          position,
          is_pickable: true,
          is_receivable: true,
          createdBy: user.id
        });

        if (result.success) {
          results.push(result.data);
        } else {
          errors.push({ position, error: result.error });
        }
      }

      this.ok(res, {
        operation: 'bulk_create_locations',
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }, 'Bulk location creation completed');

    } catch (error) {
      this.internalServerError(res, 'Bulk location creation failed', error);
    }
  });
}