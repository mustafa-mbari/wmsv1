// prisma/seeds/classes/WarehouseLocationSeeder.ts
// Combined seeder for racks, levels, and locations
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface LocationSeedData {
  // Rack information
  rack_id: string;
  aisle_code: string;
  rack_name: string;
  rack_code: string;
  rack_type?: 'pallet' | 'shelving' | 'cantilever' | 'drive-in';
  rack_description?: string;
  rack_length?: number;
  rack_width?: number;
  rack_height?: number;
  rack_max_weight?: number;
  weight_unit?: string;
  rack_capacity?: number;
  rack_system?: string;
  total_levels: number;
  rack_center_x: number;
  rack_center_y: number;

  // Level and location information
  levels: {
    level_id: string;
    level_name: string;
    level_code: string;
    level_number: number;
    level_height?: number;
    level_max_weight?: number;
    level_length?: number;
    level_width?: number;
    level_capacity?: number;
    relative_x?: number;
    relative_y?: number;
    z_position?: number;

    // Locations within this level
    locations: {
      location_id: string;
      location_name: string;
      location_code: string;
      location_type?: 'picking' | 'storage' | 'bulk' | 'returns';
      position?: number;
      barcode?: string;
      location_priority?: 'HIGH' | 'MEDIUM' | 'LOW';

      // Bin properties (if not using separate bins)
      bin_type?: string;
      bin_volume?: number;
      bin_max_weight?: number;

      // Location measurements
      location_length?: number;
      location_width?: number;
      location_height?: number;
      volume?: number;
      volume_unit?: string;
      max_weight?: number;
      location_relative_x?: number;
      location_relative_y?: number;
      location_z_position?: number;
    }[];
  }[];

  // Common properties
  dimension_unit?: string;
  coordinate_unit?: string;
  is_active?: boolean;
  custom_attributes?: any;
}

