// prisma/seeds/classes/ProductAttributeValueSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '.././BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface ProductAttributeValueSeedData {
  product_sku: string;
  attribute_slug: string;
  value?: string;
  option_value?: string;
}

export class ProductAttributeValueSeeder extends BaseSeed<ProductAttributeValueSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'product_attribute_values';
  }

  getJsonFileName(): string {
    return 'product/product_attribute_values.json';
  }

  getDependencies(): string[] {
    return ['products', 'product_attributes', 'product_attribute_options'];
  }

  protected async loadData(): Promise<ProductAttributeValueSeedData[]> {
    try {
      const rawData = await this.jsonReader.readJsonFile('product_attribute_values.json');
      
      // Check if it's an array (direct attribute values)
      if (Array.isArray(rawData)) {
        logger.info(`Loading ${rawData.length} product attribute values from array format`, { source: 'ProductAttributeValueSeeder', method: 'loadData' });
        return rawData as ProductAttributeValueSeedData[];
      }
      
      // Check if it's an object with product_attribute_values property
      if (rawData && typeof rawData === 'object') {
        const data = rawData as any;
        if (data.product_attribute_values && Array.isArray(data.product_attribute_values)) {
          logger.info(`Loading ${data.product_attribute_values.length} product attribute values from structured format`, { source: 'ProductAttributeValueSeeder', method: 'loadData' });
          return data.product_attribute_values as ProductAttributeValueSeedData[];
        }
      }
      
      logger.warn('No product attribute values found in product_attribute_values.json', { source: 'ProductAttributeValueSeeder', method: 'loadData' });
      return [];
    } catch (error) {
      logger.error('Failed to load product attribute values', { source: 'ProductAttributeValueSeeder', method: 'loadData', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  validateRecord(record: ProductAttributeValueSeedData): boolean {
    // Check required fields
    if (!record.product_sku || !record.attribute_slug) {
      logger.error('Product attribute value missing required fields (product_sku, attribute_slug)', { source: 'ProductAttributeValueSeeder', method: 'validateRecord', record });
      return false;
    }

    // Must have either value or option_value
    if (!record.value && !record.option_value) {
      logger.error('Product attribute value must have either value or option_value', { source: 'ProductAttributeValueSeeder', method: 'validateRecord', record });
      return false;
    }

    // Cannot have both value and option_value
    if (record.value && record.option_value) {
      logger.error('Product attribute value cannot have both value and option_value', { source: 'ProductAttributeValueSeeder', method: 'validateRecord', record });
      return false;
    }

    return true;
  }

  async transformRecord(record: ProductAttributeValueSeedData): Promise<any> {
    // Get product ID from product_sku
    let product_id = null;
    if (record.product_sku) {
      try {
        const product = await this.prisma.products.findUnique({
          where: { sku: record.product_sku.toUpperCase() }
        });
        product_id = product?.id || null;
        
        if (!product) {
          logger.warn(`Product '${record.product_sku}' not found for attribute value`, { source: 'ProductAttributeValueSeeder', method: 'transformRecord', product_sku: record.product_sku, attribute_slug: record.attribute_slug });
        }
      } catch (error) {
        logger.warn(`Error finding product '${record.product_sku}'`, { source: 'ProductAttributeValueSeeder', method: 'transformRecord', product_sku: record.product_sku, error: error instanceof Error ? error.message : error });
      }
    }

    if (!product_id) {
      throw new Error(`Cannot create attribute value: product '${record.product_sku}' not found`);
    }

    // Get attribute ID from attribute_slug
    let attribute_id = null;
    if (record.attribute_slug) {
      try {
        const attribute = await this.prisma.product_attributes.findUnique({
          where: { slug: record.attribute_slug }
        });
        attribute_id = attribute?.id || null;
        
        if (!attribute) {
          logger.warn(`Attribute '${record.attribute_slug}' not found for product '${record.product_sku}'`, { source: 'ProductAttributeValueSeeder', method: 'transformRecord', attribute_slug: record.attribute_slug, product_sku: record.product_sku });
        }
      } catch (error) {
        logger.warn(`Error finding attribute '${record.attribute_slug}'`, { source: 'ProductAttributeValueSeeder', method: 'transformRecord', attribute_slug: record.attribute_slug, error: error instanceof Error ? error.message : error });
      }
    }

    if (!attribute_id) {
      throw new Error(`Cannot create attribute value: attribute '${record.attribute_slug}' not found`);
    }

    // Get option ID if option_value is provided
    let option_id = null;
    if (record.option_value) {
      try {
        const option = await this.prisma.product_attribute_options.findFirst({
          where: {
            AND: [
              { attribute_id: attribute_id },
              { value: record.option_value }
            ]
          }
        });
        option_id = option?.id || null;
        
        if (!option) {
          logger.warn(`Option '${record.option_value}' not found for attribute '${record.attribute_slug}'`, { source: 'ProductAttributeValueSeeder', method: 'transformRecord', option_value: record.option_value, attribute_slug: record.attribute_slug });
          // For option values, we should fail if the option doesn't exist
          throw new Error(`Option '${record.option_value}' not found for attribute '${record.attribute_slug}'`);
        }
      } catch (error) {
        logger.warn(`Error finding option '${record.option_value}' for attribute '${record.attribute_slug}'`, { source: 'ProductAttributeValueSeeder', method: 'transformRecord', option_value: record.option_value, attribute_slug: record.attribute_slug, error: error instanceof Error ? error.message : error });
        throw error;
      }
    }

    return {
      product_id,
      attribute_id,
      value: record.value?.trim() || null,
      option_id
    };
  }

  async findExistingRecord(record: ProductAttributeValueSeedData): Promise<any> {
    try {
      // First get the product and attribute IDs
      const product = await this.prisma.products.findUnique({
        where: { sku: record.product_sku.toUpperCase() }
      });

      const attribute = await this.prisma.product_attributes.findUnique({
        where: { slug: record.attribute_slug }
      });

      if (!product || !attribute) {
        return null;
      }

      return await this.getModel().findFirst({
        where: {
          AND: [
            { product_id: product.id },
            { attribute_id: attribute.id }
          ]
        }
      });
    } catch (error) {
      logger.error('Error finding existing product attribute value', { source: 'ProductAttributeValueSeeder', method: 'findExistingRecord', error: error instanceof Error ? error.message : error });
      return null;
    }
  }

  // Helper method to get values by product SKU
  async getValuesByProduct(productSku: string): Promise<any[]> {
    try {
      const product = await this.prisma.products.findUnique({
        where: { sku: productSku.toUpperCase() }
      });

      if (!product) {
        logger.warn(`Product '${productSku}' not found`, { source: 'ProductAttributeValueSeeder', method: 'getValuesByProduct', productSku });
        return [];
      }

      return await this.getModel().findMany({
        where: {
          AND: [
            { product_id: product.id },
            { deleted_at: null }
          ]
        },
        include: {
          product_attributes: {
            select: { slug: true, name: true, type: true }
          },
          product_attribute_options: {
            select: { value: true, label: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error getting values by product', { source: 'ProductAttributeValueSeeder', method: 'getValuesByProduct', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  // Helper method to get values by attribute slug
  async getValuesByAttribute(attributeSlug: string): Promise<any[]> {
    try {
      const attribute = await this.prisma.product_attributes.findUnique({
        where: { slug: attributeSlug }
      });

      if (!attribute) {
        logger.warn(`Attribute '${attributeSlug}' not found`, { source: 'ProductAttributeValueSeeder', method: 'getValuesByAttribute', attributeSlug });
        return [];
      }

      return await this.getModel().findMany({
        where: {
          AND: [
            { attribute_id: attribute.id },
            { deleted_at: null }
          ]
        },
        include: {
          products: {
            select: { sku: true, name: true }
          },
          product_attribute_options: {
            select: { value: true, label: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error getting values by attribute', { source: 'ProductAttributeValueSeeder', method: 'getValuesByAttribute', error: error instanceof Error ? error.message : error });
      return [];
    }
  }

  // Helper method to get attribute value statistics
  async getValueStatistics(): Promise<{
    total: number;
    withTextValue: number;
    withOptionValue: number;
    byAttribute: { [key: string]: number };
    byProduct: { [key: string]: number };
  }> {
    try {
      const values = await this.getModel().findMany({
        where: { deleted_at: null },
        include: {
          product_attributes: {
            select: { slug: true, name: true }
          },
          products: {
            select: { sku: true, name: true }
          }
        }
      });
      
      const stats = {
        total: values.length,
        withTextValue: values.filter(v => v.value !== null).length,
        withOptionValue: values.filter(v => v.option_id !== null).length,
        byAttribute: {} as { [key: string]: number },
        byProduct: {} as { [key: string]: number }
      };

      // Count by attribute
      values.forEach(value => {
        const attributeName = value.product_attributes?.name || 'Unknown';
        stats.byAttribute[attributeName] = (stats.byAttribute[attributeName] || 0) + 1;

        const productName = value.products?.name || 'Unknown';
        stats.byProduct[productName] = (stats.byProduct[productName] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting value statistics', { source: 'ProductAttributeValueSeeder', method: 'getValueStatistics', error: error instanceof Error ? error.message : error });
      return {
        total: 0, withTextValue: 0, withOptionValue: 0, byAttribute: {}, byProduct: {}
      };
    }
  }

  // Helper method to validate attribute value data integrity
  async validateValueData(): Promise<{
    orphanedValues: string[];
    missingProducts: string[];
    missingAttributes: string[];
    duplicateValues: string[];
    recommendations: string[];
  }> {
    try {
      const values = await this.getModel().findMany({
        where: { deleted_at: null },
        include: {
          products: {
            select: { id: true, sku: true, name: true }
          },
          product_attributes: {
            select: { id: true, slug: true, name: true }
          },
          product_attribute_options: {
            select: { id: true, value: true }
          }
        }
      });

      const result = {
        orphanedValues: [] as string[],
        missingProducts: [] as string[],
        missingAttributes: [] as string[],
        duplicateValues: [] as string[],
        recommendations: [] as string[]
      };

      // Check for orphaned values and duplicates
      const duplicateMap = new Map<string, number>();

      values.forEach(value => {
        // Check for missing products
        if (!value.products) {
          result.orphanedValues.push(`Value ID ${value.id} - missing product`);
        }

        // Check for missing attributes
        if (!value.product_attributes) {
          result.orphanedValues.push(`Value ID ${value.id} - missing attribute`);
        }

        // Check for duplicates (same product + attribute combination)
        if (value.products && value.product_attributes) {
          const key = `${value.products.sku}_${value.product_attributes.slug}`;
          const count = duplicateMap.get(key) || 0;
          duplicateMap.set(key, count + 1);
        }
      });

      // Find duplicate combinations
      duplicateMap.forEach((count, key) => {
        if (count > 1) {
          result.duplicateValues.push(`${key} (${count} times)`);
        }
      });

      // Generate recommendations
      if (result.orphanedValues.length > 0) {
        result.recommendations.push('Remove orphaned values without valid products or attributes');
      }
      if (result.duplicateValues.length > 0) {
        result.recommendations.push('Fix duplicate product-attribute combinations');
      }

      return result;
    } catch (error) {
      logger.error('Error validating value data', { source: 'ProductAttributeValueSeeder', method: 'validateValueData', error: error instanceof Error ? error.message : error });
      return {
        orphanedValues: [],
        missingProducts: [],
        missingAttributes: [],
        duplicateValues: [],
        recommendations: ['Error occurred during validation']
      };
    }
  }

  // Helper method to create bulk values for a product
  async createBulkValuesForProduct(productSku: string, attributeValues: Array<{attributeSlug: string, value?: string, optionValue?: string}>): Promise<void> {
    try {
      const product = await this.prisma.products.findUnique({
        where: { sku: productSku.toUpperCase() }
      });

      if (!product) {
        throw new Error(`Product '${productSku}' not found`);
      }

      for (const attrValue of attributeValues) {
        const attribute = await this.prisma.product_attributes.findUnique({
          where: { slug: attrValue.attributeSlug }
        });

        if (!attribute) {
          logger.warn(`Attribute '${attrValue.attributeSlug}' not found for product '${productSku}'`, { source: 'ProductAttributeValueSeeder', method: 'createBulkValuesForProduct' });
          continue;
        }

        let option_id = null;
        if (attrValue.optionValue) {
          const option = await this.prisma.product_attribute_options.findFirst({
            where: {
              AND: [
                { attribute_id: attribute.id },
                { value: attrValue.optionValue }
              ]
            }
          });
          option_id = option?.id || null;
        }

        // Check if value already exists
        const existingValue = await this.getModel().findFirst({
          where: {
            AND: [
              { product_id: product.id },
              { attribute_id: attribute.id }
            ]
          }
        });

        if (!existingValue) {
          await this.getModel().create({
            data: {
              product_id: product.id,
              attribute_id: attribute.id,
              value: attrValue.value || null,
              option_id
            }
          });
        }
      }

      logger.info(`Created attribute values for product '${productSku}'`, { source: 'ProductAttributeValueSeeder', method: 'createBulkValuesForProduct', productSku, count: attributeValues.length });
    } catch (error) {
      logger.error('Error creating bulk values for product', { source: 'ProductAttributeValueSeeder', method: 'createBulkValuesForProduct', error: error instanceof Error ? error.message : error });
      throw error;
    }
  }
}