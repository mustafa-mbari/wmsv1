// prisma/seeds/classes/ProductSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';
import logger from '../../../src/utils/logger/logger';

export interface ProductSeedData {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  short_description?: string;
  category_slug?: string;
  family_name?: string;
  brand_slug?: string;
  unit_symbol?: string;
  price?: number;
  cost?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  status?: string;
  is_digital?: boolean;
  track_stock?: boolean;
  image_url?: string;
  images?: string[];
  tags?: string[];
  attributes?: { [key: string]: any };
}

export class ProductSeeder extends BaseSeed<ProductSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'products';
  }

  getJsonFileName(): string {
    return 'products.json';
  }

  getDependencies(): string[] {
    return ['product_categories', 'product_families', 'units_of_measure', 'brands'];
  }

  protected async loadData(): Promise<ProductSeedData[]> {
    try {
      const rawData = await this.jsonReader.readJsonFile('products.json');
      
      // Check if it's an array (direct products)
      if (Array.isArray(rawData)) {
        logger.info(`Loading ${rawData.length} products from array format`, { source: 'ProductSeeder', method: 'loadData' });
        return rawData as ProductSeedData[];
      }
      
      // Check if it's an object with products property
      if (rawData && typeof rawData === 'object') {
        const data = rawData as any;
        if (data.products && Array.isArray(data.products)) {
          logger.info(`Loading ${data.products.length} products from structured format`, { source: 'ProductSeeder', method: 'loadData' });
          return data.products as ProductSeedData[];
        }
      }
      
      logger.warn('No products found in products.json', { source: 'ProductSeeder', method: 'loadData' });
      return [];
    } catch (error) {
      logger.error('Failed to load products', { source: 'ProductSeeder', method: 'loadData', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  validateRecord(record: ProductSeedData): boolean {
    // Check required fields
    if (!record.name || !record.sku) {
      logger.error('Product missing required fields (name, sku)', { source: 'ProductSeeder', method: 'validateRecord', record });
      return false;
    }

    // SKU validation
    const skuRegex = /^[A-Z0-9_-]+$/;
    if (!skuRegex.test(record.sku)) {
      logger.error('Invalid SKU format (use uppercase, numbers, _ or -)', { source: 'ProductSeeder', method: 'validateRecord', sku: record.sku });
      return false;
    }

    if (record.sku.length > 100) {
      logger.error('SKU too long (max 100 characters)', { source: 'ProductSeeder', method: 'validateRecord', sku: record.sku, length: record.sku.length });
      return false;
    }

    if (record.name.length > 200) {
      logger.error('Product name too long (max 200 characters)', { source: 'ProductSeeder', method: 'validateRecord', name: record.name, length: record.name.length });
      return false;
    }

    // Price validation
    if (record.price !== undefined && record.price < 0) {
      logger.error('Product price cannot be negative', { source: 'ProductSeeder', method: 'validateRecord', price: record.price });
      return false;
    }

    if (record.cost !== undefined && record.cost < 0) {
      logger.error('Product cost cannot be negative', { source: 'ProductSeeder', method: 'validateRecord', cost: record.cost });
      return false;
    }

    // Stock validation
    if (record.stock_quantity !== undefined && record.stock_quantity < 0) {
      logger.error('Stock quantity cannot be negative', { source: 'ProductSeeder', method: 'validateRecord', stock_quantity: record.stock_quantity });
      return false;
    }

    // Barcode validation
    if (record.barcode && record.barcode.length > 100) {
      logger.error('Barcode too long (max 100 characters)', { source: 'ProductSeeder', method: 'validateRecord', barcode: record.barcode, length: record.barcode.length });
      return false;
    }

    return true;
  }

  async transformRecord(record: ProductSeedData): Promise<any> {
    // Get category ID if category_slug is provided
    let category_id = null;
    if (record.category_slug) {
      try {
        const category = await this.prisma.product_categories.findUnique({
          where: { slug: record.category_slug }
        });
        category_id = category?.id || null;
        
        if (!category) {
          logger.warn(`Category '${record.category_slug}' not found for product '${record.sku}'`, { source: 'ProductSeeder', method: 'transformRecord', category_slug: record.category_slug, sku: record.sku });
        }
      } catch (error) {
        logger.warn(`Error finding category '${record.category_slug}'`, { source: 'ProductSeeder', method: 'transformRecord', category_slug: record.category_slug, error: error instanceof Error ? error.message : error });
      }
    }

    // Get family ID if family_name is provided
    let family_id = null;
    if (record.family_name) {
      try {
        const family = await this.prisma.product_families.findFirst({
          where: { name: record.family_name }
        });
        family_id = family?.id || null;
        
        if (!family) {
          logger.warn(`Family '${record.family_name}' not found for product '${record.sku}'`, { source: 'ProductSeeder', method: 'transformRecord', family_name: record.family_name, sku: record.sku });
        }
      } catch (error) {
        logger.warn(`Error finding family '${record.family_name}'`, { source: 'ProductSeeder', method: 'transformRecord', family_name: record.family_name, error: error instanceof Error ? error.message : error });
      }
    }

    // Get unit ID if unit_symbol is provided
    let unit_id = null;
    if (record.unit_symbol) {
      try {
        const unit = await this.prisma.units_of_measure.findFirst({
          where: { symbol: record.unit_symbol }
        });
        unit_id = unit?.id || null;
        
        if (!unit) {
          logger.warn(`Unit '${record.unit_symbol}' not found for product '${record.sku}'`, { source: 'ProductSeeder', method: 'transformRecord', unit_symbol: record.unit_symbol, sku: record.sku });
        }
      } catch (error) {
        logger.warn(`Error finding unit '${record.unit_symbol}'`, { source: 'ProductSeeder', method: 'transformRecord', unit_symbol: record.unit_symbol, error: error instanceof Error ? error.message : error });
      }
    }

    // Get brand ID if brand_slug is provided
    let brand_id = null;
    if (record.brand_slug) {
      try {
        const brand = await this.prisma.brands.findUnique({
          where: { slug: record.brand_slug }
        });
        brand_id = brand?.id || null;
        
        if (!brand) {
          logger.warn(`Brand '${record.brand_slug}' not found for product '${record.sku}'`, { source: 'ProductSeeder', method: 'transformRecord', brand_slug: record.brand_slug, sku: record.sku });
        }
      } catch (error) {
        logger.warn(`Error finding brand '${record.brand_slug}'`, { source: 'ProductSeeder', method: 'transformRecord', brand_slug: record.brand_slug, error: error instanceof Error ? error.message : error });
      }
    }

    return {
      name: record.name.trim(),
      sku: record.sku.toUpperCase().trim(),
      barcode: record.barcode?.trim() || null,
      description: record.description?.trim() || null,
      short_description: record.short_description?.trim() || null,
      category_id,
      family_id,
      brand_id,
      unit_id,
      price: record.price || 0,
      cost: record.cost || 0,
      stock_quantity: record.stock_quantity || 0,
      min_stock_level: record.min_stock_level || 0,
      weight: record.weight || null,
      length: record.length || null,
      width: record.width || null,
      height: record.height || null,
      status: record.status || 'active',
      is_digital: record.is_digital || false,
      track_stock: record.track_stock !== false,
      image_url: record.image_url || null,
      images: record.images ? JSON.stringify(record.images) : null,
      tags: record.tags ? JSON.stringify(record.tags) : null
    };
  }

  async findExistingRecord(record: ProductSeedData): Promise<any> {
    try {
      return await this.getModel().findFirst({
        where: {
          OR: [
            { sku: record.sku.toUpperCase() },
            ...(record.barcode ? [{ barcode: record.barcode }] : [])
          ]
        }
      });
    } catch (error) {
      logger.error('Error finding existing product', { source: 'ProductSeeder', method: 'findExistingRecord', error: error instanceof Error ? error.message : error });
      return null;
    }
  }

  // Helper method to validate SKU format
  validateSKU(sku: string): boolean {
    if (!sku || typeof sku !== 'string') return false;
    const skuRegex = /^[A-Z0-9_-]+$/;
    return skuRegex.test(sku) && sku.length >= 3 && sku.length <= 100;
  }

  // Helper method to get product statistics
  async getProductStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    digital: number;
    physical: number;
    tracked: number;
    untracked: number;
    avgPrice: number;
    avgCost: number;
    totalValue: number;
  }> {
    try {
      const products = await this.getModel().findMany({
        where: { deleted_at: null }
      });
      
      const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        inactive: products.filter(p => p.status !== 'active').length,
        digital: products.filter(p => p.is_digital).length,
        physical: products.filter(p => !p.is_digital).length,
        tracked: products.filter(p => p.track_stock).length,
        untracked: products.filter(p => !p.track_stock).length,
        avgPrice: 0,
        avgCost: 0,
        totalValue: 0
      };

      if (products.length > 0) {
        const totalPrice = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
        const totalCost = products.reduce((sum, p) => sum + (Number(p.cost) || 0), 0);
        const totalInventoryValue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (p.stock_quantity || 0)), 0);

        stats.avgPrice = totalPrice / products.length;
        stats.avgCost = totalCost / products.length;
        stats.totalValue = totalInventoryValue;
      }

      return stats;
    } catch (error) {
      logger.error('Error getting product statistics', { source: 'ProductSeeder', method: 'getProductStatistics', error: error instanceof Error ? error.message : error });
      return {
        total: 0, active: 0, inactive: 0, digital: 0, physical: 0,
        tracked: 0, untracked: 0, avgPrice: 0, avgCost: 0, totalValue: 0
      };
    }
  }

  // Helper method to get low stock products
  async getLowStockProducts(threshold: number = 10): Promise<any[]> {
    try {
      return await this.getModel().findMany({
        where: {
          AND: [
            { status: 'active' },
            { track_stock: true },
            { deleted_at: null },
            { stock_quantity: { lte: threshold } }
          ]
        },
        orderBy: { stock_quantity: 'asc' }
      });
    } catch (error) {
      logger.error('Error getting low stock products', { source: 'ProductSeeder', method: 'getLowStockProducts', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  // Helper method to generate SKU suggestions
  generateSKU(productName: string, categorySlug?: string, familyName?: string): string {
    const sanitize = (str: string) => {
      if (!str || typeof str !== 'string') return '';
      return str.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3);
    };
    
    let sku = '';
    
    if (categorySlug) {
      sku += sanitize(categorySlug);
    }
    
    if (familyName) {
      sku += '-' + sanitize(familyName);
    }
    
    sku += '-' + sanitize(productName);
    
    // Add random suffix to ensure uniqueness
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    sku += '-' + suffix;
    
    return sku;
  }

  // Helper method to validate product data
  async validateProductData(): Promise<{
    duplicateSKUs: string[];
    duplicateBarcodes: string[];
    invalidPrices: string[];
    recommendations: string[];
  }> {
    try {
      const products = await this.getModel().findMany({
        where: { deleted_at: null }
      });

      const result = {
        duplicateSKUs: [] as string[],
        duplicateBarcodes: [] as string[],
        invalidPrices: [] as string[],
        recommendations: [] as string[]
      };

      // Check for duplicates
      const skuMap = new Map<string, number>();
      const barcodeMap = new Map<string, number>();

      products.forEach(product => {
        // SKU duplicates
        const skuCount = skuMap.get(product.sku) || 0;
        skuMap.set(product.sku, skuCount + 1);

        // Barcode duplicates
        if (product.barcode) {
          const barcodeCount = barcodeMap.get(product.barcode) || 0;
          barcodeMap.set(product.barcode, barcodeCount + 1);
        }

        // Invalid prices
        if (Number(product.price) <= 0 && product.status === 'active') {
          result.invalidPrices.push(product.sku);
        }
      });

      // Find duplicates
      skuMap.forEach((count, sku) => {
        if (count > 1) {
          result.duplicateSKUs.push(sku);
        }
      });

      barcodeMap.forEach((count, barcode) => {
        if (count > 1) {
          result.duplicateBarcodes.push(barcode);
        }
      });

      // Generate recommendations
      if (result.duplicateSKUs.length > 0) {
        result.recommendations.push('Fix duplicate SKUs to ensure uniqueness');
      }
      if (result.duplicateBarcodes.length > 0) {
        result.recommendations.push('Fix duplicate barcodes to ensure uniqueness');
      }
      if (result.invalidPrices.length > 0) {
        result.recommendations.push('Review products with zero or negative prices');
      }

      return result;
    } catch (error) {
      logger.error('Error validating product data', { source: 'ProductSeeder', method: 'validateProductData', error: error instanceof Error ? error.message : error });
      return {
        duplicateSKUs: [],
        duplicateBarcodes: [],
        invalidPrices: [],
        recommendations: ['Error occurred during validation']
      };
    }
  }
}