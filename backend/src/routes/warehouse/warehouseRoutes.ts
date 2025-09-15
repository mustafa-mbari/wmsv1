import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../../utils/logger/logger';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Middleware: All warehouse endpoints require authentication
router.use(authenticateToken);

// =============================================================================
// WAREHOUSE MANAGEMENT
// =============================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching warehouses', { source: 'warehouseRoutes', method: 'getWarehouses' });

    const { limit = 50, offset = 0 } = req.query;
    const where: any = { deleted_at: null };

    const warehouses = await prisma.warehouses.findMany({
      where,
      orderBy: { warehouse_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.warehouses.count({ where });

    logger.info('Warehouses fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getWarehouses',
      count: warehouses.length
    });

    res.json(createApiResponse(true, { warehouses, total }));
  } catch (error: any) {
    logger.error('Error fetching warehouses', {
      source: 'warehouseRoutes',
      method: 'getWarehouses',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch warehouses', error.message)
    );
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    logger.info('Creating warehouse', { source: 'warehouseRoutes', method: 'createWarehouse' });

    const {
      warehouse_name,
      warehouse_code,
      warehouse_type,
      address,
      city,
      state,
      country,
      postal_code,
      contact_person,
      contact_email,
      contact_phone,
      total_area,
      area_unit,
      storage_capacity,
      temperature_controlled,
      min_temperature,
      max_temperature,
      temperature_unit,
      is_active,
      status,
      timezone,
      operating_hours,
      custom_attributes
    } = req.body;

    // Generate location code (lc_warehouse_code and lc_full_code)
    const lc_warehouse_code = warehouse_code.toUpperCase();
    const lc_full_code = `WH-${lc_warehouse_code}`;

    const warehouse = await prisma.warehouses.create({
      data: {
        warehouse_name,
        warehouse_code,
        lc_warehouse_code,
        lc_full_code,
        warehouse_type,
        address_line1: address,
        city,
        state_province: state,
        country,
        postal_code,
        contact_person,
        email: contact_email,
        phone: contact_phone,
        total_area: total_area ? parseFloat(total_area) : null,
        area_unit: area_unit || 'SQM',
        storage_area: storage_capacity ? parseInt(storage_capacity) : null,
        climate_controlled: temperature_controlled || false,
        temperature_min: min_temperature ? parseFloat(min_temperature) : null,
        temperature_max: max_temperature ? parseFloat(max_temperature) : null,
        is_active: is_active !== undefined ? is_active : true,
        status: status || 'operational',
        time_zone: timezone,
        operating_hours,
        custom_attributes,
        created_by: (req as any).user?.user_id,
        updated_by: (req as any).user?.user_id
      }
    });

    logger.info('Warehouse created successfully', {
      source: 'warehouseRoutes',
      method: 'createWarehouse',
      warehouseId: warehouse.warehouse_id
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, warehouse, 'Warehouse created successfully')
    );
  } catch (error: any) {
    logger.error('Error creating warehouse', {
      source: 'warehouseRoutes',
      method: 'createWarehouse',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create warehouse', error.message)
    );
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Updating warehouse', { source: 'warehouseRoutes', method: 'updateWarehouse', warehouseId: id });

    const {
      warehouse_name,
      warehouse_code,
      warehouse_type,
      address,
      city,
      state,
      country,
      postal_code,
      contact_person,
      contact_email,
      contact_phone,
      total_area,
      area_unit,
      storage_capacity,
      temperature_controlled,
      min_temperature,
      max_temperature,
      temperature_unit,
      status,
      timezone,
      operating_hours,
      custom_attributes
    } = req.body;

    // Check if warehouse exists
    const existingWarehouse = await prisma.warehouses.findUnique({
      where: { warehouse_id: id, deleted_at: null }
    });

    if (!existingWarehouse) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Warehouse not found')
      );
    }

    // Generate updated location codes if warehouse_code changed
    const lc_warehouse_code = warehouse_code ? warehouse_code.toUpperCase() : existingWarehouse.lc_warehouse_code;
    const lc_full_code = warehouse_code ? `WH-${lc_warehouse_code}` : existingWarehouse.lc_full_code;

    const warehouse = await prisma.warehouses.update({
      where: { warehouse_id: id },
      data: {
        warehouse_name,
        warehouse_code,
        lc_warehouse_code,
        lc_full_code,
        warehouse_type,
        address_line1: address,
        city,
        state_province: state,
        country,
        postal_code,
        contact_person,
        email: contact_email,
        phone: contact_phone,
        total_area: total_area ? parseFloat(total_area) : null,
        area_unit,
        storage_area: storage_capacity ? parseInt(storage_capacity) : null,
        climate_controlled: temperature_controlled,
        temperature_min: min_temperature ? parseFloat(min_temperature) : null,
        temperature_max: max_temperature ? parseFloat(max_temperature) : null,
        status,
        time_zone: timezone,
        operating_hours,
        custom_attributes,
        updated_by: (req as any).user?.user_id,
        updated_at: new Date()
      }
    });

    logger.info('Warehouse updated successfully', {
      source: 'warehouseRoutes',
      method: 'updateWarehouse',
      warehouseId: id
    });

    res.json(createApiResponse(true, warehouse, 'Warehouse updated successfully'));
  } catch (error: any) {
    logger.error('Error updating warehouse', {
      source: 'warehouseRoutes',
      method: 'updateWarehouse',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update warehouse', error.message)
    );
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Deleting warehouse', { source: 'warehouseRoutes', method: 'deleteWarehouse', warehouseId: id });

    // Check if warehouse exists
    const existingWarehouse = await prisma.warehouses.findUnique({
      where: { warehouse_id: id, deleted_at: null }
    });

    if (!existingWarehouse) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Warehouse not found')
      );
    }

    // Hard delete the warehouse
    await prisma.warehouses.delete({
      where: { warehouse_id: id }
    });

    logger.info('Warehouse deleted successfully', {
      source: 'warehouseRoutes',
      method: 'deleteWarehouse',
      warehouseId: id
    });

    res.json(createApiResponse(true, null, 'Warehouse deleted successfully'));
  } catch (error: any) {
    logger.error('Error deleting warehouse', {
      source: 'warehouseRoutes',
      method: 'deleteWarehouse',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete warehouse', error.message)
    );
  }
});

