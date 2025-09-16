"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { apiClient } from "@/lib/api-client";

export interface InventoryReservationData {
  reservation_id: string;
  inventory_id: string;
  reference_type: string;
  reference_id: string;
  reserved_quantity: number;
  reservation_type: string;
  status: string;
  reserved_date: string;
  expiration_date?: string;
  released_date?: string;
  notes?: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_name?: string;
  location_code?: string;
  created_by_name?: string;
}

export function InventoryReservationsTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [reservations, setReservations] = useState<InventoryReservationData[]>([]);
  const [loading, setLoading] = useState(true);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/inventory/reservations');
      if (response.data.success && response.data.data) {
        setReservations(response.data.data.reservations || []);
        console.log('Inventory reservations data loaded:', response.data.data.reservations?.length, 'items');
      } else {
        console.warn('Inventory reservations API returned unsuccessful result:', response.data);
        setReservations([]);
      }
    } catch (error) {
      console.error('Error fetching inventory reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const columnConfig: ColumnConfig<InventoryReservationData & TableData>[] = [
    {
      key: "reserved_date",
      label: "Reserved Date",
      width: 120,
      render: (reservation) => (
        <span className="text-sm">
          {new Date(reservation.reserved_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "reference_type",
      label: "Reference",
      width: 150,
      render: (reservation) => (
        <div className="text-sm">
          <Badge variant="outline" className="mb-1">
            {reservation.reference_type.replace('_', ' ')}
          </Badge>
          <div className="text-muted-foreground">{reservation.reference_id}</div>
        </div>
      ),
    },
    {
      key: "product_name",
      label: "Product",
      width: 180,
      render: (reservation) => (
        <div>
          <div className="font-medium">{reservation.product_name}</div>
          <div className="text-sm text-muted-foreground">{reservation.inventory_id}</div>
        </div>
      ),
    },
    {
      key: "location_code",
      label: "Location",
      width: 140,
      render: (reservation) => (
        <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
          {reservation.location_code}
        </span>
      ),
    },
    {
      key: "reserved_quantity",
      label: "Quantity",
      width: 100,
      render: (reservation) => (
        <div className="text-center font-medium">
          {reservation.reserved_quantity.toLocaleString()}
        </div>
      ),
    },
    {
      key: "reservation_type",
      label: "Type",
      width: 120,
      render: (reservation) => (
        <Badge variant="secondary">
          {reservation.reservation_type.replace('_', ' ').charAt(0).toUpperCase() +
           reservation.reservation_type.replace('_', ' ').slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      render: (reservation) => (
        <Badge variant={
          reservation.status === "active" ? "default" :
          reservation.status === "fulfilled" ? "outline" :
          reservation.status === "expired" ? "destructive" : "secondary"
        }>
          {reservation.status === "active" && <Clock className="w-3 h-3 mr-1" />}
          {reservation.status === "fulfilled" && <CheckCircle className="w-3 h-3 mr-1" />}
          {reservation.status === "expired" && <XCircle className="w-3 h-3 mr-1" />}
          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "expiration_date",
      label: "Expires",
      width: 120,
      render: (reservation) => (
        <div className="text-sm">
          {reservation.expiration_date ? (
            <div className={
              new Date(reservation.expiration_date) < new Date()
                ? "text-red-600 font-medium"
                : new Date(reservation.expiration_date) < new Date(Date.now() + 24*60*60*1000)
                  ? "text-orange-600 font-medium"
                  : ""
            }>
              {new Date(reservation.expiration_date).toLocaleDateString()}
            </div>
          ) : (
            <span className="text-muted-foreground">No expiry</span>
          )}
        </div>
      ),
    },
    {
      key: "created_by_name",
      label: "Created By",
      width: 120,
      render: (reservation) => (
        <span className="text-sm">{reservation.created_by_name}</span>
      ),
    },
  ];

  const transformedReservations: (InventoryReservationData & TableData)[] = reservations.map((reservation) => ({
    ...reservation,
    id: reservation.reservation_id,
  }));

  const activeReservations = reservations.filter(r => r.status === 'active').length;
  const expiredReservations = reservations.filter(r => r.status === 'expired').length;
  const fulfilledReservations = reservations.filter(r => r.status === 'fulfilled').length;
  const totalReservedQuantity = reservations
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + r.reserved_quantity, 0);

  return (
    <div className="w-full space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeReservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Fulfilled</p>
                <p className="text-2xl font-bold">{fulfilledReservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{expiredReservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Reserved Qty</p>
                <p className="text-2xl font-bold">{totalReservedQuantity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedReservations}
            columns={columnConfig}
            loading={loading}
            title="Inventory Reservations"
            emptyMessage="No reservations found"
            refreshButton={
              <Button variant="outline" size="sm" onClick={fetchReservations}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Reservation
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}