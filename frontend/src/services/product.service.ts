// Product Service - Layer 3: Business logic and data transformation for products
import { apiFacade } from '@/lib/facades/api-facade';
import { ApiResponse, Product, BulkOperationResult } from '@/types/api';

export class ProductService {
  private readonly baseEndpoint = '/api/products';

  /**
   * Get all products with optional filtering and pagination
   */
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: string;
    status?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<ApiResponse<Product[]>> {
    return apiFacade.getPaginated<Product>(this.baseEndpoint, params);
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return apiFacade.get<Product>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Get a product by SKU
   */
  async getProductBySku(sku: string): Promise<ApiResponse<Product>> {
    return apiFacade.get<Product>(`${this.baseEndpoint}/sku/${sku}`);
  }

  /**
   * Create a new product
   */
  async createProduct(productData: Partial<Product>): Promise<ApiResponse<Product>> {
    // Transform and validate data before sending
    const transformedData = this.transformProductData(productData);
    return apiFacade.post<Product>(this.baseEndpoint, transformedData);
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    const transformedData = this.transformProductData(productData);
    return apiFacade.put<Product>(`${this.baseEndpoint}/${id}`, transformedData);
  }

  /**
   * Update product stock
   */
  async updateProductStock(
    id: string,
    stockData: {
      quantity: number;
      operation: 'add' | 'subtract' | 'set';
      reason?: string;
    }
  ): Promise<ApiResponse<Product>> {
    return apiFacade.patch<Product>(`${this.baseEndpoint}/${id}/stock`, stockData);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return apiFacade.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Bulk operations on products
   */
  async bulkOperations(
    operation: 'create' | 'update' | 'delete',
    products: any[]
  ): Promise<ApiResponse<BulkOperationResult<Product>>> {
    return apiFacade.bulk<BulkOperationResult<Product>>(
      `${this.baseEndpoint}/bulk`,
      operation,
      products
    );
  }

  /**
   * Get product analytics
   */
  async getProductAnalytics(): Promise<ApiResponse<any>> {
    return apiFacade.get(`${this.baseEndpoint}/analytics`);
  }

  /**
   * Export products
   */
  async exportProducts(format: 'csv' | 'excel' = 'csv'): Promise<ApiResponse<any>> {
    return apiFacade.get(`${this.baseEndpoint}/export`, { format });
  }

  /**
   * Search products with advanced filters
   */
  async searchProducts(searchQuery: {
    name?: string;
    sku?: string;
    category_id?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Product[]>> {
    return apiFacade.getPaginated<Product>(this.baseEndpoint, searchQuery);
  }

  /**
   * Transform product data before sending to API
   */
  private transformProductData(productData: Partial<Product>): any {
    // Add any necessary transformations here
    const transformed = { ...productData };

    // Convert string numbers to actual numbers
    if (transformed.price) {
      transformed.price = Number(transformed.price);
    }
    if (transformed.cost) {
      transformed.cost = Number(transformed.cost);
    }
    if (transformed.stock_quantity) {
      transformed.stock_quantity = Number(transformed.stock_quantity);
    }

    // Clean up empty strings
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === '') {
        delete transformed[key];
      }
    });

    return transformed;
  }

  /**
   * Validate product data
   */
  validateProductData(productData: Partial<Product>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!productData.name?.trim()) {
      errors.push('Product name is required');
    }

    if (productData.price !== undefined && (isNaN(Number(productData.price)) || Number(productData.price) < 0)) {
      errors.push('Price must be a valid positive number');
    }

    if (productData.cost !== undefined && (isNaN(Number(productData.cost)) || Number(productData.cost) < 0)) {
      errors.push('Cost must be a valid positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const productService = new ProductService();