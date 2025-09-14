// prisma/seeds/classes/WarehouseBinsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface BinSeedData {
  bin_id: string;
  location_id?: string;
  bin_type_id?: string;
  bin_code?: string;
  bin_name?: string;
  description?: string;
  capacity?: number;
  weight_capacity?: number;
  is_active?: boolean;
  status?: string;
  bin_priority?: number;
  accessibility?: string;
  temperature_zone?: string;
  hazmat_approved?: boolean;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit?: string;
  position_x?: number;
  position_y?: number;
  position_z?: number;
  coordinate_unit?: string;
  barcode?: string;
  rfid_tag?: string;
  qr_code?: string;
  lc_warehouse_code?: string;
  lc_zone_code?: string;
  lc_aisle_code?: string;
  lc_rack_code?: string;
  lc_level_code?: string;
  lc_bin_code?: string;
}

export class WarehouseBinsSeeder extends BaseSeed<BinSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'bins';
  }

  getJsonFileName(): string {
    return 'warehouse/bins.json';
  }

  getDependencies(): string[] {
    return ['warehouse_locations', 'bin_types'];
  }

  validateRecord(record: BinSeedData): boolean {
    // Required fields validation
    if (!record.bin_id) {
      logger.error('Bin record missing required bin_id field', { source: 'WarehouseBinsSeeder', method: 'validateRecord', record });
      return false;
    }

    // Capacity validation
    if (record.capacity !== undefined && record.capacity <= 0) {
      logger.error('Capacity must be positive', { source: 'WarehouseBinsSeeder', method: 'validateRecord', capacity: record.capacity });
      return false;
    }

    // Weight capacity validation
    if (record.weight_capacity !== undefined && record.weight_capacity <= 0) {
      logger.error('Weight capacity must be positive', { source: 'WarehouseBinsSeeder', method: 'validateRecord', weight_capacity: record.weight_capacity });
      return false;
    }

    // Priority validation
    if (record.bin_priority !== undefined && (record.bin_priority < 1 || record.bin_priority > 10)) {
      logger.error('Bin priority must be between 1 and 10', { source: 'WarehouseBinsSeeder', method: 'validateRecord', bin_priority: record.bin_priority });
      return false;
    }

    // Dimensions validation
    if (record.length !== undefined && record.length <= 0) {
      logger.error('Length must be positive', { source: 'WarehouseBinsSeeder', method: 'validateRecord', length: record.length });
      return false;
    }

    if (record.width !== undefined && record.width <= 0) {
      logger.error('Width must be positive', { source: 'WarehouseBinsSeeder', method: 'validateRecord', width: record.width });
      return false;
    }

    if (record.height !== undefined && record.height <= 0) {
      logger.error('Height must be positive', { source: 'WarehouseBinsSeeder', method: 'validateRecord', height: record.height });
      return false;
    }

    return true;
  }

  transformRecord(record: BinSeedData): any {
    const lc_full_code = [
      record.lc_warehouse_code,
      record.lc_zone_code,
      record.lc_aisle_code,
      record.lc_rack_code,
      record.lc_level_code,
      record.lc_bin_code
    ].filter(code => code && code.trim()).join('');

    return {
      bin_id: record.bin_id.trim(),
      location_id: record.location_id?.trim() || null,
      bin_type_id: record.bin_type_id?.trim() || null,
      bin_code: record.bin_code?.trim() || null,
      bin_name: record.bin_name?.trim() || null,
      description: record.description?.trim() || null,
      capacity: record.capacity || null,
      weight_capacity: record.weight_capacity || null,
      is_active: record.is_active !== false,
      status: record.status?.trim() || 'available',
      bin_priority: record.bin_priority || 5,
      accessibility: record.accessibility?.trim() || 'normal',
      temperature_zone: record.temperature_zone?.trim() || 'ambient',
      hazmat_approved: record.hazmat_approved === true,
      length: record.length || null,
      width: record.width || null,
      height: record.height || null,
      dimension_unit: record.dimension_unit?.trim() || 'meters',
      position_x: record.position_x || null,
      position_y: record.position_y || null,
      position_z: record.position_z || null,
      coordinate_unit: record.coordinate_unit?.trim() || 'meters',
      barcode: record.barcode?.trim() || null,
      rfid_tag: record.rfid_tag?.trim() || null,
      qr_code: record.qr_code?.trim() || null,
      custom_attributes: null,
      lc_warehouse_code: record.lc_warehouse_code?.trim() || null,
      lc_zone_code: record.lc_zone_code?.trim() || null,
      lc_aisle_code: record.lc_aisle_code?.trim() || null,
      lc_rack_code: record.lc_rack_code?.trim() || null,
      lc_level_code: record.lc_level_code?.trim() || null,
      lc_bin_code: record.lc_bin_code?.trim() || null,
      lc_full_code: lc_full_code || null
    };
  }

  async findExistingRecord(record: BinSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { bin_id: record.bin_id }
      });
    });
  }
}