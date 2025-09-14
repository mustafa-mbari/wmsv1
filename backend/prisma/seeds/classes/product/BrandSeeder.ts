// prisma/seeds/classes/BrandSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '.././BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface BrandSeedData {
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo_url?: string;
  is_active?: boolean;
}

export class BrandSeeder extends BaseSeed<BrandSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'product_brands';
  }

  getJsonFileName(): string {
    return 'product/brands.json';
  }

  getDependencies(): string[] {
    return [];
  }

  protected async loadData(): Promise<BrandSeedData[]> {
    try {
      const rawData = await this.jsonReader.readJsonFile('brands.json');
      
      // Check if it's an array (direct brands)
      if (Array.isArray(rawData)) {
        logger.info(`Loading ${rawData.length} brands from array format`, { source: 'BrandSeeder', method: 'loadData' });
        return rawData as BrandSeedData[];
      }
      
      // Check if it's an object with brands property
      if (rawData && typeof rawData === 'object') {
        const data = rawData as any;
        if (data.brands && Array.isArray(data.brands)) {
          logger.info(`Loading ${data.brands.length} brands from structured format`, { source: 'BrandSeeder', method: 'loadData' });
          return data.brands as BrandSeedData[];
        }
      }
      
      logger.warn('No brands found in brands.json', { source: 'BrandSeeder', method: 'loadData' });
      return [];
    } catch (error) {
      logger.error('Failed to load brands', { source: 'BrandSeeder', method: 'loadData', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  validateRecord(record: BrandSeedData): boolean {
    // Check required fields
    if (!record.name || !record.slug) {
      logger.error('Brand missing required fields (name, slug)', { source: 'BrandSeeder', method: 'validateRecord', record });
      return false;
    }

    // Name validation
    if (record.name.length > 100) {
      logger.error('Brand name too long (max 100 characters)', { source: 'BrandSeeder', method: 'validateRecord', name: record.name, length: record.name.length });
      return false;
    }

    // Slug validation
    const slugRegex = /^[a-z0-9_-]+$/;
    if (!slugRegex.test(record.slug)) {
      logger.error('Invalid slug format (use lowercase, numbers, _ or -)', { source: 'BrandSeeder', method: 'validateRecord', slug: record.slug });
      return false;
    }

    if (record.slug.length > 100) {
      logger.error('Brand slug too long (max 100 characters)', { source: 'BrandSeeder', method: 'validateRecord', slug: record.slug, length: record.slug.length });
      return false;
    }

    // Website validation (if provided)
    if (record.website && record.website.length > 255) {
      logger.error('Brand website URL too long (max 255 characters)', { source: 'BrandSeeder', method: 'validateRecord', website: record.website, length: record.website.length });
      return false;
    }

    // Logo URL validation (if provided)
    if (record.logo_url && record.logo_url.length > 255) {
      logger.error('Brand logo URL too long (max 255 characters)', { source: 'BrandSeeder', method: 'validateRecord', logo_url: record.logo_url, length: record.logo_url.length });
      return false;
    }

    return true;
  }

  async transformRecord(record: BrandSeedData): Promise<any> {
    return {
      name: record.name.trim(),
      slug: record.slug.toLowerCase().trim(),
      description: record.description?.trim() || null,
      website: record.website?.trim() || null,
      logo_url: record.logo_url?.trim() || null,
      is_active: record.is_active !== false
    };
  }

  async findExistingRecord(record: BrandSeedData): Promise<any> {
    try {
      return await this.prisma.product_brands.findFirst({
        where: {
          OR: [
            { slug: record.slug.toLowerCase() },
            { name: record.name }
          ]
        }
      });
    } catch (error) {
      logger.error('Error finding existing brand', { source: 'BrandSeeder', method: 'findExistingRecord', error: error instanceof Error ? error.message : error });
      return null;
    }
  }

  // Helper method to validate slug format
  validateSlug(slug: string): boolean {
    if (!slug || typeof slug !== 'string') return false;
    const slugRegex = /^[a-z0-9_-]+$/;
    return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 100;
  }

  // Helper method to get brand statistics
  async getBrandStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withWebsite: number;
    withLogo: number;
  }> {
    try {
      const brands = await this.getModel().findMany({
        where: { deleted_at: null }
      });
      
      const stats = {
        total: brands.length,
        active: brands.filter(b => b.is_active).length,
        inactive: brands.filter(b => !b.is_active).length,
        withWebsite: brands.filter(b => b.website).length,
        withLogo: brands.filter(b => b.logo_url).length
      };

      return stats;
    } catch (error) {
      logger.error('Error getting brand statistics', { source: 'BrandSeeder', method: 'getBrandStatistics', error: error instanceof Error ? error.message : error });
      return {
        total: 0, active: 0, inactive: 0, withWebsite: 0, withLogo: 0
      };
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

  // Helper method to validate brand data integrity
  async validateBrandData(): Promise<{
    duplicateSlugs: string[];
    duplicateNames: string[];
    invalidWebsites: string[];
    recommendations: string[];
  }> {
    try {
      const brands = await this.getModel().findMany({
        where: { deleted_at: null }
      });

      const result = {
        duplicateSlugs: [] as string[],
        duplicateNames: [] as string[],
        invalidWebsites: [] as string[],
        recommendations: [] as string[]
      };

      // Check for duplicates
      const slugMap = new Map<string, number>();
      const nameMap = new Map<string, number>();

      brands.forEach(brand => {
        // Slug duplicates
        const slugCount = slugMap.get(brand.slug) || 0;
        slugMap.set(brand.slug, slugCount + 1);

        // Name duplicates
        const nameCount = nameMap.get(brand.name) || 0;
        nameMap.set(brand.name, nameCount + 1);

        // Website validation
        if (brand.website && !this.isValidUrl(brand.website)) {
          result.invalidWebsites.push(`${brand.name} (${brand.website})`);
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
      if (result.invalidWebsites.length > 0) {
        result.recommendations.push('Fix invalid website URLs');
      }

      return result;
    } catch (error) {
      logger.error('Error validating brand data', { source: 'BrandSeeder', method: 'validateBrandData', error: error instanceof Error ? error.message : error });
      return {
        duplicateSlugs: [],
        duplicateNames: [],
        invalidWebsites: [],
        recommendations: ['Error occurred during validation']
      };
    }
  }

  // Helper method to validate URL format
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}