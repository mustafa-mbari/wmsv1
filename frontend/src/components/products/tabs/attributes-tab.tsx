"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Settings } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface Attribute {
  id: number;
  name: string;
  slug: string;
  type: string;
  description?: string;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
}

export function AttributesTab() {
  const { isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v2/attributes');
      if (response.data?.success) {
        setAttributes(response.data.data.map((attribute: any) => ({
          id: parseInt(attribute.id),
          name: attribute.name,
          slug: attribute.slug,
          type: attribute.type,
          description: attribute.description,
          is_required: attribute.is_required,
          is_active: attribute.is_active,
          created_at: attribute.created_at,
        })));
      } else {
        setAttributes([]);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  };

  const transformedAttributes: (Attribute & TableData)[] = useMemo(() => {
    return attributes.map((attribute) => ({ ...attribute, id: String(attribute.id) }));
  }, [attributes]);

  const columnConfig: ColumnConfig<Attribute & TableData>[] = [
    {
      key: "name",
      label: "Attribute Name",
      width: 200,
      render: (attribute) => (
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{attribute.name}</span>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      width: 150,
      render: (attribute) => (
        <span className="font-mono text-sm text-muted-foreground">{attribute.slug}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      width: 120,
      render: (attribute) => (
        <Badge variant="outline">{attribute.type}</Badge>
      ),
    },
    {
      key: "description",
      label: "Description",
      width: 250,
      render: (attribute) => (
        <span className="text-muted-foreground">{attribute.description || "No description"}</span>
      ),
    },
    {
      key: "is_required",
      label: "Required",
      width: 100,
      render: (attribute) => (
        <Badge variant={attribute.is_required ? "destructive" : "secondary"}>
          {attribute.is_required ? "Required" : "Optional"}
        </Badge>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 100,
      render: (attribute) => (
        <Badge variant={attribute.is_active ? "default" : "secondary"}>
          {attribute.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading attributes...</p>
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
                You have view-only access to attribute information.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedAttributes}
            columns={columnConfig}
            loading={loading}
            title="Product Attributes"
            emptyMessage="No attributes found"
            refreshButton={
              <Button onClick={fetchAttributes} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Attribute
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}