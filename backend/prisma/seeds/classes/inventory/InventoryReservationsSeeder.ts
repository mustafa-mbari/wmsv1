// prisma/seeds/classes/InventoryInventoryReservationsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface InventoryReservationSeedData {
  reservation_id: string;
  reservation_number?: string;
  product_id?: string;
  inventory_id?: string;
  location_id?: string;
  quantity?: number;
  uom_id?: string;
  reservation_type?: string;
  status?: string;
  reference_id?: string;
  reference_type?: string;
  reserved_at?: string;
  expires_at?: string;
  released_at?: string;
  reserved_by?: string;
  released_by?: string;
  notes?: string;
  priority?: number;
}

export class InventoryInventoryReservationsSeeder extends BaseSeed<InventoryReservationSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'inventory_reservations';
  }

  getJsonFileName(): string {
    return 'inventory/inventory-reservations.json';
  }

  getDependencies(): string[] {
    return ['inventory', 'warehouse_locations'];
  }

  validateRecord(record: InventoryReservationSeedData): boolean {
    // Required fields validation
    if (!record.reservation_id) {
      logger.error('Inventory reservation record missing required reservation_id field', { source: 'InventoryInventoryReservationsSeeder', method: 'validateRecord', record });
      return false;
    }

    // Quantity validation
    if (record.quantity !== undefined && record.quantity <= 0) {
      logger.error('Reservation quantity must be positive', { source: 'InventoryInventoryReservationsSeeder', method: 'validateRecord', quantity: record.quantity });
      return false;
    }

    // Priority validation
    if (record.priority !== undefined && (record.priority < 1 || record.priority > 10)) {
      logger.error('Priority must be between 1 and 10', { source: 'InventoryInventoryReservationsSeeder', method: 'validateRecord', priority: record.priority });
      return false;
    }

    // Date validation
    if (record.reserved_at && isNaN(Date.parse(record.reserved_at))) {
      logger.error('Invalid reserved at date format', { source: 'InventoryInventoryReservationsSeeder', method: 'validateRecord', reserved_at: record.reserved_at });
      return false;
    }

    if (record.expires_at && isNaN(Date.parse(record.expires_at))) {
      logger.error('Invalid expires at date format', { source: 'InventoryInventoryReservationsSeeder', method: 'validateRecord', expires_at: record.expires_at });
      return false;
    }

    if (record.released_at && isNaN(Date.parse(record.released_at))) {
      logger.error('Invalid released at date format', { source: 'InventoryInventoryReservationsSeeder', method: 'validateRecord', released_at: record.released_at });
      return false;
    }

    return true;
  }

  transformRecord(record: InventoryReservationSeedData): any {
    return {
      reservation_id: record.reservation_id.trim(),
      reservation_number: record.reservation_number?.trim() || null,
      product_id: record.product_id?.trim() || null,
      inventory_id: record.inventory_id?.trim() || null,
      location_id: record.location_id?.trim() || null,
      quantity: record.quantity || 1,
      uom_id: record.uom_id?.trim() || null,
      reservation_type: record.reservation_type?.trim() || 'order',
      status: record.status?.trim() || 'active',
      reference_id: record.reference_id?.trim() || null,
      reference_type: record.reference_type?.trim() || null,
      reserved_at: record.reserved_at ? new Date(record.reserved_at) : new Date(),
      expires_at: record.expires_at ? new Date(record.expires_at) : null,
      released_at: record.released_at ? new Date(record.released_at) : null,
      reserved_by: record.reserved_by?.trim() || null,
      released_by: record.released_by?.trim() || null,
      notes: record.notes?.trim() || null,
      priority: record.priority || 5
    };
  }

  async findExistingRecord(record: InventoryReservationSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { reservation_id: record.reservation_id }
      });
    });
  }
}