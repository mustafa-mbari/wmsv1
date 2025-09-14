// prisma/seeds/classes/InventoryInventoryCountDetailsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface InventoryCountDetailSeedData {
  count_detail_id: string;
  count_id?: string;
  inventory_id?: string;
  expected_quantity?: number;
  counted_quantity?: number;
  recount_quantity?: number;
  uom_id?: string;
  variance?: number;
  variance_percentage?: number;
  status?: string;
  count_method?: string;
  device_id?: string;
  counted_by?: string;
  counted_at?: string;
  recount_by?: string;
  recount_at?: string;
  recount_status?: string;
  adjustment_id?: string;
  adjustment_by?: string;
  adjustment_date?: string;
  location_verified?: boolean;
  batch_verified?: boolean;
  expiry_verified?: boolean;
  item_condition?: string;
  notes?: string;
}

export class InventoryInventoryCountDetailsSeeder extends BaseSeed<InventoryCountDetailSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'inventory_count_details';
  }

  getJsonFileName(): string {
    return 'inventory/inventory-count-details.json';
  }

  getDependencies(): string[] {
    return ['inventory_counts', 'inventory'];
  }

  validateRecord(record: InventoryCountDetailSeedData): boolean {
    // Required fields validation
    if (!record.count_detail_id) {
      logger.error('Inventory count detail record missing required count_detail_id field', { source: 'InventoryInventoryCountDetailsSeeder', method: 'validateRecord', record });
      return false;
    }

    // Quantity validation
    if (record.expected_quantity !== undefined && record.expected_quantity < 0) {
      logger.error('Expected quantity cannot be negative', { source: 'InventoryInventoryCountDetailsSeeder', method: 'validateRecord', expected_quantity: record.expected_quantity });
      return false;
    }

    if (record.counted_quantity !== undefined && record.counted_quantity < 0) {
      logger.error('Counted quantity cannot be negative', { source: 'InventoryInventoryCountDetailsSeeder', method: 'validateRecord', counted_quantity: record.counted_quantity });
      return false;
    }

    if (record.recount_quantity !== undefined && record.recount_quantity < 0) {
      logger.error('Recount quantity cannot be negative', { source: 'InventoryInventoryCountDetailsSeeder', method: 'validateRecord', recount_quantity: record.recount_quantity });
      return false;
    }

    // Date validation
    if (record.counted_at && isNaN(Date.parse(record.counted_at))) {
      logger.error('Invalid counted at date format', { source: 'InventoryInventoryCountDetailsSeeder', method: 'validateRecord', counted_at: record.counted_at });
      return false;
    }

    if (record.recount_at && isNaN(Date.parse(record.recount_at))) {
      logger.error('Invalid recount at date format', { source: 'InventoryInventoryCountDetailsSeeder', method: 'validateRecord', recount_at: record.recount_at });
      return false;
    }

    if (record.adjustment_date && isNaN(Date.parse(record.adjustment_date))) {
      logger.error('Invalid adjustment date format', { source: 'InventoryInventoryCountDetailsSeeder', method: 'validateRecord', adjustment_date: record.adjustment_date });
      return false;
    }

    return true;
  }

  transformRecord(record: InventoryCountDetailSeedData): any {
    const expectedQty = record.expected_quantity || 0;
    const countedQty = record.counted_quantity || 0;
    const variance = countedQty - expectedQty;
    const variancePercentage = expectedQty > 0 ? (variance / expectedQty) * 100 : 0;

    return {
      count_detail_id: record.count_detail_id.trim(),
      count_id: record.count_id?.trim() || null,
      inventory_id: record.inventory_id?.trim() || null,
      expected_quantity: expectedQty,
      counted_quantity: countedQty,
      recount_quantity: record.recount_quantity || null,
      uom_id: record.uom_id?.trim() || null,
      variance: record.variance !== undefined ? record.variance : variance,
      variance_percentage: record.variance_percentage !== undefined ? record.variance_percentage : variancePercentage,
      status: record.status?.trim() || 'counted',
      count_method: record.count_method?.trim() || 'manual',
      device_id: record.device_id?.trim() || null,
      counted_by: record.counted_by?.trim() || null,
      counted_at: record.counted_at ? new Date(record.counted_at) : null,
      recount_by: record.recount_by?.trim() || null,
      recount_at: record.recount_at ? new Date(record.recount_at) : null,
      recount_status: record.recount_status?.trim() || null,
      adjustment_id: record.adjustment_id?.trim() || null,
      adjustment_by: record.adjustment_by?.trim() || null,
      adjustment_date: record.adjustment_date ? new Date(record.adjustment_date) : null,
      location_verified: record.location_verified === true,
      batch_verified: record.batch_verified === true,
      expiry_verified: record.expiry_verified === true,
      item_condition: record.item_condition?.trim() || 'good',
      notes: record.notes?.trim() || null
    };
  }

  async findExistingRecord(record: InventoryCountDetailSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { count_detail_id: record.count_detail_id }
      });
    });
  }
}