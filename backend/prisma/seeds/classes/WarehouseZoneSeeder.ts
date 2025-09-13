// prisma/seeds/classes/WarehouseZoneSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';
import logger from '../../../src/utils/logger/logger';

export interface WarehouseZoneSeedData {
  zone_id: string;
  warehouse_code: string; // Reference to warehouse by code
  zone_name: string;
  zone_code: string;
  zone_type: 'receiving' | 'shipping' | 'storage' | 'picking' | 'packing' | 'staging';
  description?: string;
  area?: number;
  area_unit?: string;
  capacity?: number;
  priority?: number;
  center_x: number;
  center_y: number;
  coordinate_unit?: string;
  temperature_controlled?: boolean;
  min_temperature?: number;
  max_temperature?: number;
  temperature_unit?: string;
  is_active?: boolean;
  status?: 'operational' | 'maintenance' | 'blocked';
  custom_attributes?: any;
}

export class WarehouseZoneSeeder extends BaseSeed<WarehouseZoneSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'warehouse_zones';
  }

  getJsonFileName(): string {
    return 'warehouse-zones.json';
  }

  getDependencies(): string[] {
    return ['warehouse_warehouses']; // Zones depend on warehouses
  }

  validateRecord(record: WarehouseZoneSeedData): boolean {
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

    // Coordinates validation
    if (typeof record.center_x !== 'number' || typeof record.center_y !== 'number') {
      logger.error('Invalid coordinates - must be numbers', {
        source: 'WarehouseZoneSeeder',
        method: 'validateRecord',
        center_x: record.center_x,
        center_y: record.center_y
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

    // Area validation
    if (record.area && record.area < 0) {
      logger.error('Area cannot be negative', {
        source: 'WarehouseZoneSeeder',
        method: 'validateRecord',
        area: record.area
      });
      return false;
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

  async transformRecord(record: WarehouseZoneSeedData): Promise<any> {
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
      area: record.area || null,
      area_unit: record.area_unit?.trim() || null,
      capacity: record.capacity || null,
      priority: record.priority ?? 0,
      center_x: record.center_x,
      center_y: record.center_y,
      coordinate_unit: record.coordinate_unit?.trim() || null,
      temperature_controlled: record.temperature_controlled ?? false,
      min_temperature: record.min_temperature || null,
      max_temperature: record.max_temperature || null,
      temperature_unit: record.temperature_unit?.trim() || null,
      is_active: record.is_active !== false,
      status: record.status || 'operational',
      custom_attributes: record.custom_attributes || null
    };
  }

  async findExistingRecord(record: WarehouseZoneSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      const result = await this.prisma.$queryRaw`
        SELECT * FROM warehouse.zones
        WHERE zone_id = ${record.zone_id} OR zone_code = ${record.zone_code.toUpperCase()}
        LIMIT 1
      `;
      return Array.isArray(result) && result.length > 0 ? result[0] : null;
    });
  }

  // Override getModel to work with warehouse schema
  protected getModel() {
    return {
      count: () => this.prisma.$queryRaw`SELECT COUNT(*) as count FROM warehouse.zones`,
      create: (data: any) => this.prisma.$queryRaw`
        INSERT INTO warehouse.zones (
          zone_id, warehouse_id, zone_name, zone_code, zone_type, description,
          area, area_unit, capacity, priority, center_x, center_y, coordinate_unit,
          temperature_controlled, min_temperature, max_temperature, temperature_unit,
          is_active, status, custom_attributes, created_at, updated_at, created_by, updated_by
        ) VALUES (
          ${data.data.zone_id}, ${data.data.warehouse_id}, ${data.data.zone_name}, ${data.data.zone_code},
          ${data.data.zone_type}, ${data.data.description}, ${data.data.area}, ${data.data.area_unit},
          ${data.data.capacity}, ${data.data.priority}, ${data.data.center_x}, ${data.data.center_y},
          ${data.data.coordinate_unit}, ${data.data.temperature_controlled}, ${data.data.min_temperature},
          ${data.data.max_temperature}, ${data.data.temperature_unit}, ${data.data.is_active},
          ${data.data.status}, ${data.data.custom_attributes}::jsonb, ${data.data.created_at},
          ${data.data.updated_at}, ${data.data.created_by}, ${data.data.updated_by}
        )
      `,
      update: (params: any) => this.prisma.$queryRaw`
        UPDATE warehouse.zones SET
          warehouse_id = ${params.data.warehouse_id},
          zone_name = ${params.data.zone_name},
          zone_code = ${params.data.zone_code},
          zone_type = ${params.data.zone_type},
          description = ${params.data.description},
          area = ${params.data.area},
          area_unit = ${params.data.area_unit},
          capacity = ${params.data.capacity},
          priority = ${params.data.priority},
          center_x = ${params.data.center_x},
          center_y = ${params.data.center_y},
          coordinate_unit = ${params.data.coordinate_unit},
          temperature_controlled = ${params.data.temperature_controlled},
          min_temperature = ${params.data.min_temperature},
          max_temperature = ${params.data.max_temperature},
          temperature_unit = ${params.data.temperature_unit},
          is_active = ${params.data.is_active},
          status = ${params.data.status},
          custom_attributes = ${params.data.custom_attributes}::jsonb,
          updated_at = ${params.data.updated_at},
          updated_by = ${params.data.updated_by}
        WHERE zone_id = ${params.where.zone_id || ''}
      `
    };
  }

  // Override hasExistingData to work with warehouse schema
  protected async hasExistingData(): Promise<boolean> {
    try {
      const result = await this.prisma.$queryRaw`SELECT COUNT(*) as count FROM warehouse.zones`;
      const count = Array.isArray(result) && result[0] ? Number((result[0] as any).count) : 0;
      return count > 0;
    } catch (error) {
      logger.error(`Error checking existing data for zones`, {
        source: 'WarehouseZoneSeeder',
        method: 'hasExistingData',
        error: error instanceof Error ? error.message : error
      });
      return false;
    }
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