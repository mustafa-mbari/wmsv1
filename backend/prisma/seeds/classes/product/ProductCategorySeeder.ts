// prisma/seeds/classes/ProductCategorySeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '.././BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface CategorySeedData {
  name: string;
  slug: string;
  description?: string;
  parent_slug?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

// Define the structure of the products.json file - this is the key fix
interface ProductsJsonStructure {
  categories?: CategorySeedData[];
  families?: any[];
  products?: any[];
}

export class ProductCategorySeeder extends BaseSeed<CategorySeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'product_categories';
  }

  getJsonFileName(): string {
    return 'product/product-categories.json';
  }

  getDependencies(): string[] {
    return [];
  }

  protected async loadData(): Promise<CategorySeedData[]> {
    try {
      // Read from product-categories.json which is a simple array
      const rawData = await this.jsonReader.readJsonFile(this.getJsonFileName());
      
      if (Array.isArray(rawData)) {
        logger.info(`Loading ${rawData.length} categories from product-categories.json`, { 
          source: 'ProductCategorySeeder', 
          method: 'loadData', 
          categoriesCount: rawData.length 
        });
        return rawData as CategorySeedData[];
      }
      
      logger.warn('No categories found in product-categories.json or invalid format', { 
        source: 'ProductCategorySeeder', 
        method: 'loadData' 
      });
      return [];
    } catch (error) {
      logger.error('Failed to load categories', { 
        source: 'ProductCategorySeeder', 
        method: 'loadData', 
        error: error instanceof Error ? error.message : error 
      });
      return [];
    }
  }

  validateRecord(record: CategorySeedData): boolean {
    const missingFields: string[] = [];
    
    if (!record.name) {
      missingFields.push('name');
    }
    if (!record.slug) {
      missingFields.push('slug');
    }
    
    if (missingFields.length > 0) {
      logger.error(`Category missing required fields: ${missingFields.join(', ')}`, { 
        source: 'ProductCategorySeeder', 
        method: 'validateRecord', 
        record,
        missingFields 
      });
      console.error(`[ProductCategorySeeder]: Category missing required fields: ${missingFields.join(', ')}`, record);
      return false;
    }
    
    const slugRegex = /^[a-z0-9_-]+$/;
    if (!slugRegex.test(record.slug)) {
      logger.error('Invalid category slug format', { 
        source: 'ProductCategorySeeder', 
        method: 'validateRecord', 
        slug: record.slug,
        expected: 'lowercase letters, numbers, underscores, and hyphens only'
      });
      console.error(`[ProductCategorySeeder]: Invalid category slug format: '${record.slug}'. Expected lowercase letters, numbers, underscores, and hyphens only.`);
      return false;
    }
    
    return true;
  }

  async transformRecord(record: CategorySeedData): Promise<any> {
    let parent_id = null;
    
    if (record.parent_slug) {
      const parent = await this.prisma.product_categories.findUnique({
        where: { slug: record.parent_slug }
      });
      parent_id = parent?.id || null;
      
      if (!parent) {
        logger.warn(`Parent category '${record.parent_slug}' not found for '${record.slug}'`, { source: 'ProductCategorySeeder', method: 'transformRecord', parent_slug: record.parent_slug, category_slug: record.slug });
      }
    }

    return {
      name: record.name.trim(),
      slug: record.slug.toLowerCase().trim(),
      description: record.description?.trim() || null,
      parent_id,
      image_url: record.image_url || null,
      sort_order: record.sort_order || 0,
      is_active: record.is_active !== false
    };
  }

  async findExistingRecord(record: CategorySeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findUnique({
        where: { slug: record.slug.toLowerCase() }
      });
    });
  }

  // Helper method to build category tree
  async getCategoryTree(): Promise<any[]> {
    const categories = await this.getModel().findMany({
      where: { is_active: true },
      orderBy: [{ parent_id: 'asc' }, { sort_order: 'asc' }, { name: 'asc' }]
    });

    const categoryMap = new Map();
    const roots: any[] = [];

    categories.forEach((category: any) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach((category: any) => {
      const categoryNode = categoryMap.get(category.id);
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        roots.push(categoryNode);
      }
    });

    return roots;
  }
}