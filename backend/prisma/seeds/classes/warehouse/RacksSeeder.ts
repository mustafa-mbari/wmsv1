// prisma/seeds/classes/WarehouseRacksSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface RackSeedData {
  rack_id: string;
  aisle_id?: string;
  rack_name?: string;
  rack_code?: string;
  description?: string;
  rack_type?: string;
  position_in_aisle?: number;
  side?: string;
  levels_count?: number;
  max_weight?: number;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit?: string;
  is_active?: boolean;
  status?: string;
  accessibility?: string;
  safety_rating?: string;
  material?: string;
  manufacturer?: string;
  model_number?: string;
  installation_date?: string;
  position_x?: number;
  position_y?: number;
  coordinate_unit?: string;
  barcode?: string;
  rfid_tag?: string;
  lc_warehouse_code?: string;
  lc_zone_code?: string;
  lc_aisle_code?: string;
  lc_rack_code?: string;
}

export class WarehouseRacksSeeder extends BaseSeed<RackSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'racks';
  }

  getJsonFileName(): string {
    return 'warehouse/racks.json';
  }

  getDependencies(): string[] {
    return ['warehouse_aisles'];
  }

  validateRecord(record: RackSeedData): boolean {
    // Required fields validation
    if (!record.rack_id) {
      logger.error('Rack record missing required rack_id field', { source: 'WarehouseRacksSeeder', method: 'validateRecord', record });
      return false;
    }

    // Position validation
    if (record.position_in_aisle !== undefined && record.position_in_aisle < 1) {
      logger.error('Position in aisle must be positive', { source: 'WarehouseRacksSeeder', method: 'validateRecord', position: record.position_in_aisle });
      return false;
    }

    // Levels count validation
    if (record.levels_count !== undefined && record.levels_count < 1) {
      logger.error('Levels count must be positive', { source: 'WarehouseRacksSeeder', method: 'validateRecord', levels_count: record.levels_count });
      return false;
    }

    // Weight validation
    if (record.max_weight !== undefined && record.max_weight <= 0) {
      logger.error('Max weight must be positive', { source: 'WarehouseRacksSeeder', method: 'validateRecord', max_weight: record.max_weight });
      return false;
    }

    // Dimensions validation
    if (record.length !== undefined && record.length <= 0) {
      logger.error('Length must be positive', { source: 'WarehouseRacksSeeder', method: 'validateRecord', length: record.length });
      return false;
    }

    if (record.width !== undefined && record.width <= 0) {
      logger.error('Width must be positive', { source: 'WarehouseRacksSeeder', method: 'validateRecord', width: record.width });
      return false;
    }

    if (record.height !== undefined && record.height <= 0) {
      logger.error('Height must be positive', { source: 'WarehouseRacksSeeder', method: 'validateRecord', height: record.height });
      return false;
    }

    // Date validation
    if (record.installation_date && isNaN(Date.parse(record.installation_date))) {
      logger.error('Invalid installation date format', { source: 'WarehouseRacksSeeder', method: 'validateRecord', installation_date: record.installation_date });
      return false;
    }

    return true;
  }

  transformRecord(record: RackSeedData): any {
    const lc_full_code = [
      record.lc_warehouse_code,
      record.lc_zone_code,
      record.lc_aisle_code,
      record.lc_rack_code
    ].filter(code => code && code.trim()).join('');

    return {
      rack_id: record.rack_id.trim(),
      aisle_id: record.aisle_id?.trim() || null,
      rack_name: record.rack_name?.trim() || null,
      rack_code: record.rack_code?.trim() || null,
      description: record.description?.trim() || null,
      rack_type: record.rack_type?.trim() || 'standard',
      position_in_aisle: record.position_in_aisle || null,
      side: record.side?.trim() || null,
      levels_count: record.levels_count || 1,
      max_weight: record.max_weight || null,
      length: record.length || null,
      width: record.width || null,
      height: record.height || null,
      dimension_unit: record.dimension_unit?.trim() || 'meters',
      is_active: record.is_active !== false,
      status: record.status?.trim() || 'active',
      accessibility: record.accessibility?.trim() || 'normal',
      safety_rating: record.safety_rating?.trim() || null,
      material: record.material?.trim() || null,
      manufacturer: record.manufacturer?.trim() || null,
      model_number: record.model_number?.trim() || null,
      installation_date: record.installation_date ? new Date(record.installation_date) : null,
      last_inspection: null,
      next_inspection: null,
      position_x: record.position_x || null,
      position_y: record.position_y || null,
      coordinate_unit: record.coordinate_unit?.trim() || 'meters',
      barcode: record.barcode?.trim() || null,
      rfid_tag: record.rfid_tag?.trim() || null,
      custom_attributes: null,
      lc_warehouse_code: record.lc_warehouse_code?.trim() || null,
      lc_zone_code: record.lc_zone_code?.trim() || null,
      lc_aisle_code: record.lc_aisle_code?.trim() || null,
      lc_rack_code: record.lc_rack_code?.trim() || null,
      lc_full_code: lc_full_code || null
    };
  }

  async findExistingRecord(record: RackSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { rack_id: record.rack_id }
      });
    });
  }
}