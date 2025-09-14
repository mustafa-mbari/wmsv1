// prisma/seeds/classes/WarehouseBinMovementsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface BinMovementSeedData {
  movement_id: string;
  source_bin_id?: string;
  destination_bin_id?: string;
  product_id?: string;
  quantity?: number;
  uom?: string;
  movement_type?: string;
  reason?: string;
  reference_document?: string;
  reference_number?: string;
  movement_date?: string;
  performed_by?: string;
  batch_number?: string;
  serial_number?: string;
  status?: string;
  priority?: string;
  equipment_used?: string;
  labor_hours?: number;
  movement_cost?: number;
  notes?: string;
}

export class WarehouseBinMovementsSeeder extends BaseSeed<BinMovementSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'bin_movements';
  }

  getJsonFileName(): string {
    return 'warehouse/bin-movements.json';
  }

  getDependencies(): string[] {
    return ['bins', 'products'];
  }

  validateRecord(record: BinMovementSeedData): boolean {
    // Required fields validation
    if (!record.movement_id) {
      logger.error('Bin movement record missing required movement_id field', { source: 'WarehouseBinMovementsSeeder', method: 'validateRecord', record });
      return false;
    }

    // Quantity validation
    if (record.quantity !== undefined && record.quantity <= 0) {
      logger.error('Movement quantity must be positive', { source: 'WarehouseBinMovementsSeeder', method: 'validateRecord', quantity: record.quantity });
      return false;
    }

    // Labor hours validation
    if (record.labor_hours !== undefined && record.labor_hours < 0) {
      logger.error('Labor hours cannot be negative', { source: 'WarehouseBinMovementsSeeder', method: 'validateRecord', labor_hours: record.labor_hours });
      return false;
    }

    // Movement cost validation
    if (record.movement_cost !== undefined && record.movement_cost < 0) {
      logger.error('Movement cost cannot be negative', { source: 'WarehouseBinMovementsSeeder', method: 'validateRecord', movement_cost: record.movement_cost });
      return false;
    }

    // Date validation
    if (record.movement_date && isNaN(Date.parse(record.movement_date))) {
      logger.error('Invalid movement date format', { source: 'WarehouseBinMovementsSeeder', method: 'validateRecord', movement_date: record.movement_date });
      return false;
    }

    return true;
  }

  transformRecord(record: BinMovementSeedData): any {
    return {
      movement_id: record.movement_id.trim(),
      source_bin_id: record.source_bin_id?.trim() || null,
      destination_bin_id: record.destination_bin_id?.trim() || null,
      product_id: record.product_id?.trim() || null,
      quantity: record.quantity || 1,
      uom: record.uom?.trim() || null,
      movement_type: record.movement_type?.trim() || 'transfer',
      reason: record.reason?.trim() || null,
      reference_document: record.reference_document?.trim() || null,
      reference_number: record.reference_number?.trim() || null,
      movement_date: record.movement_date ? new Date(record.movement_date) : new Date(),
      performed_by: record.performed_by?.trim() || null,
      batch_number: record.batch_number?.trim() || null,
      serial_number: record.serial_number?.trim() || null,
      status: record.status?.trim() || 'completed',
      priority: record.priority?.trim() || 'normal',
      equipment_used: record.equipment_used?.trim() || null,
      labor_hours: record.labor_hours || null,
      movement_cost: record.movement_cost || null,
      notes: record.notes?.trim() || null
    };
  }

  async findExistingRecord(record: BinMovementSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { movement_id: record.movement_id }
      });
    });
  }
}