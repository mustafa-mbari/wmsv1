"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Layers } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface WarehouseLevelData {
  level_id: string;
  rack_id: string;
  level_name: string;
  level_code?: string;
  lc_level_code?: string;
  lc_full_code?: string;
  level_number: number;
  height?: number;
  max_weight?: number;
  capacity?: number;
  is_active: boolean;
  status: string;
  created_at: string;
  rack_name?: string;
}

export function WarehouseLevelsTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [levels, setLevels] = useState<WarehouseLevelData[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/levels');

      if (response.data?.success) {
        setLevels(response.data.data?.levels || []);
      } else {
        setLevels([]);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  };

  const columnConfig: ColumnConfig<WarehouseLevelData & TableData>[] = [
    {
      key: "lc_full_code",
      label: "LC Code",
      width: 140,
      render: (level) => (
        <span className="font-mono text-sm bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded">
          {level.lc_full_code || level.lc_level_code}
        </span>
      ),
    },
    {
      key: "level_name",
      label: "Level Name",
      width: 150,
      render: (level) => <div className="font-medium">{level.level_name}</div>,
    },
    {
      key: "rack_name",
      label: "Rack",
      width: 120,
      render: (level) => (
        <Badge variant="outline">{level.rack_name || level.rack_id}</Badge>
      ),
    },
    {
      key: "level_number",
      label: "Level #",
      width: 80,
      render: (level) => (
        <Badge variant="default">{level.level_number}</Badge>
      ),
    },
    {
      key: "height",
      label: "Height",
      width: 80,
      render: (level) => (
        <span className="text-sm">{level.height ? `${level.height}m` : "N/A"}</span>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      width: 100,
      render: (level) => (
        <span className="font-medium">{level.capacity || 0}</span>
      ),
    },
    {
      key: "max_weight",
      label: "Max Weight",
      width: 120,
      render: (level) => (
        <span className="text-sm">
          {level.max_weight ? `${level.max_weight} kg` : "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      render: (level) => (
        <Badge variant={
          level.status === "operational" ? "default" :
          level.status === "maintenance" ? "secondary" : "destructive"
        }>
          {level.status.charAt(0).toUpperCase() + level.status.slice(1)}
        </Badge>
      ),
    },
  ];

  // Transform levels to TableData format for the table
  const transformedLevels: (WarehouseLevelData & TableData)[] = useMemo(() => {
    if (!levels) return [];

    return levels.map((level: WarehouseLevelData) => ({
      ...level,
      id: level.level_id,
    }));
  }, [levels]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedLevels}
            columns={columnConfig}
            loading={loading}
            title="Warehouse Levels"
            emptyMessage="No levels found"
            refreshButton={
              <Button variant="outline" size="sm" onClick={fetchLevels}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Level
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}