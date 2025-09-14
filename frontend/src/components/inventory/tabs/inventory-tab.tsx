"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Package, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface InventoryData {
  inventory_id: string;
  product_id: string;
  location_id: string;
  batch_number?: string;
  serial_number?: string;
  expiration_date?: string;
  quantity_on_hand: number;
  quantity_available: number;
  quantity_reserved: number;
  quantity_allocated: number;
  unit_cost?: number;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  product_name?: string;
  location_code?: string;
}

export function InventoryTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [inventory, setInventory] = useState<InventoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/warehouse/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const columnConfig: ColumnConfig<InventoryData & TableData>[] = [
    {
      key: "location_code",
      label: "Location",
      width: 140,
      render: (item) => (
        <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
          {item.location_code}
        </span>
      ),
    },
    {
      key: "product_name",
      label: "Product",
      width: 200,
      render: (item) => (
        <div>
          <div className="font-medium">{item.product_name}</div>
          <div className="text-sm text-muted-foreground">{item.product_id}</div>
        </div>
      ),
    },
    {
      key: "batch_number",
      label: "Batch/Serial",
      width: 150,
      render: (item) => (
        <div className="text-sm">
          {item.batch_number && (
            <div className="font-medium">{item.batch_number}</div>
          )}
          {item.serial_number && (
            <div className="text-muted-foreground">{item.serial_number}</div>
          )}
        </div>
      ),
    },
    {
      key: "quantity_on_hand",
      label: "On Hand",
      width: 100,
      render: (item) => (
        <div className="font-medium text-center">
          {item.quantity_on_hand.toLocaleString()}
        </div>
      ),
    },
    {
      key: "quantity_available",
      label: "Available",
      width: 100,
      render: (item) => (
        <div className="font-medium text-center text-green-600">
          {item.quantity_available.toLocaleString()}
        </div>
      ),
    },
    {
      key: "quantity_reserved",
      label: "Reserved",
      width: 100,
      render: (item) => (
        <div className="font-medium text-center text-orange-600">
          {item.quantity_reserved.toLocaleString()}
        </div>
      ),
    },
    {
      key: "unit_cost",
      label: "Unit Cost",
      width: 100,
      render: (item) => (
        <span className="font-medium">
          {item.unit_cost ? `$${item.unit_cost.toFixed(2)}` : "N/A"}
        </span>
      ),
    },
    {
      key: "expiration_date",
      label: "Expires",
      width: 120,
      render: (item) => (
        <span className="text-sm">
          {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      render: (item) => (
        <Badge variant={
          item.status === "available" ? "default" :
          item.status === "low_stock" ? "secondary" :
          item.status === "out_of_stock" ? "destructive" : "outline"
        }>
          {item.status === "low_stock" && <AlertTriangle className="w-3 h-3 mr-1" />}
          {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
        </Badge>
      ),
    },
  ];

  const transformedInventory: (InventoryData & TableData)[] = inventory.map((item) => ({
    ...item,
    id: item.inventory_id,
  }));

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage stock levels and inventory items</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default" onClick={fetchInventory}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Button size="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Inventory
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">125</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">105</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedInventory}
            columns={columnConfig}
            loading={loading}
            title="Current Inventory"
            emptyMessage="No inventory items found"
          />
        </CardContent>
      </Card>
    </div>
  );
}