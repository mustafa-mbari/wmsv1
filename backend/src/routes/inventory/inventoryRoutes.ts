import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';
import logger from '../../utils/logger/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/inventory - Get all inventory records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      location_id,
      product_id,
      status,
      quality_status,
      is_active,
      limit = 50,
      offset = 0,
      search
    } = req.query;

    const where: any = { deleted_at: null };
    if (location_id) where.location_id = location_id;
    if (product_id) where.product_id = product_id;
    if (status) where.status = status;
    if (quality_status) where.quality_status = quality_status;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    if (search) {
      where.OR = [
        { inventory_id: { contains: search, mode: 'insensitive' } },
        { lot_number: { contains: search, mode: 'insensitive' } },
        { serial_number: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ];
    }

    const inventory = await prisma.inventory.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.inventory.count({ where });

    logger.info('Inventory records retrieved successfully', {
      source: 'inventoryRoutes',
      method: 'getInventory',
      count: inventory.length
    });

    res.json(createApiResponse(true, { inventory, total }));
  } catch (error: any) {
    logger.error('Error retrieving inventory', {
      source: 'inventoryRoutes',
      method: 'getInventory',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory')
    );
  }
});

// GET /api/inventory/:id - Get inventory record by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const inventoryRecord = await prisma.inventory.findFirst({
      where: {
        inventory_id: id,
        deleted_at: null
      }
    });

    if (!inventoryRecord) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Inventory record not found')
      );
    }

    logger.info('Inventory record retrieved successfully', {
      source: 'inventoryRoutes',
      method: 'getInventoryById',
      inventoryId: id
    });

    res.json(createApiResponse(true, inventoryRecord));
  } catch (error: any) {
    logger.error('Error retrieving inventory record', {
      source: 'inventoryRoutes',
      method: 'getInventoryById',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory record')
    );
  }
});

// POST /api/inventory - Create new inventory record
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      inventory_id,
      product_id,
      location_id,
      quantity,
      uom_id,
      min_stock_level,
      max_stock_level,
      reorder_point,
      lot_number,
      serial_number,
      production_date,
      expiry_date,
      status,
      is_active = true,
      quality_status,
      temperature_zone,
      weight,
      dimensions,
      hazard_class,
      owner_id,
      supplier_id,
      customs_info,
      barcode,
      rfid_tag,
      audit_notes
    } = req.body;
    const userId = req.user?.id;

    const inventory = await prisma.inventory.create({
      data: {
        inventory_id,
        product_id,
        location_id,
        quantity,
        uom_id,
        min_stock_level,
        max_stock_level,
        reorder_point,
        lot_number,
        serial_number,
        production_date: production_date ? new Date(production_date) : null,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        last_movement_date: new Date(),
        status,
        is_active,
        quality_status,
        temperature_zone,
        weight,
        dimensions,
        hazard_class,
        owner_id,
        supplier_id,
        customs_info,
        barcode,
        rfid_tag,
        audit_notes,
        created_by: userId,
        updated_by: userId
      }
    });

    logger.info('Inventory record created successfully', {
      source: 'inventoryRoutes',
      method: 'createInventory',
      inventoryId: inventory.inventory_id,
      userId
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, inventory));
  } catch (error: any) {
    logger.error('Error creating inventory record', {
      source: 'inventoryRoutes',
      method: 'createInventory',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create inventory record')
    );
  }
});

// PUT /api/inventory/:id - Update inventory record
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_id,
      location_id,
      quantity,
      uom_id,
      min_stock_level,
      max_stock_level,
      reorder_point,
      lot_number,
      serial_number,
      production_date,
      expiry_date,
      status,
      is_active,
      quality_status,
      temperature_zone,
      weight,
      dimensions,
      hazard_class,
      owner_id,
      supplier_id,
      customs_info,
      barcode,
      rfid_tag,
      audit_notes
    } = req.body;
    const userId = req.user?.id;

    const existingInventory = await prisma.inventory.findFirst({
      where: {
        inventory_id: id,
        deleted_at: null
      }
    });

    if (!existingInventory) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Inventory record not found')
      );
    }

    const inventory = await prisma.inventory.update({
      where: { inventory_id: id },
      data: {
        product_id,
        location_id,
        quantity,
        uom_id,
        min_stock_level,
        max_stock_level,
        reorder_point,
        lot_number,
        serial_number,
        production_date: production_date ? new Date(production_date) : null,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        last_movement_date: new Date(),
        status,
        is_active,
        quality_status,
        temperature_zone,
        weight,
        dimensions,
        hazard_class,
        owner_id,
        supplier_id,
        customs_info,
        barcode,
        rfid_tag,
        audit_notes,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    logger.info('Inventory record updated successfully', {
      source: 'inventoryRoutes',
      method: 'updateInventory',
      inventoryId: id,
      userId
    });

    res.json(createApiResponse(true, inventory));
  } catch (error: any) {
    logger.error('Error updating inventory record', {
      source: 'inventoryRoutes',
      method: 'updateInventory',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update inventory record')
    );
  }
});

// GET /api/inventory/low-stock - Get low stock items
router.get('/reports/low-stock', authenticateToken, async (req, res) => {
  try {
    const { location_id } = req.query;

    const where: any = {
      deleted_at: null,
      is_active: true,
      quantity: { not: null },
      min_stock_level: { not: null }
    };

    if (location_id) where.location_id = location_id;

    const lowStockItems = await prisma.$queryRaw`
      SELECT * FROM inventory.inventory
      WHERE deleted_at IS NULL
      AND is_active = true
      AND quantity IS NOT NULL
      AND min_stock_level IS NOT NULL
      AND quantity <= min_stock_level
      ${location_id ? Prisma.sql`AND location_id = ${location_id}` : Prisma.empty}
      ORDER BY (quantity / NULLIF(min_stock_level, 0)) ASC
    `;

    logger.info('Low stock items retrieved successfully', {
      source: 'inventoryRoutes',
      method: 'getLowStockItems',
      count: (lowStockItems as any[]).length
    });

    res.json(createApiResponse(true, lowStockItems));
  } catch (error: any) {
    logger.error('Error retrieving low stock items', {
      source: 'inventoryRoutes',
      method: 'getLowStockItems',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve low stock items')
    );
  }
});

// DELETE /api/inventory/:id - Delete inventory record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const existingInventory = await prisma.inventory.findFirst({
      where: {
        inventory_id: id,
        deleted_at: null
      }
    });

    if (!existingInventory) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Inventory record not found')
      );
    }

    await prisma.inventory.delete({
      where: { inventory_id: id }
    });

    logger.info('Inventory record deleted successfully', {
      source: 'inventoryRoutes',
      method: 'deleteInventory',
      inventoryId: id,
      userId
    });

    res.json(createApiResponse(true, null, 'Inventory record deleted successfully'));
  } catch (error: any) {
    logger.error('Error deleting inventory record', {
      source: 'inventoryRoutes',
      method: 'deleteInventory',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete inventory record')
    );
  }
});

export default router;