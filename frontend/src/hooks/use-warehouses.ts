// Layer 2: Custom Hooks for Warehouse Management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { warehouseService } from '@/services/warehouse.service';
import { Warehouse } from '@/types/api';

// Query keys for React Query
export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...warehouseKeys.lists(), params] as const,
  details: () => [...warehouseKeys.all, 'detail'] as const,
  detail: (id: string) => [...warehouseKeys.details(), id] as const,
};

// Warehouse data fetching hooks
export function useWarehouses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: warehouseKeys.list(params || {}),
    queryFn: () => warehouseService.getWarehouses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: () => warehouseService.getWarehouse(id),
    enabled: !!id,
  });
}

// Warehouse mutation hooks
export function useWarehouseMutations() {
  const queryClient = useQueryClient();

  const createWarehouse = useMutation({
    mutationFn: warehouseService.createWarehouse.bind(warehouseService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });

  const updateWarehouse = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Warehouse> }) =>
      warehouseService.updateWarehouse(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
    },
  });

  const deleteWarehouse = useMutation({
    mutationFn: warehouseService.deleteWarehouse.bind(warehouseService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });

  const bulkOperations = useMutation({
    mutationFn: ({ operation, warehouses }: { operation: 'create' | 'update' | 'delete'; warehouses: any[] }) =>
      warehouseService.bulkOperations(operation, warehouses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });

  return {
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    bulkOperations,
  };
}

// Warehouse state management hooks
export function useWarehouseState() {
  const [selectedWarehouses, setSelectedWarehouses] = useState<Warehouse[]>([]);
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse | null>(null);

  const selectWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouses(prev => {
      const exists = prev.find(p => p.id === warehouse.id);
      if (exists) {
        return prev.filter(p => p.id !== warehouse.id);
      } else {
        return [...prev, warehouse];
      }
    });
  };

  const clearSelection = () => {
    setSelectedWarehouses([]);
  };

  const hasSelection = selectedWarehouses.length > 0;
  const selectionCount = selectedWarehouses.length;

  return {
    selectedWarehouses,
    currentWarehouse,
    selectWarehouse,
    clearSelection,
    setCurrentWarehouse,
    hasSelection,
    selectionCount,
  };
}

// Warehouse search hooks
export function useWarehouseSearch() {
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  const updateSearch = (params: Record<string, any>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  };

  const clearSearch = () => {
    setSearchParams({});
  };

  return {
    searchParams,
    updateSearch,
    clearSearch,
  };
}