// prisma/seeds/classes/ProductFamilySeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';
import logger from '../../../src/utils/logger/logger';

export interface FamilySeedData {
  name: string;
  description?: string;
  category_slug?: string;
  is_active?: boolean;
  family_code?: string;
  attributes?: string[];
}

// Define the structure of the products.json file - this fixes the TypeScript error
interface ProductsJsonStructure {
  categories?: any[];
  families?: FamilySeedData[];
  products?: any[];
}

export class ProductFamilySeeder extends BaseSeed<FamilySeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'product_families';
  }

  getJsonFileName(): string {
    return 'product-families.json';
  }

  getDependencies(): string[] {
    return ['product_categories'];
  }

  protected async loadData(): Promise<FamilySeedData[]> {
    try {
      const rawData = await this.jsonReader.readJsonFile<FamilySeedData>('product-families.json');
      
      if (Array.isArray(rawData)) {
        logger.info(`Loading ${rawData.length} families from product-families.json`, { 
          source: 'ProductFamilySeeder', 
          method: 'loadData', 
          familiesCount: rawData.length 
        });
        return rawData;
      }
      
      logger.warn('No families found in product-families.json', { source: 'ProductFamilySeeder', method: 'loadData' });
      return [];
    } catch (error) {
      logger.error('Failed to load families', { source: 'ProductFamilySeeder', method: 'loadData', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  validateRecord(record: FamilySeedData): boolean {
    if (!record.name) {
      logger.error('Family missing required name', { source: 'ProductFamilySeeder', method: 'validateRecord', record });
      return false;
    }

    if (record.name.length > 100) {
      logger.error('Family name too long (max 100 characters)', { source: 'ProductFamilySeeder', method: 'validateRecord', name: record.name, length: record.name.length });
      return false;
    }

    if (record.family_code && record.family_code.length > 10) {
      logger.error('Family code too long (max 10 characters)', { source: 'ProductFamilySeeder', method: 'validateRecord', family_code: record.family_code, length: record.family_code.length });
      return false;
    }

    return true;
  }

  async transformRecord(record: FamilySeedData): Promise<any> {
    let category_id = null;
    
    if (record.category_slug) {
      const category = await this.prisma.product_categories.findUnique({
        where: { slug: record.category_slug }
      });
      category_id = category?.id || null;
      
      if (!category) {
        logger.warn(`Category '${record.category_slug}' not found for family '${record.name}'`, { source: 'ProductFamilySeeder', method: 'transformRecord', category_slug: record.category_slug, family_name: record.name });
      }
    }

    return {
      name: record.name.trim(),
      description: record.description?.trim() || null,
      category_id,
      is_active: record.is_active !== false
    };
  }

  async findExistingRecord(record: FamilySeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { name: record.name }
      });
    });
  }

  // Helper method to get families by category
  async getFamiliesByCategory(): Promise<{ [categoryName: string]: any[] }> {
    const families = await this.getModel().findMany({
      where: { is_active: true },
      include: {
        product_categories: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const result: { [categoryName: string]: any[] } = {};

    families.forEach((family: any) => {
      const categoryName = family.product_categories?.name || 'Uncategorized';
      if (!result[categoryName]) {
        result[categoryName] = [];
      }
      result[categoryName].push(family);
    });

    return result;
  }

  // Helper method to validate family-category relationships
  async validateFamilyCategoryRelationships(): Promise<{
    orphanFamilies: string[];
    recommendations: string[];
  }> {
    const families = await this.getModel().findMany({
      include: {
        product_categories: true
      }
    });

    const result = {
      orphanFamilies: [] as string[],
      recommendations: [] as string[]
    };

    families.forEach((family: any) => {
      if (!family.product_categories) {
        result.orphanFamilies.push(family.name);
      }
    });

    if (result.orphanFamilies.length > 0) {
      result.recommendations.push('Assign categories to all product families for better organization');
    }

    const categoryUsage = new Map<string, number>();
    families.forEach((family: any) => {
      if (family.product_categories) {
        const count = categoryUsage.get(family.product_categories.name) || 0;
        categoryUsage.set(family.product_categories.name, count + 1);
      }
    });

    const overusedCategories = Array.from(categoryUsage.entries())
      .filter(([_, count]) => count > 10)
      .map(([name, _]) => name);

    if (overusedCategories.length > 0) {
      result.recommendations.push('Consider creating subcategories for categories with many families: ' + overusedCategories.join(', '));
    }

    return result;
  }
}