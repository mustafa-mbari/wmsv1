// prisma/seeds/classes/ProductAttributeOptionSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';
import logger from '../../../src/utils/logger/logger';

export interface ProductAttributeOptionSeedData {
  attribute_slug: string;
  value: string;
  label: string;
  sort_order?: number;
  is_active?: boolean;
}

export class ProductAttributeOptionSeeder extends BaseSeed<ProductAttributeOptionSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'product_attribute_options';
  }

  getJsonFileName(): string {
    return 'product_attribute_options.json';
  }

  getDependencies(): string[] {
    return ['product_attributes'];
  }

  protected async loadData(): Promise<ProductAttributeOptionSeedData[]> {
    try {
      const rawData = await this.jsonReader.readJsonFile('product_attribute_options.json');
      
      // Check if it's an array (direct attribute options)
      if (Array.isArray(rawData)) {
        logger.info(`Loading ${rawData.length} product attribute options from array format`, { source: 'ProductAttributeOptionSeeder', method: 'loadData' });
        return rawData as ProductAttributeOptionSeedData[];
      }
      
      // Check if it's an object with product_attribute_options property
      if (rawData && typeof rawData === 'object') {
        const data = rawData as any;
        if (data.product_attribute_options && Array.isArray(data.product_attribute_options)) {
          logger.info(`Loading ${data.product_attribute_options.length} product attribute options from structured format`, { source: 'ProductAttributeOptionSeeder', method: 'loadData' });
          return data.product_attribute_options as ProductAttributeOptionSeedData[];
        }
      }
      
      logger.warn('No product attribute options found in product_attribute_options.json', { source: 'ProductAttributeOptionSeeder', method: 'loadData' });
      return [];
    } catch (error) {
      logger.error('Failed to load product attribute options', { source: 'ProductAttributeOptionSeeder', method: 'loadData', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  validateRecord(record: ProductAttributeOptionSeedData): boolean {
    // Check required fields
    if (!record.attribute_slug || !record.value || !record.label) {
      logger.error('Product attribute option missing required fields (attribute_slug, value, label)', { source: 'ProductAttributeOptionSeeder', method: 'validateRecord', record });
      return false;
    }

    // Value validation
    if (record.value.length > 200) {
      logger.error('Product attribute option value too long (max 200 characters)', { source: 'ProductAttributeOptionSeeder', method: 'validateRecord', value: record.value, length: record.value.length });
      return false;
    }

    // Label validation
    if (record.label.length > 200) {
      logger.error('Product attribute option label too long (max 200 characters)', { source: 'ProductAttributeOptionSeeder', method: 'validateRecord', label: record.label, length: record.label.length });
      return false;
    }

    // Sort order validation
    if (record.sort_order !== undefined && record.sort_order < 0) {
      logger.error('Sort order cannot be negative', { source: 'ProductAttributeOptionSeeder', method: 'validateRecord', sort_order: record.sort_order });
      return false;
    }

    return true;
  }

  async transformRecord(record: ProductAttributeOptionSeedData): Promise<any> {
    // Get attribute ID from attribute_slug
    let attribute_id = null;
    if (record.attribute_slug) {
      try {
        const attribute = await this.prisma.product_attributes.findUnique({
          where: { slug: record.attribute_slug }
        });
        attribute_id = attribute?.id || null;
        
        if (!attribute) {
          logger.warn(`Attribute '${record.attribute_slug}' not found for option '${record.value}'`, { source: 'ProductAttributeOptionSeeder', method: 'transformRecord', attribute_slug: record.attribute_slug, value: record.value });
        }
      } catch (error) {
        logger.warn(`Error finding attribute '${record.attribute_slug}'`, { source: 'ProductAttributeOptionSeeder', method: 'transformRecord', attribute_slug: record.attribute_slug, error: error instanceof Error ? error.message : error });
      }
    }

    if (!attribute_id) {
      throw new Error(`Cannot create attribute option: attribute '${record.attribute_slug}' not found`);
    }

    return {
      attribute_id,
      value: record.value.trim(),
      label: record.label.trim(),
      sort_order: record.sort_order || 0,
      is_active: record.is_active !== false
    };
  }

  async findExistingRecord(record: ProductAttributeOptionSeedData): Promise<any> {
    try {
      // First get the attribute ID
      const attribute = await this.prisma.product_attributes.findUnique({
        where: { slug: record.attribute_slug }
      });

      if (!attribute) {
        return null;
      }

      return await this.getModel().findFirst({
        where: {
          AND: [
            { attribute_id: attribute.id },
            { value: record.value }
          ]
        }
      });
    } catch (error) {
      logger.error('Error finding existing product attribute option', { source: 'ProductAttributeOptionSeeder', method: 'findExistingRecord', error: error instanceof Error ? error.message : error });
      return null;
    }
  }

  // Helper method to get options by attribute slug
  async getOptionsByAttribute(attributeSlug: string): Promise<any[]> {
    try {
      const attribute = await this.prisma.product_attributes.findUnique({
        where: { slug: attributeSlug }
      });

      if (!attribute) {
        logger.warn(`Attribute '${attributeSlug}' not found`, { source: 'ProductAttributeOptionSeeder', method: 'getOptionsByAttribute', attributeSlug });
        return [];
      }

      return await this.getModel().findMany({
        where: {
          AND: [
            { attribute_id: attribute.id },
            { is_active: true },
            { deleted_at: null }
          ]
        },
        orderBy: { sort_order: 'asc' }
      });
    } catch (error) {
      logger.error('Error getting options by attribute', { source: 'ProductAttributeOptionSeeder', method: 'getOptionsByAttribute', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  // Helper method to get attribute option statistics
  async getOptionStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byAttribute: { [key: string]: number };
  }> {
    try {
      const options = await this.getModel().findMany({
        where: { deleted_at: null },
        include: {
          product_attributes: {
            select: { slug: true, name: true }
          }
        }
      });
      
      const stats = {
        total: options.length,
        active: options.filter(o => o.is_active).length,
        inactive: options.filter(o => !o.is_active).length,
        byAttribute: {} as { [key: string]: number }
      };

      // Count by attribute
      options.forEach(option => {
        const attributeName = option.product_attributes?.name || 'Unknown';
        stats.byAttribute[attributeName] = (stats.byAttribute[attributeName] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting option statistics', { source: 'ProductAttributeOptionSeeder', method: 'getOptionStatistics', error: error instanceof Error ? error.message : error });
      return {
        total: 0, active: 0, inactive: 0, byAttribute: {}
      };
    }
  }

  // Helper method to validate option data integrity
  async validateOptionData(): Promise<{
    duplicateValues: string[];
    orphanedOptions: string[];
    missingAttributes: string[];
    recommendations: string[];
  }> {
    try {
      const options = await this.getModel().findMany({
        where: { deleted_at: null },
        include: {
          product_attributes: {
            select: { id: true, slug: true, name: true }
          }
        }
      });

      const result = {
        duplicateValues: [] as string[],
        orphanedOptions: [] as string[],
        missingAttributes: [] as string[],
        recommendations: [] as string[]
      };

      // Group by attribute_id and check for duplicates
      const attributeMap = new Map<number, Map<string, number>>();
      
      options.forEach(option => {
        if (!option.product_attributes) {
          result.orphanedOptions.push(`Option ID ${option.id} (${option.value})`);
          return;
        }

        const attributeId = option.attribute_id;
        if (!attributeMap.has(attributeId)) {
          attributeMap.set(attributeId, new Map());
        }

        const valueMap = attributeMap.get(attributeId)!;
        const count = valueMap.get(option.value) || 0;
        valueMap.set(option.value, count + 1);
      });

      // Find duplicate values within the same attribute
      attributeMap.forEach((valueMap, attributeId) => {
        valueMap.forEach((count, value) => {
          if (count > 1) {
            const attribute = options.find(o => o.attribute_id === attributeId)?.product_attributes;
            result.duplicateValues.push(`${attribute?.name || 'Unknown'}: ${value} (${count} times)`);
          }
        });
      });

      // Generate recommendations
      if (result.duplicateValues.length > 0) {
        result.recommendations.push('Fix duplicate values within the same attribute');
      }
      if (result.orphanedOptions.length > 0) {
        result.recommendations.push('Remove orphaned options without valid attributes');
      }

      return result;
    } catch (error) {
      logger.error('Error validating option data', { source: 'ProductAttributeOptionSeeder', method: 'validateOptionData', error: error instanceof Error ? error.message : error });
      return {
        duplicateValues: [],
        orphanedOptions: [],
        missingAttributes: [],
        recommendations: ['Error occurred during validation']
      };
    }
  }

  // Helper method to create bulk options for an attribute
  async createBulkOptions(attributeSlug: string, options: Array<{value: string, label: string, sort_order?: number}>): Promise<void> {
    try {
      const attribute = await this.prisma.product_attributes.findUnique({
        where: { slug: attributeSlug }
      });

      if (!attribute) {
        throw new Error(`Attribute '${attributeSlug}' not found`);
      }

      const optionsToCreate = options.map((option, index) => ({
        attribute_id: attribute.id,
        value: option.value.trim(),
        label: option.label.trim(),
        sort_order: option.sort_order !== undefined ? option.sort_order : index,
        is_active: true
      }));

      await this.getModel().createMany({
        data: optionsToCreate,
        skipDuplicates: true
      });

      logger.info(`Created ${optionsToCreate.length} options for attribute '${attributeSlug}'`, { source: 'ProductAttributeOptionSeeder', method: 'createBulkOptions', attributeSlug, count: optionsToCreate.length });
    } catch (error) {
      logger.error('Error creating bulk options', { source: 'ProductAttributeOptionSeeder', method: 'createBulkOptions', error: error instanceof Error ? error.message : error });
      throw error;
    }
  }
}