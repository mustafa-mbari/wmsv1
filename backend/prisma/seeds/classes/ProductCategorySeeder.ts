// prisma/seeds/classes/ProductCategorySeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';

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
    return 'products.json';
  }

  getDependencies(): string[] {
    return [];
  }

  protected async loadData(): Promise<CategorySeedData[]> {
    try {
      // Cast the result to our expected types - this fixes the TypeScript error
      const rawData = await this.jsonReader.readJsonFile<ProductsJsonStructure | CategorySeedData[]>('products.json');
      
      // Type guard to check if it's an array
      if (Array.isArray(rawData)) {
        console.log('📖 Loading categories from array format');
        return rawData as CategorySeedData[];
      }
      
      // Type guard to check if it's an object with categories property
      if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
        const structuredData = rawData as ProductsJsonStructure;
        
        // Now TypeScript knows that structuredData has the categories property
        if (structuredData.categories) {
          console.log(`📖 Loading ${structuredData.categories.length || 0} categories from structured format`);
          return structuredData.categories;
        }
      }
      
      console.warn('⚠️ No categories found in products.json');
      return [];
    } catch (error) {
      console.error(`❌ Failed to load categories:`, error);
      return [];
    }
  }

  validateRecord(record: CategorySeedData): boolean {
    if (!record.name || !record.slug) {
      console.error('Category missing required fields:', record);
      return false;
    }
    
    const slugRegex = /^[a-z0-9_-]+$/;
    if (!slugRegex.test(record.slug)) {
      console.error('Invalid category slug:', record.slug);
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
        console.warn(`⚠️ Parent category '${record.parent_slug}' not found for '${record.slug}'`);
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

    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach(category => {
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