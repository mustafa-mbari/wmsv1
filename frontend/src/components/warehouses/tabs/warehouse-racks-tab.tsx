"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Archive } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface WarehouseRackData {
  rack_id: string;
  aisle_id: string;
  rack_name: string;
  rack_code?: string;
  lc_rack_code?: string;
  lc_full_code?: string;
  rack_type?: string;
  description?: string;
  length?: number;
  width?: number;
  height?: number;
  max_weight?: number;
  total_levels?: number;
  is_active: boolean;
  status: string;
  created_at: string;
  aisle_name?: string;
}

export function WarehouseRacksTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [racks, setRacks] = useState<WarehouseRackData[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  useEffect(() => {
    fetchRacks();
  }, []);

  const fetchRacks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/racks');

      if (response.data?.success) {
        setRacks(response.data.data?.racks || []);
      } else {
        setRacks([]);
      }
    } catch (error) {
      console.error('Error fetching racks:', error);
      setRacks([]);
    } finally {
      setLoading(false);
    }
  };

  const columnConfig: ColumnConfig<WarehouseRackData & TableData>[] = [
    {
      key: "lc_full_code",
      label: "LC Code",
      width: 130,
      render: (rack) => (
        <span className="font-mono text-sm bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded">
          {rack.lc_full_code || rack.lc_rack_code}
        </span>
      ),
    },
    {
      key: "rack_name",
      label: "Rack Name",
      width: 150,
      render: (rack) => <div className="font-medium">{rack.rack_name}</div>,
    },
    {
      key: "aisle_name",
      label: "Aisle",
      width: 120,
      render: (rack) => (
        <Badge variant="outline">{rack.aisle_name || rack.aisle_id}</Badge>
      ),
    },
    {
      key: "rack_type",
      label: "Type",
      width: 100,
      render: (rack) => (
        <Badge variant="secondary">{rack.rack_type || "Standard"}</Badge>
      ),
    },
    {
      key: "total_levels",
      label: "Levels",
      width: 80,
      render: (rack) => <span className="font-medium">{rack.total_levels || 0}</span>,
    },
    {
      key: "max_weight",
      label: "Max Weight",
      width: 120,
      render: (rack) => (
        <span className="text-sm">
          {rack.max_weight ? `${rack.max_weight} kg` : "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      render: (rack) => (
        <Badge variant={
          rack.status === "operational" ? "default" :
          rack.status === "maintenance" ? "secondary" : "destructive"
        }>
          {rack.status.charAt(0).toUpperCase() + rack.status.slice(1)}
        </Badge>
      ),
    },
  ];

  // Transform racks to TableData format for the table
  const transformedRacks: (WarehouseRackData & TableData)[] = useMemo(() => {
    if (!racks) return [];

    return racks.map((rack: WarehouseRackData) => ({
      ...rack,
      id: rack.rack_id,
    }));
  }, [racks]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading racks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warehouse Racks</h2>
          <p className="text-muted-foreground">Manage warehouse racks and storage units</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default" onClick={fetchRacks}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Button size="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Rack
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedRacks}
            columns={columnConfig}
            loading={loading}
            title="Warehouse Racks"
            emptyMessage="No racks found"
          />
        </CardContent>
      </Card>
    </div>
  );
}