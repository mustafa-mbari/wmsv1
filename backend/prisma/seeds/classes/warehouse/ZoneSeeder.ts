// prisma/seeds/classes/WarehouseZoneSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '../../../../src/utils/logger/logger';

export interface ZoneSeedData {
  zone_id: string;
  warehouse_code: string; // Reference to warehouse by code
  zone_name: string;
  zone_code: string;
  lc_zone_code?: string; // This field exists in data but not in schema
  zone_type: 'receiving' | 'shipping' | 'storage' | 'picking' | 'packing' | 'staging';
  description?: string;
  area?: number; // These fields exist in data but not in schema
  area_unit?: string;
  capacity?: number;
  priority?: number;
  center_x?: number;
  center_y?: number;
  coordinate_unit?: string;
  temperature_controlled?: boolean;
  min_temperature?: number;
  max_temperature?: number;
  temperature_unit?: string;
  is_active?: boolean;
  status?: 'operational' | 'maintenance' | 'blocked';
  custom_attributes?: any;
}

export class WarehouseZoneSeeder extends BaseSeed<ZoneSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'zones';
  }

  getJsonFileName(): string {
    return 'warehouse/zones.json';
  }

  getDependencies(): string[] {
    return ['warehouses']; // Zones depend on warehouses
  }

  validateRecord(record: ZoneSeedData): boolean {
    // Required fields validation
    if (!record.zone_id || !record.warehouse_code || !record.zone_name || !record.zone_code) {
      logger.error('Zone record missing required fields', {
        source: 'WarehouseZoneSeeder',
        method: 'validateRecord',
        record
      });
      return false;
    }

    // Zone ID validation
    if (record.zone_id.length > 15) {
      logger.error('Zone ID too long (max 15 characters)', {
        source: 'WarehouseZoneSeeder',
        method: 'validateRecord',
        zone_id: record.zone_id,
        length: record.zone_id.length
      });
      return false;
    }

    // Zone name validation
    if (record.zone_name.length > 100) {
      logger.error('Zone name too long (max 100 characters)', {
        source: 'WarehouseZoneSeeder',
        method: 'validateRecord',
        zone_name: record.zone_name,
        length: record.zone_name.length
      });
      return false;
    }

    // Zone code validation
    if (record.zone_code.length > 20) {
      logger.error('Zone code too long (max 20 characters)', {
        source: 'WarehouseZoneSeeder',
        method: 'validateRecord',
        zone_code: record.zone_code,
        length: record.zone_code.length
      });
      return false;
    }

    // Zone type validation
    const validZoneTypes = ['receiving', 'shipping', 'storage', 'picking', 'packing', 'staging'];
    if (!validZoneTypes.includes(record.zone_type)) {
      logger.error('Invalid zone type', {
        source: 'WarehouseZoneSeeder',
        method: 'validateRecord',
        zone_type: record.zone_type,
        validTypes: validZoneTypes
      });
      return false;
    }

    // Temperature validation if temperature controlled
    if (record.temperature_controlled) {
      if (record.min_temperature && record.max_temperature && record.min_temperature > record.max_temperature) {
        logger.error('Min temperature cannot be greater than max temperature', {
          source: 'WarehouseZoneSeeder',
          method: 'validateRecord',
          min_temperature: record.min_temperature,
          max_temperature: record.max_temperature
        });
        return false;
      }
    }

    // Capacity validation
    if (record.capacity && record.capacity < 0) {
      logger.error('Capacity cannot be negative', {
        source: 'WarehouseZoneSeeder',
        method: 'validateRecord',
        capacity: record.capacity
      });
      return false;
    }

    return true;
  }

  async transformRecord(record: ZoneSeedData): Promise<any> {
    // Get warehouse ID from warehouse code
    const warehouse = await this.prisma.$queryRaw`
      SELECT warehouse_id FROM warehouse.warehouses
      WHERE warehouse_code = ${record.warehouse_code.toUpperCase()}
      LIMIT 1
    ` as any[];

    if (!warehouse || warehouse.length === 0) {
      throw new Error(`Warehouse with code '${record.warehouse_code}' not found`);
    }

    return {
      zone_id: record.zone_id.trim(),
      warehouse_id: warehouse[0].warehouse_id,
      zone_name: record.zone_name.trim(),
      zone_code: record.zone_code.toUpperCase().trim(),
      zone_type: record.zone_type,
      description: record.description?.trim() || null,
      capacity: record.capacity || null,
      temperature_controlled: record.temperature_controlled ?? false,
      is_active: record.is_active !== false,
      status: record.status || 'operational'
    };
  }

  async findExistingRecord(record: ZoneSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      const result = await this.prisma.$queryRaw`
        SELECT * FROM warehouse.zones
        WHERE zone_id = ${record.zone_id} OR zone_code = ${record.zone_code.toUpperCase()}
        LIMIT 1
      `;
      return Array.isArray(result) && result.length > 0 ? result[0] : null;
    });
  }


  // Helper method to get zones by warehouse
  async getZonesByWarehouse(): Promise<{ [warehouseId: string]: any[] }> {
    const zones = await this.prisma.$queryRaw`
      SELECT z.*, w.warehouse_name, w.warehouse_code
      FROM warehouse.zones z
      JOIN warehouse.warehouses w ON z.warehouse_id = w.warehouse_id
      WHERE z.is_active = true
      ORDER BY z.warehouse_id, z.zone_type, z.zone_name
    ` as any[];

    const result: { [warehouseId: string]: any[] } = {};

    zones.forEach(zone => {
      const warehouseId = zone.warehouse_id;
      if (!result[warehouseId]) {
        result[warehouseId] = [];
      }
      result[warehouseId].push(zone);
    });

    return result;
  }

  // Helper method to get zone statistics
  async getZoneStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: { [type: string]: number };
    byStatus: { [status: string]: number };
    byWarehouse: { [warehouse: string]: number };
    temperatureControlled: number;
  }> {
    const zones = await this.prisma.$queryRaw`
      SELECT z.*, w.warehouse_name
      FROM warehouse.zones z
      JOIN warehouse.warehouses w ON z.warehouse_id = w.warehouse_id
    ` as any[];

    const stats = {
      total: zones.length,
      active: zones.filter(z => z.is_active).length,
      inactive: zones.filter(z => !z.is_active).length,
      byType: {} as { [type: string]: number },
      byStatus: {} as { [status: string]: number },
      byWarehouse: {} as { [warehouse: string]: number },
      temperatureControlled: zones.filter(z => z.temperature_controlled).length
    };

    zones.forEach(zone => {
      // Count by type
      stats.byType[zone.zone_type] = (stats.byType[zone.zone_type] || 0) + 1;

      // Count by status
      stats.byStatus[zone.status] = (stats.byStatus[zone.status] || 0) + 1;

      // Count by warehouse
      stats.byWarehouse[zone.warehouse_name] = (stats.byWarehouse[zone.warehouse_name] || 0) + 1;
    });

    return stats;
  }
}