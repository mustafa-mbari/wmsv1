// prisma/seeds/classes/ProductAttributeSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';
import logger from '../../../src/utils/logger/logger';

export interface ProductAttributeSeedData {
  name: string;
  slug: string;
  type: string;
  description?: string;
  is_required?: boolean;
  is_filterable?: boolean;
  is_searchable?: boolean;
  sort_order?: number;
  is_active?: boolean;
}

export class ProductAttributeSeeder extends BaseSeed<ProductAttributeSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'product_attributes';
  }

  getJsonFileName(): string {
    return 'product_attributes.json';
  }

  getDependencies(): string[] {
    return [];
  }

  protected async loadData(): Promise<ProductAttributeSeedData[]> {
    try {
      const rawData = await this.jsonReader.readJsonFile('product_attributes.json');
      
      // Check if it's an array (direct attributes)
      if (Array.isArray(rawData)) {
        logger.info(`Loading ${rawData.length} product attributes from array format`, { source: 'ProductAttributeSeeder', method: 'loadData' });
        return rawData as ProductAttributeSeedData[];
      }
      
      // Check if it's an object with product_attributes property
      if (rawData && typeof rawData === 'object') {
        const data = rawData as any;
        if (data.product_attributes && Array.isArray(data.product_attributes)) {
          logger.info(`Loading ${data.product_attributes.length} product attributes from structured format`, { source: 'ProductAttributeSeeder', method: 'loadData' });
          return data.product_attributes as ProductAttributeSeedData[];
        }
      }
      
      logger.warn('No product attributes found in product_attributes.json', { source: 'ProductAttributeSeeder', method: 'loadData' });
      return [];
    } catch (error) {
      logger.error('Failed to load product attributes', { source: 'ProductAttributeSeeder', method: 'loadData', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  validateRecord(record: ProductAttributeSeedData): boolean {
    // Check required fields
    if (!record.name || !record.slug || !record.type) {
      logger.error('Product attribute missing required fields (name, slug, type)', { source: 'ProductAttributeSeeder', method: 'validateRecord', record });
      return false;
    }

    // Name validation
    if (record.name.length > 100) {
      logger.error('Product attribute name too long (max 100 characters)', { source: 'ProductAttributeSeeder', method: 'validateRecord', name: record.name, length: record.name.length });
      return false;
    }

    // Slug validation
    const slugRegex = /^[a-z0-9_-]+$/;
    if (!slugRegex.test(record.slug)) {
      logger.error('Invalid slug format (use lowercase, numbers, _ or -)', { source: 'ProductAttributeSeeder', method: 'validateRecord', slug: record.slug });
      return false;
    }

    if (record.slug.length > 100) {
      logger.error('Product attribute slug too long (max 100 characters)', { source: 'ProductAttributeSeeder', method: 'validateRecord', slug: record.slug, length: record.slug.length });
      return false;
    }

    // Type validation
    const validTypes = ['text', 'number', 'boolean', 'date', 'select', 'multiselect', 'textarea'];
    if (!validTypes.includes(record.type)) {
      logger.error('Invalid attribute type', { source: 'ProductAttributeSeeder', method: 'validateRecord', type: record.type, validTypes });
      return false;
    }

    if (record.type.length > 50) {
      logger.error('Product attribute type too long (max 50 characters)', { source: 'ProductAttributeSeeder', method: 'validateRecord', type: record.type, length: record.type.length });
      return false;
    }

    // Sort order validation
    if (record.sort_order !== undefined && record.sort_order < 0) {
      logger.error('Sort order cannot be negative', { source: 'ProductAttributeSeeder', method: 'validateRecord', sort_order: record.sort_order });
      return false;
    }

    return true;
  }

  async transformRecord(record: ProductAttributeSeedData): Promise<any> {
    return {
      name: record.name.trim(),
      slug: record.slug.toLowerCase().trim(),
      type: record.type.trim(),
      description: record.description?.trim() || null,
      is_required: record.is_required || false,
      is_filterable: record.is_filterable || false,
      is_searchable: record.is_searchable || false,
      sort_order: record.sort_order || 0,
      is_active: record.is_active !== false
    };
  }

  async findExistingRecord(record: ProductAttributeSeedData): Promise<any> {
    try {
      return await this.getModel().findFirst({
        where: {
          OR: [
            { slug: record.slug.toLowerCase() },
            { name: record.name }
          ]
        }
      });
    } catch (error) {
      logger.error('Error finding existing product attribute', { source: 'ProductAttributeSeeder', method: 'findExistingRecord', error: error instanceof Error ? error.message : error });
      return null;
    }
  }

  // Helper method to validate slug format
  validateSlug(slug: string): boolean {
    if (!slug || typeof slug !== 'string') return false;
    const slugRegex = /^[a-z0-9_-]+$/;
    return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 100;
  }

  // Helper method to get attribute statistics
  async getAttributeStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    required: number;
    optional: number;
    filterable: number;
    searchable: number;
    byType: { [key: string]: number };
  }> {
    try {
      const attributes = await this.getModel().findMany({
        where: { deleted_at: null }
      });
      
      const stats = {
        total: attributes.length,
        active: attributes.filter(a => a.is_active).length,
        inactive: attributes.filter(a => !a.is_active).length,
        required: attributes.filter(a => a.is_required).length,
        optional: attributes.filter(a => !a.is_required).length,
        filterable: attributes.filter(a => a.is_filterable).length,
        searchable: attributes.filter(a => a.is_searchable).length,
        byType: {} as { [key: string]: number }
      };

      // Count by type
      attributes.forEach(attribute => {
        const type = attribute.type;
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting attribute statistics', { source: 'ProductAttributeSeeder', method: 'getAttributeStatistics', error: error instanceof Error ? error.message : error });
      return {
        total: 0, active: 0, inactive: 0, required: 0, optional: 0,
        filterable: 0, searchable: 0, byType: {}
      };
    }
  }

  // Helper method to get attributes by type
  async getAttributesByType(type: string): Promise<any[]> {
    try {
      return await this.getModel().findMany({
        where: {
          AND: [
            { type: type },
            { is_active: true },
            { deleted_at: null }
          ]
        },
        orderBy: { sort_order: 'asc' }
      });
    } catch (error) {
      logger.error('Error getting attributes by type', { source: 'ProductAttributeSeeder', method: 'getAttributesByType', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  // Helper method to generate slug from name
  generateSlug(name: string): string {
    if (!name || typeof name !== 'string') return '';
    
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/-+/g, '_') // Replace hyphens with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }

  // Helper method to validate attribute data integrity
  async validateAttributeData(): Promise<{
    duplicateSlugs: string[];
    duplicateNames: string[];
    invalidTypes: string[];
    recommendations: string[];
  }> {
    try {
      const attributes = await this.getModel().findMany({
        where: { deleted_at: null }
      });

      const result = {
        duplicateSlugs: [] as string[],
        duplicateNames: [] as string[],
        invalidTypes: [] as string[],
        recommendations: [] as string[]
      };

      // Check for duplicates
      const slugMap = new Map<string, number>();
      const nameMap = new Map<string, number>();
      const validTypes = ['text', 'number', 'boolean', 'date', 'select', 'multiselect', 'textarea'];

      attributes.forEach(attribute => {
        // Slug duplicates
        const slugCount = slugMap.get(attribute.slug) || 0;
        slugMap.set(attribute.slug, slugCount + 1);

        // Name duplicates
        const nameCount = nameMap.get(attribute.name) || 0;
        nameMap.set(attribute.name, nameCount + 1);

        // Invalid types
        if (!validTypes.includes(attribute.type)) {
          result.invalidTypes.push(`${attribute.name} (${attribute.type})`);
        }
      });

      // Find duplicates
      slugMap.forEach((count, slug) => {
        if (count > 1) {
          result.duplicateSlugs.push(slug);
        }
      });

      nameMap.forEach((count, name) => {
        if (count > 1) {
          result.duplicateNames.push(name);
        }
      });

      // Generate recommendations
      if (result.duplicateSlugs.length > 0) {
        result.recommendations.push('Fix duplicate slugs to ensure uniqueness');
      }
      if (result.duplicateNames.length > 0) {
        result.recommendations.push('Fix duplicate names to ensure uniqueness');
      }
      if (result.invalidTypes.length > 0) {
        result.recommendations.push('Fix invalid attribute types');
      }

      return result;
    } catch (error) {
      logger.error('Error validating attribute data', { source: 'ProductAttributeSeeder', method: 'validateAttributeData', error: error instanceof Error ? error.message : error });
      return {
        duplicateSlugs: [],
        duplicateNames: [],
        invalidTypes: [],
        recommendations: ['Error occurred during validation']
      };
    }
  }
}