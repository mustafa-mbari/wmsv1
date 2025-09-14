"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Layers } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
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
      const response = await fetch('/api/warehouse/levels');
      if (response.ok) {
        const data = await response.json();
        setLevels(data);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
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

  const transformedLevels: (WarehouseLevelData & TableData)[] = levels.map((level) => ({
    ...level,
    id: level.level_id,
  }));

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warehouse Levels</h2>
          <p className="text-muted-foreground">Manage warehouse rack levels and storage tiers</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default" onClick={fetchLevels}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Button size="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Level
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedLevels}
            columns={columnConfig}
            loading={loading}
            title="Warehouse Levels"
            emptyMessage="No levels found"
          />
        </CardContent>
      </Card>
    </div>
  );
}