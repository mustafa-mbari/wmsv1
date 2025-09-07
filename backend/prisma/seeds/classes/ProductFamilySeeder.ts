// prisma/seeds/classes/ProductFamilySeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';

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
    return 'products.json';
  }

  getDependencies(): string[] {
    return ['product_categories'];
  }

  protected async loadData(): Promise<FamilySeedData[]> {
    try {
      // Cast the result to our expected types - this fixes the TypeScript error
      const rawData = await this.jsonReader.readJsonFile<ProductsJsonStructure | FamilySeedData[]>('products.json');
      
      // Type guard to check if it's an array
      if (Array.isArray(rawData)) {
        console.log('📖 No families found in array format');
        return [];
      }
      
      // Type guard to check if it's an object with families property
      if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
        const structuredData = rawData as ProductsJsonStructure;
        
        // Now TypeScript knows that structuredData has the families property
        if (structuredData.families) {
          console.log(`📖 Loading ${structuredData.families.length || 0} families from structured format`);
          return structuredData.families;
        }
      }
      
      console.warn('⚠️ No families found in products.json');
      return [];
    } catch (error) {
      console.error(`❌ Failed to load families:`, error);
      return [];
    }
  }

  validateRecord(record: FamilySeedData): boolean {
    if (!record.name) {
      console.error('Family missing required name:', record);
      return false;
    }

    if (record.name.length > 100) {
      console.error('Family name too long (max 100 characters):', record.name);
      return false;
    }

    if (record.family_code && record.family_code.length > 10) {
      console.error('Family code too long (max 10 characters):', record.family_code);
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
        console.warn(`⚠️ Category '${record.category_slug}' not found for family '${record.name}'`);
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

    families.forEach(family => {
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

    families.forEach(family => {
      if (!family.product_categories) {
        result.orphanFamilies.push(family.name);
      }
    });

    if (result.orphanFamilies.length > 0) {
      result.recommendations.push('Assign categories to all product families for better organization');
    }

    const categoryUsage = new Map<string, number>();
    families.forEach(family => {
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