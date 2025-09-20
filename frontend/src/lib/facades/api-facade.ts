// API Facade - Layer 4: Provides a simplified interface to the underlying API client
import { apiClient } from '../api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export class ApiFacade {
  /**
   * Generic GET request with standardized response handling
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(endpoint, { params });
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generic POST request with standardized response handling
   */
  async post<T>(endpoint: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(endpoint, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generic PUT request with standardized response handling
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put(endpoint, data);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generic PATCH request with standardized response handling
   */
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch(endpoint, data);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generic DELETE request with standardized response handling
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete(endpoint);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Paginated GET request
   */
  async getPaginated<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    try {
      const response = await apiClient.get(endpoint, { params });
      return this.handleResponse<PaginatedResponse<T>>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * File upload request
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Bulk operations request
   */
  async bulk<T>(endpoint: string, operation: string, items: any[]): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(endpoint, {
        operation,
        items
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Health check request
   */
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/health');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Standardized response handler
   */
  private handleResponse<T>(response: any): ApiResponse<T> {
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message,
      meta: response.data?.meta,
      status: response.status,
      errors: response.data?.errors
    };
  }

  /**
   * Standardized error handler
   */
  private handleError(error: any): ApiResponse<any> {
    const errorResponse = error.response?.data || {};

    return {
      success: false,
      data: null,
      message: errorResponse.message || error.message || 'An unexpected error occurred',
      errors: errorResponse.errors || [],
      status: error.response?.status || 500,
      meta: errorResponse.meta
    };
  }
}

// Export singleton instance
export const apiFacade = new ApiFacade();