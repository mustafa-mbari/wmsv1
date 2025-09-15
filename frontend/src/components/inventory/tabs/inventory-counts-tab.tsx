"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { apiClient } from "@/lib/api-client";

export interface InventoryCountData {
  count_id: string;
  warehouse_id: string;
  count_name: string;
  count_type: string;
  status: string;
  scheduled_date?: string;
  started_date?: string;
  completed_date?: string;
  total_locations?: number;
  counted_locations?: number;
  total_items?: number;
  counted_items?: number;
  discrepancies_found?: number;
  created_by: string;
  assigned_to?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  warehouse_name?: string;
  created_by_name?: string;
  assigned_to_name?: string;
}

export function InventoryCountsTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [counts, setCounts] = useState<InventoryCountData[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/inventory/counts');
      if (response.data.success && response.data.data) {
        setCounts(response.data.data.counts || []);
        console.log('Inventory counts data loaded:', response.data.data.counts?.length, 'items');
      } else {
        console.warn('Inventory counts API returned unsuccessful result:', response.data);
        setCounts([]);
      }
    } catch (error) {
      console.error('Error fetching inventory counts:', error);
      setCounts([]);
    } finally {
      setLoading(false);
    }
  };

  const columnConfig: ColumnConfig<InventoryCountData & TableData>[] = [
    {
      key: "count_name",
      label: "Count Name",
      width: 200,
      render: (count) => (
        <div>
          <div className="font-medium">{count.count_name}</div>
          <div className="text-sm text-muted-foreground">{count.count_id}</div>
        </div>
      ),
    },
    {
      key: "count_type",
      label: "Type",
      width: 100,
      render: (count) => (
        <Badge variant="outline">
          {count.count_type.charAt(0).toUpperCase() + count.count_type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      render: (count) => (
        <Badge variant={
          count.status === "completed" ? "default" :
          count.status === "in_progress" ? "secondary" :
          count.status === "scheduled" ? "outline" : "destructive"
        }>
          {count.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
          {count.status === "in_progress" && <Clock className="w-3 h-3 mr-1" />}
          {count.status === "scheduled" && <ClipboardList className="w-3 h-3 mr-1" />}
          {count.status === "cancelled" && <XCircle className="w-3 h-3 mr-1" />}
          {count.status.replace('_', ' ').charAt(0).toUpperCase() + count.status.replace('_', ' ').slice(1)}
        </Badge>
      ),
    },
    {
      key: "progress",
      label: "Progress",
      width: 150,
      render: (count) => (
        <div className="text-sm">
          {count.status === "completed" ? (
            <div className="text-green-600 font-medium">100% Complete</div>
          ) : count.status === "in_progress" ? (
            <div>
              <div className="font-medium">
                {count.counted_locations}/{count.total_locations} Locations
              </div>
              <div className="text-muted-foreground">
                {count.counted_items}/{count.total_items} Items
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">
              {count.total_locations} Locations, {count.total_items} Items
            </div>
          )}
        </div>
      ),
    },
    {
      key: "discrepancies_found",
      label: "Discrepancies",
      width: 120,
      render: (count) => (
        <div className="text-center">
          {count.discrepancies_found !== undefined ? (
            <Badge variant={count.discrepancies_found > 0 ? "destructive" : "default"}>
              {count.discrepancies_found}
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: "scheduled_date",
      label: "Scheduled",
      width: 120,
      render: (count) => (
        <span className="text-sm">
          {count.scheduled_date ? new Date(count.scheduled_date).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      key: "assigned_to_name",
      label: "Assigned To",
      width: 120,
      render: (count) => (
        <span className="text-sm">{count.assigned_to_name || "Unassigned"}</span>
      ),
    },
    {
      key: "warehouse_name",
      label: "Warehouse",
      width: 120,
      render: (count) => (
        <Badge variant="outline">{count.warehouse_name}</Badge>
      ),
    },
  ];

  const transformedCounts: (InventoryCountData & TableData)[] = counts.map((count) => ({
    ...count,
    id: count.count_id,
  }));

  const scheduledCounts = counts.filter(c => c.status === 'scheduled').length;
  const inProgressCounts = counts.filter(c => c.status === 'in_progress').length;
  const completedCounts = counts.filter(c => c.status === 'completed').length;
  const totalDiscrepancies = counts.reduce((sum, c) => sum + (c.discrepancies_found || 0), 0);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default" onClick={fetchCounts}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Button size="default">
              <Plus className="mr-2 h-4 w-4" />
              New Count
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledCounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressCounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Discrepancies</p>
                <p className="text-2xl font-bold">{totalDiscrepancies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedCounts}
            columns={columnConfig}
            loading={loading}
            title="Inventory Counts"
            emptyMessage="No inventory counts found"
          />
        </CardContent>
      </Card>
    </div>
  );
}