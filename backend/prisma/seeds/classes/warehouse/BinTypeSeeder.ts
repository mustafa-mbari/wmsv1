// prisma/seeds/classes/BinTypeSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '../../../../src/utils/logger/logger';

export interface BinTypeSeedData {
  type_id: string;
  type_code: string;
  type_name: string;
  description?: string;
  storage_class?: string;
  standard_length: number;
  standard_width: number;
  standard_height: number;
  standard_volume?: number;
  standard_weight?: number;
  max_payload: number;
  is_stackable?: boolean;
  max_stack_count?: number;
  stackable_with?: string[];
  material: string;
  color?: string;
  is_transparent?: boolean;
  is_foldable?: boolean;
  requires_cleaning?: boolean;
  cleaning_frequency_days?: number;
  is_hazardous_material?: boolean;
  temperature_range?: string;
  default_barcode_prefix?: string;
  default_color_code?: string;
  label_position?: string;
  average_cost?: number;
  expected_lifespan_months?: number;
  depreciation_rate?: number;
  is_active?: boolean;
  custom_fields?: any;
  notes?: string;
}

export class BinTypeSeeder extends BaseSeed<BinTypeSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'bin_types';
  }

  getJsonFileName(): string {
    return 'warehouse/bin-types.json';
  }

  getDependencies(): string[] {
    return []; // Bin types have no dependencies
  }

  validateRecord(record: BinTypeSeedData): boolean {
    // Required fields validation
    if (!record.type_id || !record.type_code || !record.type_name || !record.material) {
      logger.error('Bin type record missing required fields', {
        source: 'BinTypeSeeder',
        method: 'validateRecord',
        record
      });
      return false;
    }

    // Type ID validation
    if (record.type_id.length > 20) {
      logger.error('Type ID too long (max 20 characters)', {
        source: 'BinTypeSeeder',
        method: 'validateRecord',
        type_id: record.type_id,
        length: record.type_id.length
      });
      return false;
    }

    // Type code validation
    if (record.type_code.length > 10) {
      logger.error('Type code too long (max 10 characters)', {
        source: 'BinTypeSeeder',
        method: 'validateRecord',
        type_code: record.type_code,
        length: record.type_code.length
      });
      return false;
    }

    // Type name validation
    if (record.type_name.length > 50) {
      logger.error('Type name too long (max 50 characters)', {
        source: 'BinTypeSeeder',
        method: 'validateRecord',
        type_name: record.type_name,
        length: record.type_name.length
      });
      return false;
    }

    // Dimensions validation
    if (record.standard_length <= 0 || record.standard_width <= 0 || record.standard_height <= 0) {
      logger.error('Standard dimensions must be positive', {
        source: 'BinTypeSeeder',
        method: 'validateRecord',
        standard_length: record.standard_length,
        standard_width: record.standard_width,
        standard_height: record.standard_height
      });
      return false;
    }

    // Max payload validation
    if (record.max_payload <= 0) {
      logger.error('Max payload must be positive', {
        source: 'BinTypeSeeder',
        method: 'validateRecord',
        max_payload: record.max_payload
      });
      return false;
    }

    // Stack count validation
    if (record.max_stack_count && record.max_stack_count < 1) {
      logger.error('Max stack count must be at least 1', {
        source: 'BinTypeSeeder',
        method: 'validateRecord',
        max_stack_count: record.max_stack_count
      });
      return false;
    }

    // Cleaning frequency validation
    if (record.cleaning_frequency_days && record.cleaning_frequency_days < 1) {
      logger.error('Cleaning frequency must be at least 1 day', {
        source: 'BinTypeSeeder',
        method: 'validateRecord',
        cleaning_frequency_days: record.cleaning_frequency_days
      });
      return false;
    }

    // Expected lifespan validation
    if (record.expected_lifespan_months && record.expected_lifespan_months < 1) {
      logger.error('Expected lifespan must be at least 1 month', {
        source: 'BinTypeSeeder',
        method: 'validateRecord',
        expected_lifespan_months: record.expected_lifespan_months
      });
      return false;
    }

    // Depreciation rate validation
    if (record.depreciation_rate && (record.depreciation_rate < 0 || record.depreciation_rate > 100)) {
      logger.error('Depreciation rate must be between 0 and 100', {
        source: 'BinTypeSeeder',
        method: 'validateRecord',
        depreciation_rate: record.depreciation_rate
      });
      return false;
    }

    return true;
  }

  async transformRecord(record: BinTypeSeedData): Promise<any> {
    return {
      bin_type_id: record.type_id.trim(),
      type_name: record.type_name.trim(),
      type_code: record.type_code.toUpperCase().trim(),
      description: record.description?.trim() || null,
      default_capacity: record.capacity || null,
      weight_capacity: record.max_payload || null,
      is_stackable: record.is_stackable !== false,
      stackable_height: record.max_stack_count || null,
      length: record.standard_length || null,
      width: record.standard_width || null,
      height: record.standard_height || null,
      dimension_unit: 'CM', // Default unit since data has length/width/height in cm
      material: record.material?.trim() || null,
      color: record.color?.trim() || null,
      is_active: record.is_active !== false,
      hazmat_approved: record.is_hazardous_material || false,
      temperature_controlled: record.temperature_controlled || false
    };
  }

  async findExistingRecord(record: BinTypeSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      const result = await this.prisma.$queryRaw`
        SELECT * FROM warehouse.bin_types
        WHERE bin_type_id = ${record.type_id} OR type_code = ${record.type_code.toUpperCase()}
        LIMIT 1
      `;
      return Array.isArray(result) && result.length > 0 ? result[0] : null;
    });
  }

  // Override getModel to work with warehouse schema

  // Helper method to get bin type statistics
  async getBinTypeStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byMaterial: { [material: string]: number };
    byStorageClass: { [storageClass: string]: number };
    stackableTypes: number;
    foldableTypes: number;
    hazardousTypes: number;
    requiresCleaning: number;
    averageLifespan: number;
    totalVolume: number;
  }> {
    const types = await this.getModel().findMany() as any[];

    const stats = {
      total: types.length,
      active: types.filter(t => t.is_active).length,
      inactive: types.filter(t => !t.is_active).length,
      byMaterial: {} as { [material: string]: number },
      byStorageClass: {} as { [storageClass: string]: number },
      stackableTypes: types.filter(t => t.is_stackable).length,
      foldableTypes: types.filter(t => t.is_foldable).length,
      hazardousTypes: types.filter(t => t.is_hazardous_material).length,
      requiresCleaning: types.filter(t => t.requires_cleaning).length,
      averageLifespan: 0,
      totalVolume: 0
    };

    let totalLifespan = 0;
    let typesWithLifespan = 0;

    types.forEach(type => {
      // Count by material
      stats.byMaterial[type.material] = (stats.byMaterial[type.material] || 0) + 1;

      // Count by storage class
      if (type.storage_class) {
        stats.byStorageClass[type.storage_class] = (stats.byStorageClass[type.storage_class] || 0) + 1;
      }

      // Calculate average lifespan
      if (type.expected_lifespan_months) {
        totalLifespan += type.expected_lifespan_months;
        typesWithLifespan++;
      }

      // Sum total volume
      if (type.standard_volume) {
        stats.totalVolume += type.standard_volume;
      }
    });

    stats.averageLifespan = typesWithLifespan > 0 ? totalLifespan / typesWithLifespan : 0;

    return stats;
  }

  // Helper method to validate bin type compatibility
  async validateBinTypeCompatibility(): Promise<{
    incompatibleStacking: string[];
    missingStackableWith: string[];
    recommendations: string[];
  }> {
    const types = await this.prisma.$queryRaw`
      SELECT type_id, type_code, is_stackable, stackable_with
      FROM warehouse.bin_types
      WHERE is_active = true
    ` as any[];

    const result = {
      incompatibleStacking: [] as string[],
      missingStackableWith: [] as string[],
      recommendations: [] as string[]
    };

    const typeMap = new Map(types.map(t => [t.type_id, t]));

    types.forEach(type => {
      if (type.is_stackable) {
        if (!type.stackable_with) {
          result.missingStackableWith.push(type.type_code);
        } else {
          try {
            const stackableWith = JSON.parse(type.stackable_with);
            stackableWith.forEach((compatibleTypeId: string) => {
              const compatibleType = typeMap.get(compatibleTypeId);
              if (!compatibleType) {
                result.incompatibleStacking.push(
                  `${type.type_code} references non-existent type: ${compatibleTypeId}`
                );
              } else if (!compatibleType.is_stackable) {
                result.incompatibleStacking.push(
                  `${type.type_code} can stack with ${compatibleType.type_code}, but ${compatibleType.type_code} is not stackable`
                );
              }
            });
          } catch (error) {
            result.incompatibleStacking.push(
              `${type.type_code} has invalid stackable_with JSON: ${type.stackable_with}`
            );
          }
        }
      }
    });

    // Generate recommendations
    if (result.missingStackableWith.length > 0) {
      result.recommendations.push('Define stackable_with relationships for stackable bin types');
    }

    if (result.incompatibleStacking.length > 0) {
      result.recommendations.push('Fix incompatible stacking relationships');
    }

    result.recommendations.push('Consider grouping bin types by size/weight compatibility for better stacking efficiency');

    return result;
  }
}