"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, List } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface AttributeValue {
  id: number;
  product_id: number;
  attribute_id: number;
  value: string;
  product_name?: string;
  attribute_name?: string;
  created_at: string;
}

export function AttributeValuesTab() {
  const { isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [values, setValues] = useState<AttributeValue[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  useEffect(() => {
    fetchValues();
  }, []);

  const fetchValues = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/attribute-values');
      if (response.data?.success) {
        setValues(response.data.data.map((value: any) => ({
          id: parseInt(value.id),
          product_id: parseInt(value.product_id),
          attribute_id: parseInt(value.attribute_id),
          value: value.value,
          product_name: value.product_name,
          attribute_name: value.attribute_name,
          created_at: value.created_at,
        })));
      } else {
        setValues([]);
      }
    } catch (error) {
      console.error("Error fetching attribute values:", error);
      setValues([]);
    } finally {
      setLoading(false);
    }
  };

  const transformedValues: (AttributeValue & TableData)[] = useMemo(() => {
    return values.map((value) => ({ ...value, id: String(value.id) }));
  }, [values]);

  const columnConfig: ColumnConfig<AttributeValue & TableData>[] = [
    {
      key: "product_name",
      label: "Product",
      width: 200,
      render: (value) => (
        <span className="font-medium">{value.product_name || "Unknown Product"}</span>
      ),
    },
    {
      key: "attribute_name",
      label: "Attribute",
      width: 150,
      render: (value) => (
        <Badge variant="outline">{value.attribute_name || "Unknown"}</Badge>
      ),
    },
    {
      key: "value",
      label: "Value",
      width: 200,
      render: (value) => (
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value.value}</span>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      width: 130,
      render: (value) => (
        <span className="text-muted-foreground">
          {new Date(value.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading attribute values...</p>
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
                You have view-only access to attribute value information.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedValues}
            columns={columnConfig}
            loading={loading}
            title="Attribute Values"
            emptyMessage="No attribute values found"
            refreshButton={
              <Button onClick={fetchValues} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Value
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}