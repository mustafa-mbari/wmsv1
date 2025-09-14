// prisma/seeds/classes/InventoryInventorySeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '../../../../src/utils/logger/logger';

export interface InventorySeedData {
  inventory_id: string;
  product_id?: string;
  location_id?: string;
  quantity?: number;
  uom_id?: string;
  min_stock_level?: number;
  max_stock_level?: number;
  reorder_point?: number;
  lot_number?: string;
  serial_number?: string;
  production_date?: string;
  expiry_date?: string;
  status?: string;
  is_active?: boolean;
  quality_status?: string;
  temperature_zone?: string;
  weight?: number;
  dimensions?: string;
  hazard_class?: string;
  owner_id?: string;
  supplier_id?: string;
  barcode?: string;
  rfid_tag?: string;
}

export class InventoryInventorySeeder extends BaseSeed<InventorySeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'inventory_inventory';
  }

  getJsonFileName(): string {
    return 'inventory/inventory.json';
  }

  getDependencies(): string[] {
    return ['products', 'warehouses', 'warehouse_locations'];
  }

  validateRecord(record: InventorySeedData): boolean {
    // Required fields validation
    if (!record.inventory_id) {
      logger.error('Inventory record missing required inventory_id field', { source: 'InventoryInventorySeeder', method: 'validateRecord', record });
      return false;
    }

    // Quantity validation
    if (record.quantity !== undefined && record.quantity < 0) {
      logger.error('Inventory quantity cannot be negative', { source: 'InventoryInventorySeeder', method: 'validateRecord', quantity: record.quantity });
      return false;
    }

    // Stock level validation
    if (record.min_stock_level !== undefined && record.min_stock_level < 0) {
      logger.error('Min stock level cannot be negative', { source: 'InventoryInventorySeeder', method: 'validateRecord', min_stock_level: record.min_stock_level });
      return false;
    }

    if (record.max_stock_level !== undefined && record.max_stock_level < 0) {
      logger.error('Max stock level cannot be negative', { source: 'InventoryInventorySeeder', method: 'validateRecord', max_stock_level: record.max_stock_level });
      return false;
    }

    // Date validation
    if (record.production_date && isNaN(Date.parse(record.production_date))) {
      logger.error('Invalid production date format', { source: 'InventoryInventorySeeder', method: 'validateRecord', production_date: record.production_date });
      return false;
    }

    if (record.expiry_date && isNaN(Date.parse(record.expiry_date))) {
      logger.error('Invalid expiry date format', { source: 'InventoryInventorySeeder', method: 'validateRecord', expiry_date: record.expiry_date });
      return false;
    }

    return true;
  }

  transformRecord(record: InventorySeedData): any {
    return {
      inventory_id: record.inventory_id.trim(),
      product_id: record.product_id?.trim() || null,
      location_id: record.location_id?.trim() || null,
      quantity: record.quantity || 0,
      uom_id: record.uom_id?.trim() || null,
      min_stock_level: record.min_stock_level || 0,
      max_stock_level: record.max_stock_level || null,
      reorder_point: record.reorder_point || null,
      lot_number: record.lot_number?.trim() || null,
      serial_number: record.serial_number?.trim() || null,
      production_date: record.production_date ? new Date(record.production_date) : null,
      expiry_date: record.expiry_date ? new Date(record.expiry_date) : null,
      last_movement_date: new Date(),
      status: record.status?.trim() || 'available',
      is_active: record.is_active !== false,
      quality_status: record.quality_status?.trim() || 'approved',
      temperature_zone: record.temperature_zone?.trim() || null,
      weight: record.weight || null,
      dimensions: record.dimensions?.trim() || null,
      hazard_class: record.hazard_class?.trim() || null,
      owner_id: record.owner_id?.trim() || null,
      supplier_id: record.supplier_id?.trim() || null,
      customs_info: null,
      barcode: record.barcode?.trim() || null,
      rfid_tag: record.rfid_tag?.trim() || null,
      last_audit_date: null,
      audit_notes: null,
      approval_date: new Date(),
      approved_by: null
    };
  }

  async findExistingRecord(record: InventorySeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { inventory_id: record.inventory_id }
      });
    });
  }
}