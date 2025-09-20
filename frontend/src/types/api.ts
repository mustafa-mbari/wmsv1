// API Types - Standardized response interfaces

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message?: string;
  errors?: any[];
  status?: number;
  meta?: {
    timestamp?: string;
    correlationId?: string;
    pagination?: PaginationMeta;
    [key: string]: any;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
  value?: any;
}

export interface BulkOperationResult<T> {
  operation: string;
  successful: number;
  failed: number;
  results: T[];
  errors: Array<{
    item: any;
    error: string;
  }>;
}

// Domain-specific types
export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  cost: number;
  category_id?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  status?: string;
  stock_quantity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  roles: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  location_id: string;
  movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  unit_cost?: number;
  reference_number?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}