"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface InventoryMovementData {
  movement_id: string;
  inventory_id: string;
  movement_type: string;
  reference_type?: string;
  reference_id?: string;
  from_location_id?: string;
  to_location_id?: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  movement_date: string;
  reason?: string;
  notes?: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  product_name?: string;
  from_location_code?: string;
  to_location_code?: string;
  created_by_name?: string;
}

export function InventoryMovementsTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [movements, setMovements] = useState<InventoryMovementData[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/warehouse/inventory-movements');
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      }
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const columnConfig: ColumnConfig<InventoryMovementData & TableData>[] = [
    {
      key: "movement_date",
      label: "Date",
      width: 120,
      render: (movement) => (
        <span className="text-sm">
          {new Date(movement.movement_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "movement_type",
      label: "Type",
      width: 120,
      render: (movement) => (
        <Badge variant={
          movement.movement_type === "inbound" ? "default" :
          movement.movement_type === "outbound" ? "secondary" : "outline"
        }>
          {movement.movement_type === "inbound" && <ArrowDown className="w-3 h-3 mr-1" />}
          {movement.movement_type === "outbound" && <ArrowUp className="w-3 h-3 mr-1" />}
          {movement.movement_type === "transfer" && <ArrowUpDown className="w-3 h-3 mr-1" />}
          {movement.movement_type.charAt(0).toUpperCase() + movement.movement_type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "product_name",
      label: "Product",
      width: 180,
      render: (movement) => (
        <div>
          <div className="font-medium">{movement.product_name}</div>
          <div className="text-sm text-muted-foreground">{movement.inventory_id}</div>
        </div>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      width: 100,
      render: (movement) => (
        <span className="font-medium">
          {movement.movement_type === "outbound" && "-"}
          {movement.quantity.toLocaleString()}
        </span>
      ),
    },
    {
      key: "locations",
      label: "From → To",
      width: 200,
      render: (movement) => (
        <div className="text-sm">
          {movement.from_location_code && (
            <div className="font-mono text-xs bg-red-50 dark:bg-red-950/30 px-1 rounded mb-1">
              From: {movement.from_location_code}
            </div>
          )}
          {movement.to_location_code && (
            <div className="font-mono text-xs bg-green-50 dark:bg-green-950/30 px-1 rounded">
              To: {movement.to_location_code}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "total_cost",
      label: "Total Cost",
      width: 120,
      render: (movement) => (
        <span className="font-medium">
          {movement.total_cost ? `$${movement.total_cost.toFixed(2)}` : "N/A"}
        </span>
      ),
    },
    {
      key: "reference_type",
      label: "Reference",
      width: 150,
      render: (movement) => (
        <div className="text-sm">
          {movement.reference_type && (
            <div>
              <Badge variant="outline" className="mb-1">
                {movement.reference_type.replace('_', ' ')}
              </Badge>
              <div className="text-muted-foreground">{movement.reference_id}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "created_by_name",
      label: "Created By",
      width: 120,
      render: (movement) => (
        <span className="text-sm">{movement.created_by_name}</span>
      ),
    },
  ];

  const transformedMovements: (InventoryMovementData & TableData)[] = movements.map((movement) => ({
    ...movement,
    id: movement.movement_id,
  }));

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default" onClick={fetchMovements}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Button size="default">
              <Plus className="mr-2 h-4 w-4" />
              New Movement
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowDown className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Inbound Today</p>
                <p className="text-2xl font-bold">245</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowUp className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Outbound Today</p>
                <p className="text-2xl font-bold">189</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Transfers Today</p>
                <p className="text-2xl font-bold">32</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedMovements}
            columns={columnConfig}
            loading={loading}
            title="Inventory Movements"
            emptyMessage="No movements found"
          />
        </CardContent>
      </Card>
    </div>
  );
}