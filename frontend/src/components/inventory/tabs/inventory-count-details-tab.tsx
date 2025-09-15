"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { apiClient } from "@/lib/api-client";

export interface InventoryCountDetailData {
  detail_id: string;
  count_id: string;
  location_id: string;
  inventory_id?: string;
  product_id?: string;
  expected_quantity?: number;
  counted_quantity?: number;
  variance?: number;
  variance_percentage?: number;
  unit_cost?: number;
  variance_value?: number;
  counted_by?: string;
  counted_date?: string;
  notes?: string;
  is_discrepancy: boolean;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  count_name?: string;
  location_code?: string;
  product_name?: string;
  counted_by_name?: string;
}

export function InventoryCountDetailsTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [details, setDetails] = useState<InventoryCountDetailData[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  useEffect(() => {
    fetchCountDetails();
  }, []);

  const fetchCountDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/inventory/count-details');
      if (response.data.success && response.data.data) {
        setDetails(response.data.data.details || []);
        console.log('Inventory count details data loaded:', response.data.data.details?.length, 'items');
      } else {
        console.warn('Inventory count details API returned unsuccessful result:', response.data);
        setDetails([]);
      }
    } catch (error) {
      console.error('Error fetching inventory count details:', error);
      setDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const columnConfig: ColumnConfig<InventoryCountDetailData & TableData>[] = [
    {
      key: "count_name",
      label: "Count",
      width: 150,
      render: (detail) => (
        <div>
          <div className="font-medium">{detail.count_name}</div>
          <div className="text-sm text-muted-foreground">{detail.count_id}</div>
        </div>
      ),
    },
    {
      key: "location_code",
      label: "Location",
      width: 140,
      render: (detail) => (
        <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
          {detail.location_code}
        </span>
      ),
    },
    {
      key: "product_name",
      label: "Product",
      width: 180,
      render: (detail) => (
        <div>
          <div className="font-medium">{detail.product_name}</div>
          <div className="text-sm text-muted-foreground">{detail.product_id}</div>
        </div>
      ),
    },
    {
      key: "expected_quantity",
      label: "Expected",
      width: 100,
      render: (detail) => (
        <div className="text-center font-medium">
          {detail.expected_quantity?.toLocaleString() || "N/A"}
        </div>
      ),
    },
    {
      key: "counted_quantity",
      label: "Counted",
      width: 100,
      render: (detail) => (
        <div className="text-center font-medium">
          {detail.counted_quantity?.toLocaleString() || "N/A"}
        </div>
      ),
    },
    {
      key: "variance",
      label: "Variance",
      width: 100,
      render: (detail) => (
        <div className="text-center">
          {detail.variance !== undefined ? (
            <span className={`font-medium ${
              detail.variance > 0 ? "text-green-600" :
              detail.variance < 0 ? "text-red-600" : "text-gray-600"
            }`}>
              {detail.variance > 0 ? "+" : ""}{detail.variance.toLocaleString()}
            </span>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "variance_value",
      label: "Value Impact",
      width: 120,
      render: (detail) => (
        <div className="text-center">
          {detail.variance_value !== undefined ? (
            <span className={`font-medium ${
              detail.variance_value > 0 ? "text-green-600" :
              detail.variance_value < 0 ? "text-red-600" : "text-gray-600"
            }`}>
              {detail.variance_value > 0 ? "+" : ""}${detail.variance_value.toFixed(2)}
            </span>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "is_discrepancy",
      label: "Status",
      width: 120,
      render: (detail) => (
        <div className="space-y-1">
          <Badge variant={detail.is_discrepancy ? "destructive" : "default"}>
            {detail.is_discrepancy ? (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                Discrepancy
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Match
              </>
            )}
          </Badge>
          {detail.is_discrepancy && (
            <Badge variant={detail.is_resolved ? "default" : "secondary"} className="text-xs">
              {detail.is_resolved ? "Resolved" : "Pending"}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "counted_by_name",
      label: "Counted By",
      width: 120,
      render: (detail) => (
        <div className="text-sm">
          {detail.counted_by_name && (
            <>
              <div>{detail.counted_by_name}</div>
              {detail.counted_date && (
                <div className="text-muted-foreground">
                  {new Date(detail.counted_date).toLocaleDateString()}
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const transformedDetails: (InventoryCountDetailData & TableData)[] = details.map((detail) => ({
    ...detail,
    id: detail.detail_id,
  }));

  const totalDiscrepancies = details.filter(d => d.is_discrepancy).length;
  const unresolvedDiscrepancies = details.filter(d => d.is_discrepancy && !d.is_resolved).length;
  const totalVarianceValue = details.reduce((sum, d) => sum + (d.variance_value || 0), 0);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default" onClick={fetchCountDetails}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Button size="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Detail
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Details</p>
                <p className="text-2xl font-bold">{details.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Discrepancies</p>
                <p className="text-2xl font-bold">{totalDiscrepancies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Unresolved</p>
                <p className="text-2xl font-bold">{unresolvedDiscrepancies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`h-5 w-5 rounded-full ${totalVarianceValue >= 0 ? 'bg-green-600' : 'bg-red-600'}`} />
              <div>
                <p className="text-sm text-muted-foreground">Value Impact</p>
                <p className={`text-2xl font-bold ${totalVarianceValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(totalVarianceValue).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedDetails}
            columns={columnConfig}
            loading={loading}
            title="Count Details"
            emptyMessage="No count details found"
          />
        </CardContent>
      </Card>
    </div>
  );
}