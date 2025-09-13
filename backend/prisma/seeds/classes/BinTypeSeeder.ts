// prisma/seeds/classes/BinTypeSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';
import logger from '../../../src/utils/logger/logger';

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
    return 'warehouse_bin_types';
  }

  getJsonFileName(): string {
    return 'bin-types.json';
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
    // Calculate standard volume if not provided
    const calculatedVolume = record.standard_volume ||
      (record.standard_length * record.standard_width * record.standard_height) / 1000000; // Convert cm³ to m³

    return {
      type_id: record.type_id.trim(),
      type_code: record.type_code.toUpperCase().trim(),
      type_name: record.type_name.trim(),
      description: record.description?.trim() || null,
      storage_class: record.storage_class?.toUpperCase().trim() || null,
      standard_length: record.standard_length,
      standard_width: record.standard_width,
      standard_height: record.standard_height,
      standard_volume: calculatedVolume,
      standard_weight: record.standard_weight || null,
      max_payload: record.max_payload,
      is_stackable: record.is_stackable !== false,
      max_stack_count: record.max_stack_count || 1,
      stackable_with: record.stackable_with ? JSON.stringify(record.stackable_with) : null,
      material: record.material.trim(),
      color: record.color?.trim() || null,
      is_transparent: record.is_transparent || false,
      is_foldable: record.is_foldable || false,
      requires_cleaning: record.requires_cleaning || false,
      cleaning_frequency_days: record.cleaning_frequency_days || null,
      is_hazardous_material: record.is_hazardous_material || false,
      temperature_range: record.temperature_range?.trim() || null,
      default_barcode_prefix: record.default_barcode_prefix?.trim() || null,
      default_color_code: record.default_color_code?.trim() || null,
      label_position: record.label_position?.trim() || null,
      average_cost: record.average_cost || null,
      expected_lifespan_months: record.expected_lifespan_months || null,
      depreciation_rate: record.depreciation_rate || null,
      custom_fields: record.custom_fields || null,
      notes: record.notes?.trim() || null,
      is_active: record.is_active !== false
    };
  }

  async findExistingRecord(record: BinTypeSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      const result = await this.prisma.$queryRaw`
        SELECT * FROM warehouse.bin_types
        WHERE type_id = ${record.type_id} OR type_code = ${record.type_code.toUpperCase()}
        LIMIT 1
      `;
      return Array.isArray(result) && result.length > 0 ? result[0] : null;
    });
  }

  // Override getModel to work with warehouse schema
  protected getModel() {
    return {
      count: () => this.prisma.$queryRaw`SELECT COUNT(*) as count FROM warehouse.bin_types`,
      create: (data: any) => this.prisma.$queryRaw`
        INSERT INTO warehouse.bin_types (
          type_id, type_code, type_name, description, storage_class,
          standard_length, standard_width, standard_height, standard_volume,
          standard_weight, max_payload, is_stackable, max_stack_count, stackable_with,
          material, color, is_transparent, is_foldable, requires_cleaning,
          cleaning_frequency_days, is_hazardous_material, temperature_range,
          default_barcode_prefix, default_color_code, label_position,
          average_cost, expected_lifespan_months, depreciation_rate,
          custom_fields, notes, is_active, created_at, updated_at, created_by, updated_by
        ) VALUES (
          ${data.data.type_id}, ${data.data.type_code}, ${data.data.type_name},
          ${data.data.description}, ${data.data.storage_class}, ${data.data.standard_length},
          ${data.data.standard_width}, ${data.data.standard_height}, ${data.data.standard_volume},
          ${data.data.standard_weight}, ${data.data.max_payload}, ${data.data.is_stackable},
          ${data.data.max_stack_count}, ${data.data.stackable_with}::jsonb, ${data.data.material},
          ${data.data.color}, ${data.data.is_transparent}, ${data.data.is_foldable},
          ${data.data.requires_cleaning}, ${data.data.cleaning_frequency_days},
          ${data.data.is_hazardous_material}, ${data.data.temperature_range},
          ${data.data.default_barcode_prefix}, ${data.data.default_color_code},
          ${data.data.label_position}, ${data.data.average_cost}, ${data.data.expected_lifespan_months},
          ${data.data.depreciation_rate}, ${data.data.custom_fields}::jsonb, ${data.data.notes},
          ${data.data.is_active}, ${data.data.created_at}, ${data.data.updated_at},
          ${data.data.created_by}, ${data.data.updated_by}
        )
      `,
      update: (params: any) => this.prisma.$queryRaw`
        UPDATE warehouse.bin_types SET
          type_code = ${params.data.type_code},
          type_name = ${params.data.type_name},
          description = ${params.data.description},
          storage_class = ${params.data.storage_class},
          standard_length = ${params.data.standard_length},
          standard_width = ${params.data.standard_width},
          standard_height = ${params.data.standard_height},
          standard_volume = ${params.data.standard_volume},
          standard_weight = ${params.data.standard_weight},
          max_payload = ${params.data.max_payload},
          is_stackable = ${params.data.is_stackable},
          max_stack_count = ${params.data.max_stack_count},
          stackable_with = ${params.data.stackable_with}::jsonb,
          material = ${params.data.material},
          color = ${params.data.color},
          is_transparent = ${params.data.is_transparent},
          is_foldable = ${params.data.is_foldable},
          requires_cleaning = ${params.data.requires_cleaning},
          cleaning_frequency_days = ${params.data.cleaning_frequency_days},
          is_hazardous_material = ${params.data.is_hazardous_material},
          temperature_range = ${params.data.temperature_range},
          default_barcode_prefix = ${params.data.default_barcode_prefix},
          default_color_code = ${params.data.default_color_code},
          label_position = ${params.data.label_position},
          average_cost = ${params.data.average_cost},
          expected_lifespan_months = ${params.data.expected_lifespan_months},
          depreciation_rate = ${params.data.depreciation_rate},
          custom_fields = ${params.data.custom_fields}::jsonb,
          notes = ${params.data.notes},
          is_active = ${params.data.is_active},
          updated_at = ${params.data.updated_at},
          updated_by = ${params.data.updated_by}
        WHERE type_id = ${params.where.type_id || ''}
      `
    };
  }

  // Override hasExistingData to work with warehouse schema
  protected async hasExistingData(): Promise<boolean> {
    try {
      const result = await this.prisma.$queryRaw`SELECT COUNT(*) as count FROM warehouse.bin_types`;
      const count = Array.isArray(result) && result[0] ? Number((result[0] as any).count) : 0;
      return count > 0;
    } catch (error) {
      logger.error(`Error checking existing data for bin types`, {
        source: 'BinTypeSeeder',
        method: 'hasExistingData',
        error: error instanceof Error ? error.message : error
      });
      return false;
    }
  }

  // Helper method to get bin type statistics
  async getBinTypeStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byMaterial: { [material: string]: number };
    byStorageClass: { [class: string]: number };
    stackableTypes: number;
    foldableTypes: number;
    hazardousTypes: number;
    requiresCleaning: number;
    averageLifespan: number;
    totalVolume: number;
  }> {
    const types = await this.prisma.$queryRaw`
      SELECT * FROM warehouse.bin_types
    ` as any[];

    const stats = {
      total: types.length,
      active: types.filter(t => t.is_active).length,
      inactive: types.filter(t => !t.is_active).length,
      byMaterial: {} as { [material: string]: number },
      byStorageClass: {} as { [class: string]: number },
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