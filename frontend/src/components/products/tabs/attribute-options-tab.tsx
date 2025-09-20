"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Tag } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface AttributeOption {
  id: number;
  attribute_id: number;
  value: string;
  display_value: string;
  sort_order: number;
  is_active: boolean;
  attribute_name?: string;
  created_at: string;
}

export function AttributeOptionsTab() {
  const { isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v2/attribute-options');
      if (response.data?.success) {
        setOptions(response.data.data.map((option: any) => ({
          id: parseInt(option.id),
          attribute_id: parseInt(option.attribute_id),
          value: option.value,
          display_value: option.display_value,
          sort_order: option.sort_order,
          is_active: option.is_active,
          attribute_name: option.attribute_name,
          created_at: option.created_at,
        })));
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Error fetching attribute options:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const transformedOptions: (AttributeOption & TableData)[] = useMemo(() => {
    return options.map((option) => ({ ...option, id: String(option.id) }));
  }, [options]);

  const columnConfig: ColumnConfig<AttributeOption & TableData>[] = [
    {
      key: "attribute_name",
      label: "Attribute",
      width: 150,
      render: (option) => (
        <Badge variant="outline">{option.attribute_name || "Unknown"}</Badge>
      ),
    },
    {
      key: "display_value",
      label: "Display Value",
      width: 200,
      render: (option) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{option.display_value}</span>
        </div>
      ),
    },
    {
      key: "value",
      label: "Value",
      width: 150,
      render: (option) => (
        <span className="font-mono text-sm text-muted-foreground">{option.value}</span>
      ),
    },
    {
      key: "sort_order",
      label: "Sort Order",
      width: 100,
      render: (option) => (
        <Badge variant="secondary">{option.sort_order}</Badge>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 100,
      render: (option) => (
        <Badge variant={option.is_active ? "default" : "secondary"}>
          {option.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading attribute options...</p>
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
                You have view-only access to attribute option information.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedOptions}
            columns={columnConfig}
            loading={loading}
            title="Attribute Options"
            emptyMessage="No attribute options found"
            refreshButton={
              <Button onClick={fetchOptions} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}