// =============================================================================
// WAREHOUSE ZONES
// =============================================================================

router.get('/zones', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching warehouse zones', { source: 'warehouseRoutes', method: 'getZones' });

    const zones: any[] = [];

    res.json(createApiResponse(true, zones));
  } catch (error: any) {
    logger.error('Error fetching zones', {
      source: 'warehouseRoutes',
      method: 'getZones',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch zones', error.message)
    );
  }
});

// =============================================================================
// WAREHOUSE AISLES
// =============================================================================

router.get('/aisles', async (req: Request, res: Response) => {
  try {
    const aisles: any[] = [];
    res.json(createApiResponse(true, aisles));
  } catch (error: any) {
    logger.error('Error fetching aisles', {
      source: 'warehouseRoutes',
      method: 'getAisles',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch aisles', error.message)
    );
  }
});

// =============================================================================
// WAREHOUSE RACKS
// =============================================================================

router.get('/racks', async (req: Request, res: Response) => {
  try {
    const racks: any[] = [];
    res.json(createApiResponse(true, racks));
  } catch (error: any) {
    logger.error('Error fetching racks', {
      source: 'warehouseRoutes',
      method: 'getRacks',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch racks', error.message)
    );
  }
});

// =============================================================================
// WAREHOUSE LEVELS
// =============================================================================

router.get('/levels', async (req: Request, res: Response) => {
  try {
    const levels: any[] = [];
    res.json(createApiResponse(true, levels));
  } catch (error: any) {
    logger.error('Error fetching levels', {
      source: 'warehouseRoutes',
      method: 'getLevels',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch levels', error.message)
    );
  }
});

// =============================================================================
// WAREHOUSE LOCATIONS
// =============================================================================

router.get('/locations', async (req: Request, res: Response) => {
  try {
    const locations: any[] = [];
    res.json(createApiResponse(true, locations));
  } catch (error: any) {
    logger.error('Error fetching locations', {
      source: 'warehouseRoutes',
      method: 'getLocations',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch locations', error.message)
    );
  }
});

// =============================================================================
// INVENTORY MANAGEMENT
// =============================================================================

router.get('/inventory', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching warehouse inventory', { source: 'warehouseRoutes', method: 'getInventory' });

    const inventory: any[] = [];

    logger.info('Inventory fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getInventory',
      count: inventory.length
    });

    res.json(createApiResponse(true, inventory));
  } catch (error: any) {
    logger.error('Error fetching inventory', {
      source: 'warehouseRoutes',
      method: 'getInventory',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch inventory', error.message)
    );
  }
});

router.get('/inventory-movements', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching inventory movements', { source: 'warehouseRoutes', method: 'getInventoryMovements' });

    const movements: any[] = [];

    logger.info('Inventory movements fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getInventoryMovements',
      count: movements.length
    });

    res.json(createApiResponse(true, movements));
  } catch (error: any) {
    logger.error('Error fetching inventory movements', {
      source: 'warehouseRoutes',
      method: 'getInventoryMovements',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch inventory movements', error.message)
    );
  }
});

router.get('/inventory-counts', async (req: Request, res: Response) => {
  try {
    const counts: any[] = [];
    res.json(createApiResponse(true, counts));
  } catch (error: any) {
    logger.error('Error fetching inventory counts', {
      source: 'warehouseRoutes',
      method: 'getInventoryCounts',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch inventory counts', error.message)
    );
  }
});

router.get('/inventory-count-details', async (req: Request, res: Response) => {
  try {
    const details: any[] = [];
    res.json(createApiResponse(true, details));
  } catch (error: any) {
    logger.error('Error fetching inventory count details', {
      source: 'warehouseRoutes',
      method: 'getInventoryCountDetails',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch inventory count details', error.message)
    );
  }
});

router.get('/inventory-reservations', async (req: Request, res: Response) => {
  try {
    const reservations: any[] = [];
    res.json(createApiResponse(true, reservations));
  } catch (error: any) {
    logger.error('Error fetching inventory reservations', {
      source: 'warehouseRoutes',
      method: 'getInventoryReservations',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch inventory reservations', error.message)
    );
  }
});

export default router;