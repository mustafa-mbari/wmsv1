"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Scale } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  description?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

export function UnitsTab() {
  const { isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v2/units');
      if (response.data?.success) {
        setUnits(response.data.data.map((unit: any) => ({
          id: parseInt(unit.id),
          name: unit.name,
          symbol: unit.symbol,
          description: unit.description,
          is_active: unit.is_active,
          product_count: unit.product_count || 0,
          created_at: unit.created_at,
        })));
      } else {
        setUnits([]);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const transformedUnits: (Unit & TableData)[] = useMemo(() => {
    return units.map((unit) => ({ ...unit, id: String(unit.id) }));
  }, [units]);

  const columnConfig: ColumnConfig<Unit & TableData>[] = [
    {
      key: "name",
      label: "Unit Name",
      width: 200,
      render: (unit) => (
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{unit.name}</span>
        </div>
      ),
    },
    {
      key: "symbol",
      label: "Symbol",
      width: 100,
      render: (unit) => (
        <Badge variant="outline">{unit.symbol}</Badge>
      ),
    },
    {
      key: "description",
      label: "Description",
      width: 250,
      render: (unit) => (
        <span className="text-muted-foreground">{unit.description || "No description"}</span>
      ),
    },
    {
      key: "product_count",
      label: "Products",
      width: 100,
      render: (unit) => (
        <span className="font-medium">{unit.product_count}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 100,
      render: (unit) => (
        <Badge variant={unit.is_active ? "default" : "secondary"}>
          {unit.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {!canPerformAdminActions && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Read-Only Access</h3>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                You have view-only access to unit information.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedUnits}
            columns={columnConfig}
            loading={loading}
            title="Units of Measurement"
            emptyMessage="No units found"
            refreshButton={
              <Button onClick={fetchUnits} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Unit
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}