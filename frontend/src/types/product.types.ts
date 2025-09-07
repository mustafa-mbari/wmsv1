export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost?: number;
  category: string;
  categoryId: number;
  stock: number;
  minStock: number;
  maxStock: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  unit: string;
  barcode?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  uomId?: string;
  leadTime?: number;
  imageUrl?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}