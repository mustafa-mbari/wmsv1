"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Navigation } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface WarehouseAisleData {
  aisle_id: string;
  zone_id: string;
  aisle_name: string;
  aisle_code?: string;
  lc_aisle_code?: string;
  lc_full_code?: string;
  description?: string;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit?: string;
  capacity?: number;
  aisle_direction?: string;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  zone_name?: string;
}

export function WarehouseAislesTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [aisles, setAisles] = useState<WarehouseAisleData[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  useEffect(() => {
    fetchAisles();
  }, []);

  const fetchAisles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v2/aisles');

      if (response.data?.success) {
        setAisles(response.data.data?.aisles || []);
      } else {
        setAisles([]);
      }
    } catch (error) {
      console.error('Error fetching aisles:', error);
      setAisles([]);
    } finally {
      setLoading(false);
    }
  };

  // Define column configuration for the table
  const columnConfig: ColumnConfig<WarehouseAisleData & TableData>[] = [
    {
      key: "lc_full_code",
      label: "LC Code",
      width: 120,
      render: (aisle) => (
        <span className="font-mono text-sm bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded">
          {aisle.lc_full_code || aisle.lc_aisle_code}
        </span>
      ),
    },
    {
      key: "aisle_name",
      label: "Aisle Name",
      width: 150,
      render: (aisle) => (
        <div className="font-medium">{aisle.aisle_name}</div>
      ),
    },
    {
      key: "zone_name",
      label: "Zone",
      width: 150,
      filterType: "select",
      render: (aisle) => (
        <Badge variant="outline">{aisle.zone_name || aisle.zone_id}</Badge>
      ),
    },
    {
      key: "aisle_direction",
      label: "Direction",
      width: 120,
      render: (aisle) => (
        <Badge variant="secondary">{aisle.aisle_direction || "N/A"}</Badge>
      ),
    },
    {
      key: "dimensions",
      label: "Dimensions (L×W×H)",
      width: 150,
      render: (aisle) => (
        <span className="text-sm">
          {aisle.length && aisle.width && aisle.height
            ? `${aisle.length}×${aisle.width}×${aisle.height}m`
            : "N/A"}
        </span>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      width: 100,
      render: (aisle) => (
        <span className="text-sm font-medium">
          {aisle.capacity ? aisle.capacity.toLocaleString() : "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      filterType: "select",
      render: (aisle) => (
        <Badge variant={
          aisle.status === "operational" ? "default" :
          aisle.status === "maintenance" ? "secondary" : "destructive"
        }>
          {aisle.status.charAt(0).toUpperCase() + aisle.status.slice(1)}
        </Badge>
      ),
    },
  ];

  // Transform aisles to TableData format for the table
  const transformedAisles: (WarehouseAisleData & TableData)[] = useMemo(() => {
    if (!aisles) return [];

    return aisles.map((aisle: WarehouseAisleData) => ({
      ...aisle,
      id: aisle.aisle_id,
    }));
  }, [aisles]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading aisles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Main Aisles Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedTable
              data={transformedAisles}
              columns={columnConfig}
              loading={loading}
              title="Warehouse Aisles"
              onRowEdit={canPerformAdminActions ? () => {} : undefined}
              onRowDelete={canPerformAdminActions ? () => {} : undefined}
              actions={{
                edit: canPerformAdminActions ? { label: "Edit Aisle" } : undefined,
                delete: canPerformAdminActions ? { label: "Delete Aisle" } : undefined,
              }}
              emptyMessage="No aisles found"
              refreshButton={
                <Button variant="outline" size="sm" onClick={fetchAisles}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              }
              addButton={
                canPerformAdminActions ? (
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Aisle
                  </Button>
                ) : undefined
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}