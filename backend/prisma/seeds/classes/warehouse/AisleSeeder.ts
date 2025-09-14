// prisma/seeds/classes/WarehouseAisleSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface AisleSeedData {
  aisle_id: string;
  zone_code: string; // Reference to zone by code
  aisle_name: string;
  aisle_code: string;
  description?: string;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit?: string;
  capacity?: number;
  aisle_direction?: string;
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  center_x?: number;
  center_y?: number;
  coordinate_unit?: string;
  is_active?: boolean;
  status?: 'operational' | 'blocked';
  custom_attributes?: any;
}

export class WarehouseAisleSeeder extends BaseSeed<AisleSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'aisles';
  }

  getJsonFileName(): string {
    return 'warehouse/aisles.json';
  }

  getDependencies(): string[] {
    return ['warehouse_zones']; // Aisles depend on zones
  }

  validateRecord(record: AisleSeedData): boolean {
    // Required fields validation
    if (!record.aisle_id || !record.zone_code || !record.aisle_name || !record.aisle_code) {
      logger.error('Aisle record missing required fields', {
        source: 'WarehouseAisleSeeder',
        method: 'validateRecord',
        record
      });
      return false;
    }

    // Aisle ID validation
    if (record.aisle_id.length > 20) {
      logger.error('Aisle ID too long (max 20 characters)', {
        source: 'WarehouseAisleSeeder',
        method: 'validateRecord',
        aisle_id: record.aisle_id,
        length: record.aisle_id.length
      });
      return false;
    }

    // Aisle name validation
    if (record.aisle_name.length > 50) {
      logger.error('Aisle name too long (max 50 characters)', {
        source: 'WarehouseAisleSeeder',
        method: 'validateRecord',
        aisle_name: record.aisle_name,
        length: record.aisle_name.length
      });
      return false;
    }

    // Aisle code validation
    if (record.aisle_code.length > 20) {
      logger.error('Aisle code too long (max 20 characters)', {
        source: 'WarehouseAisleSeeder',
        method: 'validateRecord',
        aisle_code: record.aisle_code,
        length: record.aisle_code.length
      });
      return false;
    }

    // Coordinates validation (required)
    if (typeof record.start_x !== 'number' || typeof record.start_y !== 'number' ||
        typeof record.end_x !== 'number' || typeof record.end_y !== 'number') {
      logger.error('Invalid coordinates - start and end coordinates must be numbers', {
        source: 'WarehouseAisleSeeder',
        method: 'validateRecord',
        start_x: record.start_x,
        start_y: record.start_y,
        end_x: record.end_x,
        end_y: record.end_y
      });
      return false;
    }

    // Dimensions validation
    if (record.length && record.length < 0) {
      logger.error('Length cannot be negative', {
        source: 'WarehouseAisleSeeder',
        method: 'validateRecord',
        length: record.length
      });
      return false;
    }

    if (record.width && record.width < 0) {
      logger.error('Width cannot be negative', {
        source: 'WarehouseAisleSeeder',
        method: 'validateRecord',
        width: record.width
      });
      return false;
    }

    if (record.height && record.height < 0) {
      logger.error('Height cannot be negative', {
        source: 'WarehouseAisleSeeder',
        method: 'validateRecord',
        height: record.height
      });
      return false;
    }

    // Capacity validation
    if (record.capacity && record.capacity < 0) {
      logger.error('Capacity cannot be negative', {
        source: 'WarehouseAisleSeeder',
        method: 'validateRecord',
        capacity: record.capacity
      });
      return false;
    }

    return true;
  }

  async transformRecord(record: AisleSeedData): Promise<any> {
    // Get zone ID from zone code
    const zone = await this.prisma.$queryRaw`
      SELECT zone_id FROM warehouse.zones
      WHERE zone_code = ${record.zone_code.toUpperCase()}
      LIMIT 1
    ` as any[];

    if (!zone || zone.length === 0) {
      throw new Error(`Zone with code '${record.zone_code}' not found`);
    }

    // Calculate center coordinates if not provided
    const centerX = record.center_x ?? (record.start_x + record.end_x) / 2;
    const centerY = record.center_y ?? (record.start_y + record.end_y) / 2;

    return {
      aisle_id: record.aisle_id.trim(),
      zone_id: zone[0].zone_id,
      aisle_name: record.aisle_name.trim(),
      aisle_code: record.aisle_code.toUpperCase().trim(),
      description: record.description?.trim() || null,
      length: record.length || null,
      width: record.width || null,
      height: record.height || null,
      dimension_unit: record.dimension_unit?.trim() || null,
      capacity: record.capacity || null,
      aisle_direction: record.aisle_direction?.trim() || null,
      start_x: record.start_x,
      start_y: record.start_y,
      end_x: record.end_x,
      end_y: record.end_y,
      center_x: centerX,
      center_y: centerY,
      coordinate_unit: record.coordinate_unit?.trim() || null,
      is_active: record.is_active !== false,
      status: record.status || 'operational',
      custom_attributes: record.custom_attributes || null
    };
  }

  async findExistingRecord(record: AisleSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      const result = await this.prisma.$queryRaw`
        SELECT * FROM warehouse.aisles
        WHERE aisle_id = ${record.aisle_id} OR aisle_code = ${record.aisle_code.toUpperCase()}
        LIMIT 1
      `;
      return Array.isArray(result) && result.length > 0 ? result[0] : null;
    });
  }


  // Helper method to get aisles by zone
  async getAislesByZone(): Promise<{ [zoneId: string]: any[] }> {
    const aisles = await this.prisma.$queryRaw`
      SELECT a.*, z.zone_name, z.zone_code, w.warehouse_name
      FROM warehouse.aisles a
      JOIN warehouse.zones z ON a.zone_id = z.zone_id
      JOIN warehouse.warehouses w ON z.warehouse_id = w.warehouse_id
      WHERE a.is_active = true
      ORDER BY a.zone_id, a.aisle_name
    ` as any[];

    const result: { [zoneId: string]: any[] } = {};

    aisles.forEach(aisle => {
      const zoneId = aisle.zone_id;
      if (!result[zoneId]) {
        result[zoneId] = [];
      }
      result[zoneId].push(aisle);
    });

    return result;
  }

  // Helper method to calculate aisle length from coordinates
  calculateAisleLength(startX: number, startY: number, endX: number, endY: number): number {
    return Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  }

  // Helper method to get aisle statistics
  async getAisleStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byStatus: { [status: string]: number };
    byZone: { [zone: string]: number };
    byDirection: { [direction: string]: number };
    totalCapacity: number;
    averageLength: number;
  }> {
    const aisles = await this.prisma.$queryRaw`
      SELECT a.*, z.zone_name
      FROM warehouse.aisles a
      JOIN warehouse.zones z ON a.zone_id = z.zone_id
    ` as any[];

    const stats = {
      total: aisles.length,
      active: aisles.filter(a => a.is_active).length,
      inactive: aisles.filter(a => !a.is_active).length,
      byStatus: {} as { [status: string]: number },
      byZone: {} as { [zone: string]: number },
      byDirection: {} as { [direction: string]: number },
      totalCapacity: 0,
      averageLength: 0
    };

    let totalLength = 0;
    let aislesWithLength = 0;

    aisles.forEach(aisle => {
      // Count by status
      stats.byStatus[aisle.status] = (stats.byStatus[aisle.status] || 0) + 1;

      // Count by zone
      stats.byZone[aisle.zone_name] = (stats.byZone[aisle.zone_name] || 0) + 1;

      // Count by direction
      if (aisle.aisle_direction) {
        stats.byDirection[aisle.aisle_direction] = (stats.byDirection[aisle.aisle_direction] || 0) + 1;
      }

      // Sum capacity
      if (aisle.capacity) {
        stats.totalCapacity += aisle.capacity;
      }

      // Calculate average length
      if (aisle.length) {
        totalLength += aisle.length;
        aislesWithLength++;
      } else if (aisle.start_x !== null && aisle.start_y !== null && aisle.end_x !== null && aisle.end_y !== null) {
        const calculatedLength = this.calculateAisleLength(aisle.start_x, aisle.start_y, aisle.end_x, aisle.end_y);
        totalLength += calculatedLength;
        aislesWithLength++;
      }
    });

    stats.averageLength = aislesWithLength > 0 ? totalLength / aislesWithLength : 0;

    return stats;
  }
}