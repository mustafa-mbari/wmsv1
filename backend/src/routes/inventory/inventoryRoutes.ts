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

    // Transform inventory data with all database fields
    const inventoryWithDetails = inventory.map((inv) => {
      return {
        // All database fields
        inventory_id: inv.inventory_id,
        product_id: inv.product_id,
        location_id: inv.location_id,
        quantity: Number(inv.quantity || 0),
        uom_id: inv.uom_id,
        min_stock_level: Number(inv.min_stock_level || 0),
        max_stock_level: Number(inv.max_stock_level || 0),
        reorder_point: Number(inv.reorder_point || 0),
        lot_number: inv.lot_number,
        serial_number: inv.serial_number,
        production_date: inv.production_date,
        expiry_date: inv.expiry_date,
        last_movement_date: inv.last_movement_date,
        status: inv.status,
        is_active: inv.is_active,
        quality_status: inv.quality_status,
        temperature_zone: inv.temperature_zone,
        weight: Number(inv.weight || 0),
        dimensions: inv.dimensions,
        hazard_class: inv.hazard_class,
        owner_id: inv.owner_id,
        supplier_id: inv.supplier_id,
        customs_info: inv.customs_info,
        barcode: inv.barcode,
        rfid_tag: inv.rfid_tag,
        last_audit_date: inv.last_audit_date,
        audit_notes: inv.audit_notes,
        approval_date: inv.approval_date,
        approved_by: inv.approved_by,
        created_at: inv.created_at,
        updated_at: inv.updated_at,
        deleted_at: inv.deleted_at,
        created_by: inv.created_by,
        updated_by: inv.updated_by,
        deleted_by: inv.deleted_by,
        // Computed fields for frontend compatibility (simplified)
        product_name: inv.product_id, // Use product_id as name for now
        location_code: inv.location_id, // Use location_id as code for now
        batch_number: inv.lot_number, // Alias
        expiration_date: inv.expiry_date, // Alias
        quantity_on_hand: Number(inv.quantity || 0), // Alias
        quantity_available: Number(inv.quantity || 0), // Simplified for now
        quantity_reserved: 0, // Can be calculated from reservations table if needed
        quantity_allocated: 0, // Can be calculated if allocation system exists
        unit_cost: Number(inv.weight || 0) // Using weight as cost for demo
      };
    });

    const total = await prisma.inventory.count({ where });

    logger.info('Inventory records retrieved successfully', {
      source: 'inventoryRoutes',
      method: 'getInventory',
      count: inventory.length
    });

    res.json(createApiResponse(true, { inventory: inventoryWithDetails, total }));
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

