// prisma/seeds/classes/WarehouseBinContentsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface BinContentSeedData {
  content_id?: number;
  bin_id?: string;
  product_id?: string;
  batch_number?: string;
  serial_number?: string;
  quantity?: number;
  uom?: string;
  min_quantity?: number;
  max_quantity?: number;
  storage_condition?: string;
  putaway_date?: string;
  last_accessed?: string;
  expiration_date?: string;
  quality_status?: string;
  inspection_required?: boolean;
  last_inspection_date?: string;
  inspection_due_date?: string;
  source_document?: string;
  source_reference?: string;
  is_locked?: boolean;
  locked_by?: string;
  locked_at?: string;
  lock_reason?: string;
}

export class WarehouseBinContentsSeeder extends BaseSeed<BinContentSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'bin_contents';
  }

  getJsonFileName(): string {
    return 'warehouse/bin-contents.json';
  }

  getDependencies(): string[] {
    return ['bins', 'products'];
  }

  validateRecord(record: BinContentSeedData): boolean {
    // Quantity validation
    if (record.quantity !== undefined && record.quantity < 0) {
      logger.error('Quantity cannot be negative', { source: 'WarehouseBinContentsSeeder', method: 'validateRecord', quantity: record.quantity });
      return false;
    }

    if (record.min_quantity !== undefined && record.min_quantity < 0) {
      logger.error('Min quantity cannot be negative', { source: 'WarehouseBinContentsSeeder', method: 'validateRecord', min_quantity: record.min_quantity });
      return false;
    }

    if (record.max_quantity !== undefined && record.max_quantity < 0) {
      logger.error('Max quantity cannot be negative', { source: 'WarehouseBinContentsSeeder', method: 'validateRecord', max_quantity: record.max_quantity });
      return false;
    }

    // Date validation
    if (record.putaway_date && isNaN(Date.parse(record.putaway_date))) {
      logger.error('Invalid putaway date format', { source: 'WarehouseBinContentsSeeder', method: 'validateRecord', putaway_date: record.putaway_date });
      return false;
    }

    if (record.last_accessed && isNaN(Date.parse(record.last_accessed))) {
      logger.error('Invalid last accessed date format', { source: 'WarehouseBinContentsSeeder', method: 'validateRecord', last_accessed: record.last_accessed });
      return false;
    }

    if (record.expiration_date && isNaN(Date.parse(record.expiration_date))) {
      logger.error('Invalid expiration date format', { source: 'WarehouseBinContentsSeeder', method: 'validateRecord', expiration_date: record.expiration_date });
      return false;
    }

    if (record.last_inspection_date && isNaN(Date.parse(record.last_inspection_date))) {
      logger.error('Invalid last inspection date format', { source: 'WarehouseBinContentsSeeder', method: 'validateRecord', last_inspection_date: record.last_inspection_date });
      return false;
    }

    if (record.inspection_due_date && isNaN(Date.parse(record.inspection_due_date))) {
      logger.error('Invalid inspection due date format', { source: 'WarehouseBinContentsSeeder', method: 'validateRecord', inspection_due_date: record.inspection_due_date });
      return false;
    }

    if (record.locked_at && isNaN(Date.parse(record.locked_at))) {
      logger.error('Invalid locked at date format', { source: 'WarehouseBinContentsSeeder', method: 'validateRecord', locked_at: record.locked_at });
      return false;
    }

    return true;
  }

  transformRecord(record: BinContentSeedData): any {
    return {
      bin_id: record.bin_id?.trim() || null,
      product_id: record.product_id?.trim() || null,
      batch_number: record.batch_number?.trim() || null,
      serial_number: record.serial_number?.trim() || null,
      quantity: record.quantity || 0,
      uom: record.uom?.trim() || null,
      min_quantity: record.min_quantity || null,
      max_quantity: record.max_quantity || null,
      storage_condition: record.storage_condition?.trim() || 'normal',
      putaway_date: record.putaway_date ? new Date(record.putaway_date) : null,
      last_accessed: record.last_accessed ? new Date(record.last_accessed) : null,
      expiration_date: record.expiration_date ? new Date(record.expiration_date) : null,
      quality_status: record.quality_status?.trim() || 'approved',
      inspection_required: record.inspection_required === true,
      last_inspection_date: record.last_inspection_date ? new Date(record.last_inspection_date) : null,
      inspection_due_date: record.inspection_due_date ? new Date(record.inspection_due_date) : null,
      source_document: record.source_document?.trim() || null,
      source_reference: record.source_reference?.trim() || null,
      is_locked: record.is_locked === true,
      locked_by: record.locked_by?.trim() || null,
      locked_at: record.locked_at ? new Date(record.locked_at) : null,
      lock_reason: record.lock_reason?.trim() || null
    };
  }

  async findExistingRecord(record: BinContentSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: {
          content_id: record.content_id
        }
      });
    });
  }
}