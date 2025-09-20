// Warehouse Service - Layer 3: Business logic and data transformation for warehouses
import { apiFacade } from '@/lib/facades/api-facade';
import { ApiResponse, Warehouse, BulkOperationResult } from '@/types/api';

export class WarehouseService {
  private readonly baseEndpoint = '/api/warehouses';

  /**
   * Get all warehouses with optional filtering and pagination
   */
  async getWarehouses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<ApiResponse<Warehouse[]>> {
    return apiFacade.getPaginated<Warehouse>(this.baseEndpoint, params);
  }

  /**
   * Get a single warehouse by ID
   */
  async getWarehouse(id: string): Promise<ApiResponse<Warehouse>> {
    return apiFacade.get<Warehouse>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Get a warehouse by code
   */
  async getWarehouseByCode(code: string): Promise<ApiResponse<Warehouse>> {
    return apiFacade.get<Warehouse>(`${this.baseEndpoint}/code/${code}`);
  }

  /**
   * Create a new warehouse
   */
  async createWarehouse(warehouseData: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> {
    // Transform and validate data before sending
    const transformedData = this.transformWarehouseData(warehouseData);
    return apiFacade.post<Warehouse>(this.baseEndpoint, transformedData);
  }

  /**
   * Update an existing warehouse
   */
  async updateWarehouse(id: string, warehouseData: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> {
    const transformedData = this.transformWarehouseData(warehouseData);
    return apiFacade.put<Warehouse>(`${this.baseEndpoint}/${id}`, transformedData);
  }

  /**
   * Delete a warehouse
   */
  async deleteWarehouse(id: string): Promise<ApiResponse<void>> {
    return apiFacade.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Bulk operations on warehouses
   */
  async bulkOperations(
    operation: 'create' | 'update' | 'delete',
    warehouses: any[]
  ): Promise<ApiResponse<BulkOperationResult<Warehouse>>> {
    return apiFacade.bulk<BulkOperationResult<Warehouse>>(
      `${this.baseEndpoint}/bulk`,
      operation,
      warehouses
    );
  }

  /**
   * Get warehouse analytics
   */
  async getWarehouseAnalytics(): Promise<ApiResponse<any>> {
    return apiFacade.get(`${this.baseEndpoint}/analytics`);
  }

  /**
   * Export warehouses
   */
  async exportWarehouses(format: 'csv' | 'excel' = 'csv'): Promise<ApiResponse<any>> {
    return apiFacade.get(`${this.baseEndpoint}/export`, { format });
  }

  /**
   * Search warehouses with advanced filters
   */
  async searchWarehouses(searchQuery: {
    name?: string;
    code?: string;
    status?: string;
    city?: string;
    state?: string;
    country?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Warehouse[]>> {
    return apiFacade.getPaginated<Warehouse>(this.baseEndpoint, searchQuery);
  }

  /**
   * Transform warehouse data before sending to API
   */
  private transformWarehouseData(warehouseData: Partial<Warehouse>): any {
    // Add any necessary transformations here
    const transformed = { ...warehouseData };

    // Clean up empty strings
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === '') {
        delete transformed[key];
      }
    });

    return transformed;
  }

  /**
   * Validate warehouse data
   */
  validateWarehouseData(warehouseData: Partial<Warehouse>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!warehouseData.name?.trim()) {
      errors.push('Warehouse name is required');
    }

    if (!warehouseData.code?.trim()) {
      errors.push('Warehouse code is required');
    }

    if (warehouseData.address) {
      if (!warehouseData.address.street?.trim()) {
        errors.push('Street address is required');
      }
      if (!warehouseData.address.city?.trim()) {
        errors.push('City is required');
      }
      if (!warehouseData.address.state?.trim()) {
        errors.push('State is required');
      }
      if (!warehouseData.address.country?.trim()) {
        errors.push('Country is required');
      }
      if (!warehouseData.address.postal_code?.trim()) {
        errors.push('Postal code is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const warehouseService = new WarehouseService();