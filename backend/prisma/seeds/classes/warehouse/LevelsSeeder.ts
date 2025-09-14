// prisma/seeds/classes/WarehouseLevelsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface LevelSeedData {
  level_id: string;
  rack_id?: string;
  level_number?: number;
  level_name?: string;
  level_code?: string;
  description?: string;
  height_from_floor?: number;
  level_height?: number;
  weight_capacity?: number;
  is_active?: boolean;
  status?: string;
  accessibility?: string;
  safety_rating?: string;
  lc_warehouse_code?: string;
  lc_zone_code?: string;
  lc_aisle_code?: string;
  lc_rack_code?: string;
  lc_level_code?: string;
}

export class WarehouseLevelsSeeder extends BaseSeed<LevelSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'levels';
  }

  getJsonFileName(): string {
    return 'warehouse/levels.json';
  }

  getDependencies(): string[] {
    return ['racks'];
  }

  validateRecord(record: LevelSeedData): boolean {
    // Required fields validation
    if (!record.level_id) {
      logger.error('Level record missing required level_id field', { source: 'WarehouseLevelsSeeder', method: 'validateRecord', record });
      return false;
    }

    // Level number validation
    if (record.level_number !== undefined && record.level_number < 1) {
      logger.error('Level number must be positive', { source: 'WarehouseLevelsSeeder', method: 'validateRecord', level_number: record.level_number });
      return false;
    }

    // Height validation
    if (record.height_from_floor !== undefined && record.height_from_floor < 0) {
      logger.error('Height from floor cannot be negative', { source: 'WarehouseLevelsSeeder', method: 'validateRecord', height_from_floor: record.height_from_floor });
      return false;
    }

    if (record.level_height !== undefined && record.level_height <= 0) {
      logger.error('Level height must be positive', { source: 'WarehouseLevelsSeeder', method: 'validateRecord', level_height: record.level_height });
      return false;
    }

    // Weight capacity validation
    if (record.weight_capacity !== undefined && record.weight_capacity <= 0) {
      logger.error('Weight capacity must be positive', { source: 'WarehouseLevelsSeeder', method: 'validateRecord', weight_capacity: record.weight_capacity });
      return false;
    }

    return true;
  }

  transformRecord(record: LevelSeedData): any {
    const lc_full_code = [
      record.lc_warehouse_code,
      record.lc_zone_code,
      record.lc_aisle_code,
      record.lc_rack_code,
      record.lc_level_code
    ].filter(code => code && code.trim()).join('');

    return {
      level_id: record.level_id.trim(),
      rack_id: record.rack_id?.trim() || null,
      level_number: record.level_number || 1,
      level_name: record.level_name?.trim() || null,
      level_code: record.level_code?.trim() || null,
      description: record.description?.trim() || null,
      height_from_floor: record.height_from_floor || 0,
      level_height: record.level_height || null,
      weight_capacity: record.weight_capacity || null,
      is_active: record.is_active !== false,
      status: record.status?.trim() || 'active',
      accessibility: record.accessibility?.trim() || 'normal',
      safety_rating: record.safety_rating?.trim() || null,
      lc_warehouse_code: record.lc_warehouse_code?.trim() || null,
      lc_zone_code: record.lc_zone_code?.trim() || null,
      lc_aisle_code: record.lc_aisle_code?.trim() || null,
      lc_rack_code: record.lc_rack_code?.trim() || null,
      lc_level_code: record.lc_level_code?.trim() || null,
      lc_full_code: lc_full_code || null
    };
  }

  async findExistingRecord(record: LevelSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { level_id: record.level_id }
      });
    });
  }
}