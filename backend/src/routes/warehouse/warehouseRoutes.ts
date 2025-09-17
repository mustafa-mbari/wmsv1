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

    const { limit = 50, offset = 0, warehouse_id } = req.query;
    const where: any = { deleted_at: null };

    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }

    const zones = await prisma.zones.findMany({
      where,
      include: {
        warehouses: {
          select: {
            warehouse_id: true,
            warehouse_name: true,
            warehouse_code: true
          }
        }
      },
      orderBy: { zone_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.zones.count({ where });

    logger.info('Zones fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getZones',
      count: zones.length
    });

    res.json(createApiResponse(true, { zones, total }));
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
    logger.info('Fetching warehouse aisles', { source: 'warehouseRoutes', method: 'getAisles' });

    const { limit = 50, offset = 0, warehouse_id, zone_id } = req.query;
    const where: any = { deleted_at: null };

    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }
    if (zone_id) {
      where.zone_id = zone_id;
    }

    const aisles = await prisma.aisles.findMany({
      where,
      include: {
        zones: {
          select: {
            zone_id: true,
            zone_name: true,
            zone_code: true
          }
        },
        warehouses: {
          select: {
            warehouse_id: true,
            warehouse_name: true,
            warehouse_code: true
          }
        }
      },
      orderBy: { aisle_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.aisles.count({ where });

    logger.info('Aisles fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getAisles',
      count: aisles.length
    });

    res.json(createApiResponse(true, { aisles, total }));
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
    logger.info('Fetching warehouse racks', { source: 'warehouseRoutes', method: 'getRacks' });

    const { limit = 50, offset = 0, warehouse_id, zone_id, aisle_id, location_id } = req.query;
    const where: any = { deleted_at: null };

    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }
    if (zone_id) {
      where.zone_id = zone_id;
    }
    if (aisle_id) {
      where.aisle_id = aisle_id;
    }
    if (location_id) {
      where.location_id = location_id;
    }

    const racks = await prisma.racks.findMany({
      where,
      include: {
        locations: {
          select: {
            location_id: true,
            location_name: true,
            location_code: true
          }
        },
        aisles: {
          select: {
            aisle_id: true,
            aisle_name: true,
            aisle_code: true
          }
        },
        zones: {
          select: {
            zone_id: true,
            zone_name: true,
            zone_code: true
          }
        },
        warehouses: {
          select: {
            warehouse_id: true,
            warehouse_name: true,
            warehouse_code: true
          }
        }
      },
      orderBy: { rack_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.racks.count({ where });

    logger.info('Racks fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getRacks',
      count: racks.length
    });

    res.json(createApiResponse(true, { racks, total }));
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
    logger.info('Fetching warehouse levels', { source: 'warehouseRoutes', method: 'getLevels' });

    const { limit = 50, offset = 0, warehouse_id, zone_id, aisle_id, location_id, rack_id } = req.query;
    const where: any = { deleted_at: null };

    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }
    if (zone_id) {
      where.zone_id = zone_id;
    }
    if (aisle_id) {
      where.aisle_id = aisle_id;
    }
    if (location_id) {
      where.location_id = location_id;
    }
    if (rack_id) {
      where.rack_id = rack_id;
    }

    const levels = await prisma.levels.findMany({
      where,
      include: {
        racks: {
          select: {
            rack_id: true,
            rack_name: true,
            rack_code: true
          }
        },
        locations: {
          select: {
            location_id: true,
            location_name: true,
            location_code: true
          }
        },
        aisles: {
          select: {
            aisle_id: true,
            aisle_name: true,
            aisle_code: true
          }
        },
        zones: {
          select: {
            zone_id: true,
            zone_name: true,
            zone_code: true
          }
        },
        warehouses: {
          select: {
            warehouse_id: true,
            warehouse_name: true,
            warehouse_code: true
          }
        }
      },
      orderBy: { level_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.levels.count({ where });

    logger.info('Levels fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getLevels',
      count: levels.length
    });

    res.json(createApiResponse(true, { levels, total }));
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
    logger.info('Fetching warehouse locations', { source: 'warehouseRoutes', method: 'getLocations' });

    const { limit = 50, offset = 0, warehouse_id, zone_id, aisle_id } = req.query;
    const where: any = { deleted_at: null };

    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }
    if (zone_id) {
      where.zone_id = zone_id;
    }
    if (aisle_id) {
      where.aisle_id = aisle_id;
    }

    const locations = await prisma.locations.findMany({
      where,
      include: {
        aisles: {
          select: {
            aisle_id: true,
            aisle_name: true,
            aisle_code: true
          }
        },
        zones: {
          select: {
            zone_id: true,
            zone_name: true,
            zone_code: true
          }
        },
        warehouses: {
          select: {
            warehouse_id: true,
            warehouse_name: true,
            warehouse_code: true
          }
        }
      },
      orderBy: { location_name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.locations.count({ where });

    logger.info('Locations fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getLocations',
      count: locations.length
    });

    res.json(createApiResponse(true, { locations, total }));
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

    const { limit = 50, offset = 0, warehouse_id, product_id, bin_id, status } = req.query;
    const where: any = { deleted_at: null };

    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }
    if (product_id) {
      where.product_id = product_id;
    }
    if (bin_id) {
      where.bin_id = bin_id;
    }
    if (status) {
      where.status = status;
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        products: {
          select: {
            product_id: true,
            product_name: true,
            product_code: true,
            sku: true
          }
        },
        warehouses: {
          select: {
            warehouse_id: true,
            warehouse_name: true,
            warehouse_code: true
          }
        },
        bins: {
          select: {
            bin_id: true,
            bin_code: true,
            bin_name: true
          }
        }
      },
      orderBy: { updated_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.inventory.count({ where });

    logger.info('Inventory fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getInventory',
      count: inventory.length
    });

    res.json(createApiResponse(true, { inventory, total }));
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

    const { limit = 50, offset = 0, warehouse_id, product_id, movement_type, from_bin_id, to_bin_id, date_from, date_to } = req.query;
    const where: any = { deleted_at: null };

    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }
    if (product_id) {
      where.product_id = product_id;
    }
    if (movement_type) {
      where.movement_type = movement_type;
    }
    if (from_bin_id) {
      where.from_bin_id = from_bin_id;
    }
    if (to_bin_id) {
      where.to_bin_id = to_bin_id;
    }
    if (date_from || date_to) {
      where.movement_date = {};
      if (date_from) {
        where.movement_date.gte = new Date(date_from as string);
      }
      if (date_to) {
        where.movement_date.lte = new Date(date_to as string);
      }
    }

    const movements = await prisma.inventory_movements.findMany({
      where,
      include: {
        products: {
          select: {
            product_id: true,
            product_name: true,
            product_code: true,
            sku: true
          }
        },
        warehouses: {
          select: {
            warehouse_id: true,
            warehouse_name: true,
            warehouse_code: true
          }
        },
        bins_inventory_movements_from_bin_idTobins: {
          select: {
            bin_id: true,
            bin_code: true,
            bin_name: true
          }
        },
        bins_inventory_movements_to_bin_idTobins: {
          select: {
            bin_id: true,
            bin_code: true,
            bin_name: true
          }
        }
      },
      orderBy: { movement_date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.inventory_movements.count({ where });

    logger.info('Inventory movements fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getInventoryMovements',
      count: movements.length
    });

    res.json(createApiResponse(true, { movements, total }));
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
    logger.info('Fetching inventory counts', { source: 'warehouseRoutes', method: 'getInventoryCounts' });

    const { limit = 50, offset = 0, warehouse_id, status, count_type, date_from, date_to } = req.query;
    const where: any = { deleted_at: null };

    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }
    if (status) {
      where.status = status;
    }
    if (count_type) {
      where.count_type = count_type;
    }
    if (date_from || date_to) {
      where.count_date = {};
      if (date_from) {
        where.count_date.gte = new Date(date_from as string);
      }
      if (date_to) {
        where.count_date.lte = new Date(date_to as string);
      }
    }

    const counts = await prisma.inventory_counts.findMany({
      where,
      include: {
        warehouses: {
          select: {
            warehouse_id: true,
            warehouse_name: true,
            warehouse_code: true
          }
        }
      },
      orderBy: { count_date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.inventory_counts.count({ where });

    logger.info('Inventory counts fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getInventoryCounts',
      count: counts.length
    });

    res.json(createApiResponse(true, { counts, total }));
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
    logger.info('Fetching inventory count details', { source: 'warehouseRoutes', method: 'getInventoryCountDetails' });

    const { limit = 50, offset = 0, count_id, product_id, bin_id, variance_threshold } = req.query;
    const where: any = { deleted_at: null };

    if (count_id) {
      where.count_id = count_id;
    }
    if (product_id) {
      where.product_id = product_id;
    }
    if (bin_id) {
      where.bin_id = bin_id;
    }
    if (variance_threshold) {
      const threshold = parseFloat(variance_threshold as string);
      where.OR = [
        {
          variance_quantity: {
            gte: threshold
          }
        },
        {
          variance_quantity: {
            lte: -threshold
          }
        }
      ];
    }

    const details = await prisma.inventory_count_details.findMany({
      where,
      include: {
        inventory_counts: {
          select: {
            count_id: true,
            count_date: true,
            count_type: true,
            status: true
          }
        },
        products: {
          select: {
            product_id: true,
            product_name: true,
            product_code: true,
            sku: true
          }
        },
        bins: {
          select: {
            bin_id: true,
            bin_code: true,
            bin_name: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.inventory_count_details.count({ where });

    logger.info('Inventory count details fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getInventoryCountDetails',
      count: details.length
    });

    res.json(createApiResponse(true, { details, total }));
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
    logger.info('Fetching inventory reservations', { source: 'warehouseRoutes', method: 'getInventoryReservations' });

    const { limit = 50, offset = 0, warehouse_id, product_id, bin_id, reservation_type, status, date_from, date_to } = req.query;
    const where: any = { deleted_at: null };

    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }
    if (product_id) {
      where.product_id = product_id;
    }
    if (bin_id) {
      where.bin_id = bin_id;
    }
    if (reservation_type) {
      where.reservation_type = reservation_type;
    }
    if (status) {
      where.status = status;
    }
    if (date_from || date_to) {
      where.reserved_date = {};
      if (date_from) {
        where.reserved_date.gte = new Date(date_from as string);
      }
      if (date_to) {
        where.reserved_date.lte = new Date(date_to as string);
      }
    }

    const reservations = await prisma.inventory_reservations.findMany({
      where,
      include: {
        products: {
          select: {
            product_id: true,
            product_name: true,
            product_code: true,
            sku: true
          }
        },
        warehouses: {
          select: {
            warehouse_id: true,
            warehouse_name: true,
            warehouse_code: true
          }
        },
        bins: {
          select: {
            bin_id: true,
            bin_code: true,
            bin_name: true
          }
        }
      },
      orderBy: { reserved_date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.inventory_reservations.count({ where });

    logger.info('Inventory reservations fetched successfully', {
      source: 'warehouseRoutes',
      method: 'getInventoryReservations',
      count: reservations.length
    });

    res.json(createApiResponse(true, { reservations, total }));
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