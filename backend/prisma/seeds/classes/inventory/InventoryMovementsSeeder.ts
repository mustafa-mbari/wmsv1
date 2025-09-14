// prisma/seeds/classes/InventoryInventoryMovementsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface InventoryMovementSeedData {
  movement_id: string;
  inventory_id?: string;
  source_location_id?: string;
  destination_location_id?: string;
  quantity?: number;
  uom_id?: string;
  movement_type?: string;
  movement_reason?: string;
  reference_id?: string;
  reference_type?: string;
  batch_number?: string;
  movement_date?: string;
  performed_by?: string;
  system_generated?: boolean;
  approval_status?: string;
  approval_date?: string;
  approved_by?: string;
  transaction_value?: number;
  currency?: string;
  movement_cost?: number;
  transport_mode?: string;
  carrier_id?: string;
  tracking_number?: string;
  expected_arrival?: string;
  actual_arrival?: string;
  notes?: string;
}

export class InventoryInventoryMovementsSeeder extends BaseSeed<InventoryMovementSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'inventory_movements';
  }

  getJsonFileName(): string {
    return 'inventory/inventory-movements.json';
  }

  getDependencies(): string[] {
    return ['inventory', 'warehouse_locations'];
  }

  validateRecord(record: InventoryMovementSeedData): boolean {
    // Required fields validation
    if (!record.movement_id) {
      logger.error('Inventory movement record missing required movement_id field', { source: 'InventoryInventoryMovementsSeeder', method: 'validateRecord', record });
      return false;
    }

    // Quantity validation
    if (record.quantity !== undefined && record.quantity <= 0) {
      logger.error('Movement quantity must be positive', { source: 'InventoryInventoryMovementsSeeder', method: 'validateRecord', quantity: record.quantity });
      return false;
    }

    // Value validation
    if (record.transaction_value !== undefined && record.transaction_value < 0) {
      logger.error('Transaction value cannot be negative', { source: 'InventoryInventoryMovementsSeeder', method: 'validateRecord', transaction_value: record.transaction_value });
      return false;
    }

    if (record.movement_cost !== undefined && record.movement_cost < 0) {
      logger.error('Movement cost cannot be negative', { source: 'InventoryInventoryMovementsSeeder', method: 'validateRecord', movement_cost: record.movement_cost });
      return false;
    }

    // Date validation
    if (record.movement_date && isNaN(Date.parse(record.movement_date))) {
      logger.error('Invalid movement date format', { source: 'InventoryInventoryMovementsSeeder', method: 'validateRecord', movement_date: record.movement_date });
      return false;
    }

    if (record.approval_date && isNaN(Date.parse(record.approval_date))) {
      logger.error('Invalid approval date format', { source: 'InventoryInventoryMovementsSeeder', method: 'validateRecord', approval_date: record.approval_date });
      return false;
    }

    if (record.expected_arrival && isNaN(Date.parse(record.expected_arrival))) {
      logger.error('Invalid expected arrival date format', { source: 'InventoryInventoryMovementsSeeder', method: 'validateRecord', expected_arrival: record.expected_arrival });
      return false;
    }

    if (record.actual_arrival && isNaN(Date.parse(record.actual_arrival))) {
      logger.error('Invalid actual arrival date format', { source: 'InventoryInventoryMovementsSeeder', method: 'validateRecord', actual_arrival: record.actual_arrival });
      return false;
    }

    return true;
  }

  transformRecord(record: InventoryMovementSeedData): any {
    return {
      movement_id: record.movement_id.trim(),
      inventory_id: record.inventory_id?.trim() || null,
      source_location_id: record.source_location_id?.trim() || null,
      destination_location_id: record.destination_location_id?.trim() || null,
      quantity: record.quantity || 1,
      uom_id: record.uom_id?.trim() || null,
      movement_type: record.movement_type?.trim() || 'transfer',
      movement_reason: record.movement_reason?.trim() || null,
      reference_id: record.reference_id?.trim() || null,
      reference_type: record.reference_type?.trim() || null,
      batch_number: record.batch_number?.trim() || null,
      movement_date: record.movement_date ? new Date(record.movement_date) : new Date(),
      performed_by: record.performed_by?.trim() || null,
      system_generated: record.system_generated === true,
      approval_status: record.approval_status?.trim() || 'pending',
      approval_date: record.approval_date ? new Date(record.approval_date) : null,
      approved_by: record.approved_by?.trim() || null,
      transaction_value: record.transaction_value || null,
      currency: record.currency?.trim() || 'USD',
      movement_cost: record.movement_cost || null,
      transport_mode: record.transport_mode?.trim() || null,
      carrier_id: record.carrier_id?.trim() || null,
      tracking_number: record.tracking_number?.trim() || null,
      expected_arrival: record.expected_arrival ? new Date(record.expected_arrival) : null,
      actual_arrival: record.actual_arrival ? new Date(record.actual_arrival) : null,
      notes: record.notes?.trim() || null
    };
  }

  async findExistingRecord(record: InventoryMovementSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { movement_id: record.movement_id }
      });
    });
  }
}