export class WarehouseLocationSeeder extends BaseSeed<LocationSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'warehouse_locations';
  }

  getJsonFileName(): string {
    return 'warehouse/locations.json';
  }

  getDependencies(): string[] {
    return ['warehouse_aisles']; // Locations depend on aisles
  }

  validateRecord(record: LocationSeedData): boolean {
    // Required fields validation
    if (!record.rack_id || !record.aisle_code || !record.rack_name || !record.rack_code) {
      logger.error('Location record missing required rack fields', {
        source: 'WarehouseLocationSeeder',
        method: 'validateRecord',
        record
      });
      return false;
    }

    // Levels validation
    if (!record.levels || record.levels.length === 0) {
      logger.error('Rack must have at least one level', {
        source: 'WarehouseLocationSeeder',
        method: 'validateRecord',
        rack_id: record.rack_id
      });
      return false;
    }

    if (record.total_levels !== record.levels.length) {
      logger.error('Total levels count does not match levels array length', {
        source: 'WarehouseLocationSeeder',
        method: 'validateRecord',
        rack_id: record.rack_id,
        total_levels: record.total_levels,
        actual_levels: record.levels.length
      });
      return false;
    }

    // Validate each level
    for (const level of record.levels) {
      if (!level.level_id || !level.level_name || !level.level_code) {
        logger.error('Level missing required fields', {
          source: 'WarehouseLocationSeeder',
          method: 'validateRecord',
          level
        });
        return false;
      }

      if (level.level_number < 1 || level.level_number > record.total_levels) {
        logger.error('Invalid level number', {
          source: 'WarehouseLocationSeeder',
          method: 'validateRecord',
          level_id: level.level_id,
          level_number: level.level_number,
          total_levels: record.total_levels
        });
        return false;
      }

      // Validate locations in level
      if (!level.locations || level.locations.length === 0) {
        logger.error('Level must have at least one location', {
          source: 'WarehouseLocationSeeder',
          method: 'validateRecord',
          level_id: level.level_id
        });
        return false;
      }

      for (const location of level.locations) {
        if (!location.location_id || !location.location_name || !location.location_code) {
          logger.error('Location missing required fields', {
            source: 'WarehouseLocationSeeder',
            method: 'validateRecord',
            location
          });
          return false;
        }

        // Validate location type
        if (location.location_type) {
          const validTypes = ['picking', 'storage', 'bulk', 'returns'];
          if (!validTypes.includes(location.location_type)) {
            logger.error('Invalid location type', {
              source: 'WarehouseLocationSeeder',
              method: 'validateRecord',
              location_id: location.location_id,
              location_type: location.location_type,
              validTypes
            });
            return false;
          }
        }

        // Validate priority
        if (location.location_priority) {
          const validPriorities = ['HIGH', 'MEDIUM', 'LOW'];
          if (!validPriorities.includes(location.location_priority)) {
            logger.error('Invalid location priority', {
              source: 'WarehouseLocationSeeder',
              method: 'validateRecord',
              location_id: location.location_id,
              location_priority: location.location_priority,
              validPriorities
            });
            return false;
          }
        }
      }
    }

    return true;
  }

  async transformRecord(record: LocationSeedData): Promise<any> {
    // Get aisle ID from aisle code
    const aisle = await this.prisma.$queryRaw`
      SELECT aisle_id FROM warehouse.aisles
      WHERE aisle_code = ${record.aisle_code.toUpperCase()}
      LIMIT 1
    ` as any[];

    if (!aisle || aisle.length === 0) {
      throw new Error(`Aisle with code '${record.aisle_code}' not found`);
    }

    return {
      rack: {
        rack_id: record.rack_id.trim(),
        aisle_id: aisle[0].aisle_id,
        rack_name: record.rack_name.trim(),
        rack_code: record.rack_code.toUpperCase().trim(),
        rack_type: record.rack_type || null,
        description: record.rack_description?.trim() || null,
        length: record.rack_length || null,
        width: record.rack_width || null,
        height: record.rack_height || null,
        dimension_unit: record.dimension_unit?.trim() || null,
        max_weight: record.rack_max_weight || null,
        weight_unit: record.weight_unit?.trim() || null,
        capacity: record.rack_capacity || null,
        rack_system: record.rack_system?.trim() || null,
        total_levels: record.total_levels,
        center_x: record.rack_center_x,
        center_y: record.rack_center_y,
        coordinate_unit: record.coordinate_unit?.trim() || null,
        is_active: record.is_active !== false,
        status: 'operational',
        custom_attributes: record.custom_attributes || null
      },
      levels: record.levels.map(level => ({
        level_id: level.level_id.trim(),
        rack_id: record.rack_id.trim(),
        level_name: level.level_name.trim(),
        level_code: level.level_code.toUpperCase().trim(),
        level_number: level.level_number,
        height: level.level_height || null,
        height_unit: record.dimension_unit?.trim() || null,
        max_weight: level.level_max_weight || null,
        weight_unit: record.weight_unit?.trim() || null,
        length: level.level_length || null,
        width: level.level_width || null,
        dimension_unit: record.dimension_unit?.trim() || null,
        capacity: level.level_capacity || null,
        relative_x: level.relative_x || null,
        relative_y: level.relative_y || null,
        z_position: level.z_position || null,
        coordinate_unit: record.coordinate_unit?.trim() || null,
        is_active: record.is_active !== false,
        status: 'operational',
        custom_attributes: record.custom_attributes || null,
        locations: level.locations.map(location => ({
          location_id: location.location_id.trim(),
          level_id: level.level_id.trim(),
          location_name: location.location_name.trim(),
          location_code: location.location_code.toUpperCase().trim(),
          location_type: location.location_type || null,
          position: location.position || null,
          barcode: location.barcode?.trim() || null,
          location_priority: location.location_priority || null,
          bin_type: location.bin_type?.trim() || null,
          bin_volume: location.bin_volume || null,
          bin_max_weight: location.bin_max_weight || null,
          length: location.location_length || null,
          width: location.location_width || null,
          height: location.location_height || null,
          dimension_unit: record.dimension_unit?.trim() || null,
          volume: location.volume || null,
          volume_unit: location.volume_unit?.trim() || null,
          max_weight: location.max_weight || null,
          weight_unit: record.weight_unit?.trim() || null,
          relative_x: location.location_relative_x || null,
          relative_y: location.location_relative_y || null,
          z_position: location.location_z_position || null,
          coordinate_unit: record.coordinate_unit?.trim() || null,
          is_active: record.is_active !== false,
          status: 'available',
          custom_attributes: record.custom_attributes || null
        }))
      }))
    };
  }

  async findExistingRecord(record: LocationSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      const result = await this.prisma.$queryRaw`
        SELECT * FROM warehouse.racks
        WHERE rack_id = ${record.rack_id} OR rack_code = ${record.rack_code.toUpperCase()}
        LIMIT 1
      `;
      return Array.isArray(result) && result.length > 0 ? result[0] : null;
    });
  }

  // Override seed method to handle the complex relationship
  async seed(): Promise<any> {
    const startTime = Date.now();
    const result = {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      duration: 0
    };

    try {
      logger.info(`Starting ${this.getModelName()} seeder`, { source: 'WarehouseLocationSeeder', method: 'seed' });

      // Check if seeding is needed
      if (!this.options.force && await this.hasExistingData()) {
        logger.info(`${this.getModelName()} already has data, skipping`, { source: 'WarehouseLocationSeeder', method: 'seed' });
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Load and validate data
      const rawData = await this.loadData();
      if (!rawData || rawData.length === 0) {
        logger.info(`No data found for ${this.getModelName()}`, { source: 'WarehouseLocationSeeder', method: 'seed' });
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Process each record
      for (const record of rawData) {
        try {
          result.recordsProcessed++;

          // Validate record
          if (this.options.validate && !this.validateRecord(record)) {
            result.recordsSkipped++;
            result.errors.push(`Invalid record: ${JSON.stringify(record)}`);
            continue;
          }

          // Transform record
          const transformed = await this.transformRecord(record);

          // Check if rack exists
          const existingRack = await this.findExistingRecord(record);

          if (existingRack && !this.options.force) {
            result.recordsSkipped++;
            continue;
          }

          // Create or update rack, levels, and locations
          await this.createLocationHierarchy(transformed, existingRack);
          result.recordsCreated++;

        } catch (error) {
          result.errors.push(`Error processing record: ${error}`);
        }
      }

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      logger.info(`${this.getModelName()} seeder completed`, {
        source: 'WarehouseLocationSeeder',
        method: 'seed',
        processed: result.recordsProcessed,
        created: result.recordsCreated,
        skipped: result.recordsSkipped,
        duration: result.duration,
        errors: result.errors.length
      });

    } catch (error) {
      result.errors.push(`Fatal error: ${error}`);
      result.success = false;
      result.duration = Date.now() - startTime;
      logger.error(`${this.getModelName()} seeder failed`, { source: 'WarehouseLocationSeeder', method: 'seed', error: error instanceof Error ? error.message : error });
    }

    return result;
  }

  private async createLocationHierarchy(transformed: any, existingRack: any): Promise<void> {
    const { rack, levels } = transformed;

    // Only create or update rack if it doesn't exist in the database at all
    // Check if rack exists in database (not just in our seeder data)
    const dbRack = await this.prisma.$queryRaw`
      SELECT rack_id FROM warehouse.racks WHERE rack_id = ${rack.rack_id}
      LIMIT 1
    ` as any[];

    if (dbRack.length === 0) {
      // Rack doesn't exist in database, create it
      logger.info(`Creating new rack: ${rack.rack_id}`, {
        source: 'WarehouseLocationSeeder',
        method: 'createLocationHierarchy'
      });

      await this.prisma.$queryRaw`
        INSERT INTO warehouse.racks (
          rack_id, aisle_id, rack_name, rack_code, rack_type, description,
          length, width, height, dimension_unit, max_weight,
          levels_count, position_x, position_y, coordinate_unit,
          is_active, status, custom_attributes, created_at, updated_at, created_by, updated_by
        ) VALUES (
          ${rack.rack_id}, ${rack.aisle_id}, ${rack.rack_name}, ${rack.rack_code},
          ${rack.rack_type}, ${rack.description}, ${rack.length}, ${rack.width},
          ${rack.height}, ${rack.dimension_unit}, ${rack.max_weight},
          ${rack.total_levels}, ${rack.center_x}, ${rack.center_y}, ${rack.coordinate_unit},
          ${rack.is_active}, ${rack.status},
          ${rack.custom_attributes}::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, null
        )
      `;
    } else {
      logger.info(`Rack already exists: ${rack.rack_id}, skipping rack creation`, {
        source: 'WarehouseLocationSeeder',
        method: 'createLocationHierarchy'
      });
    }

    // Create levels and locations
    for (const level of levels) {
      // Check if level exists first
      const dbLevel = await this.prisma.$queryRaw`
        SELECT level_id FROM warehouse.levels WHERE level_id = ${level.level_id}
        LIMIT 1
      ` as any[];

      if (dbLevel.length === 0) {
        // Level doesn't exist, create it
        logger.info(`Creating new level: ${level.level_id}`, {
          source: 'WarehouseLocationSeeder',
          method: 'createLocationHierarchy'
        });

        await this.prisma.$queryRaw`
          INSERT INTO warehouse.levels (
            level_id, rack_id, level_name, level_code, level_number, level_height,
            weight_capacity, is_active, status,
            created_at, updated_at, created_by, updated_by
          ) VALUES (
            ${level.level_id}, ${level.rack_id}, ${level.level_name}, ${level.level_code},
            ${level.level_number}, ${level.height}, ${level.max_weight},
            ${level.is_active}, ${level.status},
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, null
          )
        `;
      } else {
        logger.info(`Level already exists: ${level.level_id}, skipping level creation`, {
          source: 'WarehouseLocationSeeder',
          method: 'createLocationHierarchy'
        });
      }

      // Create locations - always create these as they don't exist yet
      for (const location of level.locations) {
        logger.info(`Creating location: ${location.location_id}`, {
          source: 'WarehouseLocationSeeder',
          method: 'createLocationHierarchy'
        });

        await this.prisma.$queryRaw`
          INSERT INTO warehouse.locations (
            location_id, location_name, location_code, location_type,
            barcode, capacity, weight_capacity,
            length, width, height, dimension_unit,
            position_x, position_y, position_z, coordinate_unit,
            is_active, status, custom_attributes, created_at, updated_at, created_by, updated_by
          ) VALUES (
            ${location.location_id}, ${location.location_name},
            ${location.location_code}, ${location.location_type},
            ${location.barcode}, ${location.volume}, ${location.max_weight},
            ${location.length}, ${location.width}, ${location.height}, ${location.dimension_unit},
            ${location.relative_x}, ${location.relative_y}, ${location.z_position}, ${location.coordinate_unit},
            ${location.is_active}, ${location.status}, ${location.custom_attributes}::jsonb,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, null
          )
          ON CONFLICT (location_id) DO UPDATE SET
            location_name = EXCLUDED.location_name,
            location_code = EXCLUDED.location_code,
            updated_at = CURRENT_TIMESTAMP
        `;
      }
    }
  }

  // Override hasExistingData to check locations table specifically
  protected async hasExistingData(): Promise<boolean> {
    try {
      const result = await this.prisma.$queryRaw`SELECT COUNT(*) as count FROM warehouse.locations`;
      const count = Array.isArray(result) && result[0] ? Number((result[0] as any).count) : 0;
      logger.info(`LocationSeeder: Found ${count} existing locations`, {
        source: 'WarehouseLocationSeeder',
        method: 'hasExistingData'
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking existing data for locations`, {
        source: 'WarehouseLocationSeeder',
        method: 'hasExistingData',
        error: error instanceof Error ? error.message : error
      });
      return false;
    }
  }

  // Helper method to get location statistics
  async getLocationStatistics(): Promise<{
    totalRacks: number;
    totalLevels: number;
    totalLocations: number;
    locationsByType: { [type: string]: number };
    locationsByStatus: { [status: string]: number };
    averageLocationsPerLevel: number;
    averageLevelsPerRack: number;
  }> {
    const [racks, levels, locations] = await Promise.all([
      this.prisma.$queryRaw`SELECT COUNT(*) as count FROM warehouse.racks` as Promise<any[]>,
      this.prisma.$queryRaw`SELECT COUNT(*) as count FROM warehouse.levels` as Promise<any[]>,
      this.prisma.$queryRaw`
        SELECT location_type, status, COUNT(*) as count
        FROM warehouse.locations
        GROUP BY location_type, status
      ` as Promise<any[]>
    ]);

    const totalRacks = Number(racks[0]?.count || 0);
    const totalLevels = Number(levels[0]?.count || 0);

    let totalLocations = 0;
    const locationsByType: { [type: string]: number } = {};
    const locationsByStatus: { [status: string]: number } = {};

    locations.forEach((loc: any) => {
      const count = Number(loc.count);
      totalLocations += count;

      if (loc.location_type) {
        locationsByType[loc.location_type] = (locationsByType[loc.location_type] || 0) + count;
      }

      if (loc.status) {
        locationsByStatus[loc.status] = (locationsByStatus[loc.status] || 0) + count;
      }
    });

    return {
      totalRacks,
      totalLevels,
      totalLocations,
      locationsByType,
      locationsByStatus,
      averageLocationsPerLevel: totalLevels > 0 ? totalLocations / totalLevels : 0,
      averageLevelsPerRack: totalRacks > 0 ? totalLevels / totalRacks : 0
    };
  }
}