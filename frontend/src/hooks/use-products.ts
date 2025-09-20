// Product Hooks - Layer 2: React-specific state management and caching
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { Product, ApiResponse } from '@/types/api';
import { toast } from '@/hooks/use-toast';

// Query keys for React Query
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: any) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  analytics: () => [...productKeys.all, 'analytics'] as const,
};

/**
 * Hook for managing products list with pagination and filtering
 */
export function useProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for getting a single product
 */
export function useProduct(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProduct(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for product mutations (create, update, delete)
 */
export function useProductMutations() {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: (productData: Partial<Product>) => productService.createProduct(productData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create product',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive',
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productService.updateProduct(id, data),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update product',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: (response, id) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        queryClient.removeQueries({ queryKey: productKeys.detail(id) });
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete product',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  const updateStock = useMutation({
    mutationFn: ({
      id,
      stockData,
    }: {
      id: string;
      stockData: { quantity: number; operation: 'add' | 'subtract' | 'set'; reason?: string };
    }) => productService.updateProductStock(id, stockData),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
        toast({
          title: 'Success',
          description: 'Product stock updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update stock',
          variant: 'destructive',
        });
      }
    },
  });

  const bulkOperations = useMutation({
    mutationFn: ({ operation, products }: { operation: 'create' | 'update' | 'delete'; products: any[] }) =>
      productService.bulkOperations(operation, products),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        toast({
          title: 'Success',
          description: `Bulk ${response.data?.operation} completed. ${response.data?.successful} successful, ${response.data?.failed} failed.`,
        });
      }
    },
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    bulkOperations,
  };
}

/**
 * Hook for product analytics
 */
export function useProductAnalytics() {
  return useQuery({
    queryKey: productKeys.analytics(),
    queryFn: () => productService.getProductAnalytics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for product search with debouncing
 */
export function useProductSearch() {
  const [searchQuery, setSearchQuery] = useState<any>({});
  const [debouncedQuery, setDebouncedQuery] = useState<any>({});

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchResult = useQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: () => productService.searchProducts(debouncedQuery),
    enabled: Object.keys(debouncedQuery).length > 0,
  });

  const updateSearch = useCallback((newQuery: any) => {
    setSearchQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery({});
    setDebouncedQuery({});
  }, []);

  return {
    searchQuery,
    searchResult,
    updateSearch,
    clearSearch,
    isSearching: searchResult.isFetching,
  };
}

/**
 * Hook for local product state management
 */
export function useProductState() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<any>({});

  const selectProduct = useCallback((product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const selectAllProducts = useCallback((products: Product[]) => {
    setSelectedProducts(products);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const updateFilters = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    selectedProducts,
    currentProduct,
    filters,
    selectProduct,
    selectAllProducts,
    clearSelection,
    setCurrentProduct,
    updateFilters,
    clearFilters,
    hasSelection: selectedProducts.length > 0,
    selectionCount: selectedProducts.length,
  };
}