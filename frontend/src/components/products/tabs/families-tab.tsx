"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Users } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface Family {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

export function FamiliesTab() {
  const { isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v2/families');
      if (response.data?.success) {
        setFamilies(response.data.data.map((family: any) => ({
          id: parseInt(family.id),
          name: family.name,
          description: family.description,
          is_active: family.is_active,
          product_count: family.product_count || 0,
          created_at: family.created_at,
        })));
      } else {
        setFamilies([]);
      }
    } catch (error) {
      console.error("Error fetching families:", error);
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  const transformedFamilies: (Family & TableData)[] = useMemo(() => {
    return families.map((family) => ({ ...family, id: String(family.id) }));
  }, [families]);

  const columnConfig: ColumnConfig<Family & TableData>[] = [
    {
      key: "name",
      label: "Family Name",
      width: 200,
      render: (family) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{family.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      width: 250,
      render: (family) => (
        <span className="text-muted-foreground">{family.description || "No description"}</span>
      ),
    },
    {
      key: "product_count",
      label: "Products",
      width: 100,
      render: (family) => (
        <span className="font-medium">{family.product_count}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 100,
      render: (family) => (
        <Badge variant={family.is_active ? "default" : "secondary"}>
          {family.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading families...</p>
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
                You have view-only access to family information.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedFamilies}
            columns={columnConfig}
            loading={loading}
            title="Product Families"
            emptyMessage="No families found"
            refreshButton={
              <Button onClick={fetchFamilies} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Family
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}