// GET /api/inventory/movements - Get inventory movements
router.get('/movements', authenticateToken, async (req, res) => {
  try {
    const {
      inventory_id,
      movement_type,
      reference_type,
      limit = 50,
      offset = 0
    } = req.query;

    const where: any = { deleted_at: null };
    if (inventory_id) where.inventory_id = inventory_id;
    if (movement_type) where.movement_type = movement_type;
    if (reference_type) where.reference_type = reference_type;

    const movements = await prisma.inventory_movements.findMany({
      where,
      orderBy: { movement_date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Transform movement data with all database fields
    const movementsWithDetails = movements.map((mov) => {
      return {
        // All database fields
        movement_id: mov.movement_id,
        inventory_id: mov.inventory_id,
        source_location_id: mov.source_location_id,
        destination_location_id: mov.destination_location_id,
        quantity: Number(mov.quantity || 0),
        uom_id: mov.uom_id,
        movement_type: mov.movement_type,
        movement_reason: mov.movement_reason,
        reference_id: mov.reference_id,
        reference_type: mov.reference_type,
        batch_number: mov.batch_number,
        movement_date: mov.movement_date,
        performed_by: mov.performed_by,
        system_generated: mov.system_generated,
        approval_status: mov.approval_status,
        approval_date: mov.approval_date,
        approved_by: mov.approved_by,
        transaction_value: Number(mov.transaction_value || 0),
        currency: mov.currency,
        movement_cost: Number(mov.movement_cost || 0),
        transport_mode: mov.transport_mode,
        carrier_id: mov.carrier_id,
        tracking_number: mov.tracking_number,
        expected_arrival: mov.expected_arrival,
        actual_arrival: mov.actual_arrival,
        notes: mov.notes,
        created_at: mov.created_at,
        deleted_at: mov.deleted_at,
        created_by: mov.created_by,
        updated_by: mov.updated_by,
        deleted_by: mov.deleted_by,
        // Computed fields for frontend compatibility
        total_cost: Number(mov.transaction_value || 0),
        unit_cost: mov.quantity && mov.transaction_value ?
          Number(mov.transaction_value) / Number(mov.quantity) : null,
        product_name: mov.inventory_id, // Use inventory_id as product name for now
        from_location_code: mov.source_location_id,
        to_location_code: mov.destination_location_id,
        from_location_id: mov.source_location_id, // Alias
        to_location_id: mov.destination_location_id, // Alias
        created_by_name: mov.performed_by,
        reason: mov.movement_reason // Alias
      };
    });

    const total = await prisma.inventory_movements.count({ where });

    logger.info('Inventory movements retrieved successfully', {
      source: 'inventoryRoutes',
      method: 'getInventoryMovements',
      count: movements.length
    });

    res.json(createApiResponse(true, { movements: movementsWithDetails, total }));
  } catch (error: any) {
    logger.error('Error retrieving inventory movements', {
      source: 'inventoryRoutes',
      method: 'getInventoryMovements',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory movements')
    );
  }
});

// GET /api/inventory/counts - Get inventory counts
router.get('/counts', authenticateToken, async (req, res) => {
  try {
    const {
      warehouse_id,
      status,
      count_type,
      limit = 50,
      offset = 0
    } = req.query;

    const where: any = { deleted_at: null };
    if (warehouse_id) where.warehouse_id = warehouse_id;
    if (status) where.status = status;
    if (count_type) where.count_type = count_type;

    const counts = await prisma.inventory_counts.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Transform counts data with all database fields
    const countsWithDetails = counts.map((count) => {
      return {
        // All database fields
        count_id: count.count_id,
        warehouse_id: count.warehouse_id,
        count_name: count.count_name,
        count_type: count.count_type,
        status: count.status,
        start_date: count.start_date,
        end_date: count.end_date,
        expected_completion: count.expected_completion,
        team_leader: count.team_leader,
        count_team: count.count_team,
        count_method: count.count_method,
        count_frequency: count.count_frequency,
        count_zone: count.count_zone,
        count_category: count.count_category,
        variance_threshold: Number(count.variance_threshold || 0),
        is_approved: count.is_approved,
        approved_at: count.approved_at,
        approved_by: count.approved_by,
        is_recount: count.is_recount,
        original_count_id: count.original_count_id,
        priority: count.priority,
        notes: count.notes,
        created_at: count.created_at,
        updated_at: count.updated_at,
        deleted_at: count.deleted_at,
        created_by: count.created_by,
        updated_by: count.updated_by,
        deleted_by: count.deleted_by,
        // Computed fields for frontend compatibility
        scheduled_date: count.start_date, // Alias
        started_date: count.start_date, // Alias
        completed_date: count.end_date, // Alias
        total_locations: 0, // Would need to calculate from count details
        counted_locations: 0, // Would need to calculate from count details
        total_items: 0, // Would need to calculate from count details
        counted_items: 0, // Would need to calculate from count details
        discrepancies_found: 0, // Would need to calculate from count details
        warehouse_name: count.warehouse_id,
        created_by_name: count.created_by,
        assigned_to_name: count.team_leader,
        assigned_to: count.team_leader // Alias
      };
    });

    const total = await prisma.inventory_counts.count({ where });

    logger.info('Inventory counts retrieved successfully', {
      source: 'inventoryRoutes',
      method: 'getInventoryCounts',
      count: counts.length
    });

    res.json(createApiResponse(true, { counts: countsWithDetails, total }));
  } catch (error: any) {
    logger.error('Error retrieving inventory counts', {
      source: 'inventoryRoutes',
      method: 'getInventoryCounts',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory counts')
    );
  }
});

// GET /api/inventory/count-details - Get inventory count details
router.get('/count-details', authenticateToken, async (req, res) => {
  try {
    const {
      count_id,
      location_id,
      is_discrepancy,
      limit = 50,
      offset = 0
    } = req.query;

    const where: any = { deleted_at: null };
    if (count_id) where.count_id = count_id;

    const details = await prisma.inventory_count_details.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Transform details data with all database fields
    const detailsWithData = details.map((detail) => {
      const expectedQty = Number(detail.expected_quantity || 0);
      const countedQty = Number(detail.counted_quantity || 0);
      const variance = countedQty - expectedQty;

      return {
        // All database fields
        count_detail_id: detail.count_detail_id,
        count_id: detail.count_id,
        inventory_id: detail.inventory_id,
        expected_quantity: Number(detail.expected_quantity || 0),
        counted_quantity: Number(detail.counted_quantity || 0),
        recount_quantity: Number(detail.recount_quantity || 0),
        uom_id: detail.uom_id,
        variance: Number(detail.variance || 0),
        variance_percentage: Number(detail.variance_percentage || 0),
        status: detail.status,
        count_method: detail.count_method,
        device_id: detail.device_id,
        counted_by: detail.counted_by,
        counted_at: detail.counted_at,
        recount_by: detail.recount_by,
        recount_at: detail.recount_at,
        recount_status: detail.recount_status,
        adjustment_id: detail.adjustment_id,
        adjustment_by: detail.adjustment_by,
        adjustment_date: detail.adjustment_date,
        location_verified: detail.location_verified,
        batch_verified: detail.batch_verified,
        expiry_verified: detail.expiry_verified,
        item_condition: detail.item_condition,
        notes: detail.notes,
        created_at: detail.created_at,
        updated_at: detail.updated_at,
        deleted_at: detail.deleted_at,
        created_by: detail.created_by,
        updated_by: detail.updated_by,
        deleted_by: detail.deleted_by,
        // Computed fields for frontend compatibility
        detail_id: detail.count_detail_id, // Alias
        product_id: detail.inventory_id, // Use inventory_id as product_id for now
        location_id: detail.inventory_id, // Use inventory_id as location_id for now
        variance_value: variance * 0, // Would need unit cost to calculate
        is_discrepancy: Math.abs(variance) > 0,
        is_resolved: detail.status === 'resolved',
        counted_date: detail.counted_at, // Alias
        count_name: detail.count_id,
        product_name: detail.inventory_id,
        location_code: detail.inventory_id,
        counted_by_name: detail.counted_by,
        unit_cost: 0 // Would need to lookup from products table
      };
    });

    const total = await prisma.inventory_count_details.count({ where });

    logger.info('Inventory count details retrieved successfully', {
      source: 'inventoryRoutes',
      method: 'getInventoryCountDetails',
      count: details.length
    });

    res.json(createApiResponse(true, { details: detailsWithData, total }));
  } catch (error: any) {
    logger.error('Error retrieving inventory count details', {
      source: 'inventoryRoutes',
      method: 'getInventoryCountDetails',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory count details')
    );
  }
});

// GET /api/inventory/reservations - Get inventory reservations
router.get('/reservations', authenticateToken, async (req, res) => {
  try {
    const {
      inventory_id,
      reference_type,
      status,
      reservation_type,
      limit = 50,
      offset = 0
    } = req.query;

    const where: any = { deleted_at: null };
    if (inventory_id) where.inventory_id = inventory_id;
    if (reference_type) where.reference_type = reference_type;
    if (status) where.status = status;
    if (reservation_type) where.reservation_type = reservation_type;

    const reservations = await prisma.inventory_reservations.findMany({
      where,
      orderBy: { reserved_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Transform reservations data with all database fields
    const reservationsWithDetails = reservations.map((reservation) => {
      return {
        // All database fields
        reservation_id: reservation.reservation_id,
        reservation_number: reservation.reservation_number,
        product_id: reservation.product_id,
        inventory_id: reservation.inventory_id,
        location_id: reservation.location_id,
        quantity: Number(reservation.quantity || 0),
        uom_id: reservation.uom_id,
        reservation_type: reservation.reservation_type,
        status: reservation.status,
        reference_id: reservation.reference_id,
        reference_type: reservation.reference_type,
        reserved_at: reservation.reserved_at,
        expires_at: reservation.expires_at,
        released_at: reservation.released_at,
        reserved_by: reservation.reserved_by,
        released_by: reservation.released_by,
        notes: reservation.notes,
        priority: reservation.priority,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
        deleted_at: reservation.deleted_at,
        created_by: reservation.created_by,
        updated_by: reservation.updated_by,
        deleted_by: reservation.deleted_by,
        // Computed fields for frontend compatibility
        reserved_quantity: Number(reservation.quantity || 0), // Alias
        reserved_date: reservation.reserved_at, // Alias
        expiration_date: reservation.expires_at, // Alias
        released_date: reservation.released_at, // Alias
        product_name: reservation.product_id,
        location_code: reservation.location_id,
        created_by_name: reservation.reserved_by,
        released_by_name: reservation.released_by,
        is_active: reservation.status === 'active'
      };
    });

    const total = await prisma.inventory_reservations.count({ where });

    logger.info('Inventory reservations retrieved successfully', {
      source: 'inventoryRoutes',
      method: 'getInventoryReservations',
      count: reservations.length
    });

    res.json(createApiResponse(true, { reservations: reservationsWithDetails, total }));
  } catch (error: any) {
    logger.error('Error retrieving inventory reservations', {
      source: 'inventoryRoutes',
      method: 'getInventoryReservations',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve inventory reservations')
    );
  }
});

// Other endpoints (unchanged)...
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

export default router;