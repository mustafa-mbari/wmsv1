"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Target, Package, Move, Archive, Box } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

// Location Data Interface
export interface WarehouseLocationData {
  location_id: string;
  warehouse_id?: string;
  location_name?: string;
  location_code?: string;
  location_type?: string;
  barcode?: string;
  is_active?: boolean;
  status?: string;
  created_at?: string;
  lc_full_code?: string;
  parent_location?: string;
  description?: string;
}

// Bin Types Data Interface
export interface BinTypeData {
  bin_type_id: string;
  type_name?: string;
  type_code?: string;
  description?: string;
  default_capacity?: number;
  weight_capacity?: number;
  is_stackable?: boolean;
  material?: string;
  color?: string;
  is_active?: boolean;
  created_at?: string;
}

// Bins Data Interface
export interface BinData {
  bin_id: string;
  bin_type_id?: string;
  location_id?: string;
  bin_code?: string;
  bin_name?: string;
  barcode?: string;
  capacity?: number;
  weight_capacity?: number;
  status?: string;
  is_active?: boolean;
  created_at?: string;
  temperature_zone?: string;
  lc_full_code?: string;
}

// Locations Tab Component
function LocationsContent() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');
  const [locations, setLocations] = useState<WarehouseLocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/locations');

      if (response.data?.success) {
        setLocations(response.data.data?.locations || []);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const columnConfig: ColumnConfig<WarehouseLocationData & TableData>[] = [
    {
      key: "lc_full_code",
      label: "LC Code",
      width: 150,
      render: (location) => (
        <span className="font-mono text-sm bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">
          {location.lc_full_code || location.lc_location_code}
        </span>
      ),
    },
    {
      key: "location_name",
      label: "Location Name",
      width: 150,
      render: (location) => <div className="font-medium">{location.location_name}</div>,
    },
    {
      key: "parent_location",
      label: "Parent",
      width: 120,
      render: (location) => (
        <Badge variant="outline">{location.parent_location || "Root"}</Badge>
      ),
    },
    {
      key: "location_type",
      label: "Type",
      width: 100,
      render: (location) => (
        <Badge variant="secondary">{location.location_type || "Standard"}</Badge>
      ),
    },
    {
      key: "barcode",
      label: "Barcode",
      width: 120,
      render: (location) => (
        <span className="font-mono text-sm">{location.barcode || "N/A"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      render: (location) => (
        <Badge variant={
          location.status === "operational" ? "default" :
          location.status === "maintenance" ? "secondary" : "destructive"
        }>
          {location.status?.charAt(0).toUpperCase() + location.status?.slice(1)}
        </Badge>
      ),
    },
  ];

  const transformedLocations: (WarehouseLocationData & TableData)[] = locations.map((location) => ({
    ...location,
    id: location.location_id,
  }));

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Storage Locations</h3>
          <p className="text-muted-foreground">Manage warehouse storage locations</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default" onClick={fetchLocations}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Button size="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedLocations}
            columns={columnConfig}
            loading={loading}
            title="Storage Locations"
            emptyMessage="No locations found"
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Bin Types Tab Component
function BinTypesContent() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');
  const [binTypes, setBinTypes] = useState<BinTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBinTypes();
  }, []);

  const fetchBinTypes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/bin-types');

      if (response.data?.success) {
        setBinTypes(response.data.data?.binTypes || []);
      } else {
        setBinTypes([]);
      }
    } catch (error) {
      console.error('Error fetching bin types:', error);
      setBinTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const binTypeColumns: ColumnConfig<BinTypeData & TableData>[] = [
    {
      key: "type_code",
      label: "Code",
      width: 100,
      render: (binType) => (
        <span className="font-mono text-sm">{binType.type_code || "N/A"}</span>
      ),
    },
    {
      key: "type_name",
      label: "Name",
      width: 150,
      render: (binType) => <div className="font-medium">{binType.type_name || "N/A"}</div>,
    },
    {
      key: "material",
      label: "Material",
      width: 100,
      render: (binType) => (
        <Badge variant="secondary">{binType.material || "N/A"}</Badge>
      ),
    },
    {
      key: "default_capacity",
      label: "Capacity",
      width: 100,
      render: (binType) => (
        <span className="text-sm">{binType.default_capacity ? `${binType.default_capacity} units` : "N/A"}</span>
      ),
    },
    {
      key: "weight_capacity",
      label: "Max Weight",
      width: 120,
      render: (binType) => (
        <span className="text-sm">{binType.weight_capacity ? `${binType.weight_capacity} kg` : "N/A"}</span>
      ),
    },
  ];

  const transformedBinTypes: (BinTypeData & TableData)[] = binTypes.map((binType) => ({
    ...binType,
    id: binType.bin_type_id,
  }));

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading bin types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Bin Types</h3>
          <p className="text-muted-foreground">Manage different types of storage bins</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default" onClick={fetchBinTypes}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Button size="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Bin Type
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedBinTypes}
            columns={binTypeColumns}
            loading={loading}
            title="Bin Types"
            emptyMessage="No bin types found"
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Bins Tab Component
function BinsContent() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');
  const [bins, setBins] = useState<BinData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/bins');

      if (response.data?.success) {
        setBins(response.data.data?.bins || []);
      } else {
        setBins([]);
      }
    } catch (error) {
      console.error('Error fetching bins:', error);
      setBins([]);
    } finally {
      setLoading(false);
    }
  };

  const binColumns: ColumnConfig<BinData & TableData>[] = [
    {
      key: "bin_code",
      label: "Bin Code",
      width: 120,
      render: (bin) => (
        <span className="font-mono text-sm">{bin.bin_code || "N/A"}</span>
      ),
    },
    {
      key: "bin_type_id",
      label: "Type ID",
      width: 150,
      render: (bin) => (
        <Badge variant="outline">{bin.bin_type_id || "N/A"}</Badge>
      ),
    },
    {
      key: "barcode",
      label: "Barcode",
      width: 120,
      render: (bin) => (
        <span className="font-mono text-sm">{bin.barcode || "N/A"}</span>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      width: 120,
      render: (bin) => (
        <div className="space-y-1">
          <span className="text-sm">{bin.capacity ? `${bin.capacity} units` : "N/A"}</span>
          {bin.weight_capacity && (
            <span className="text-xs text-muted-foreground">{bin.weight_capacity} kg max</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      render: (bin) => (
        <Badge variant={
          bin.status === "available" ? "default" :
          bin.status === "occupied" ? "secondary" : "destructive"
        }>
          {bin.status?.charAt(0).toUpperCase() + bin.status?.slice(1)}
        </Badge>
      ),
    },
  ];

  const transformedBins: (BinData & TableData)[] = bins.map((bin) => ({
    ...bin,
    id: bin.bin_id,
  }));

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading bins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Storage Bins</h3>
          <p className="text-muted-foreground">Manage individual storage bins</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default" onClick={fetchBins}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Button size="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Bin
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedBins}
            columns={binColumns}
            loading={loading}
            title="Storage Bins"
            emptyMessage="No bins found"
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder components for movements and contents
function BinMovementsContent() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Bin Movements</h3>
        <p className="text-muted-foreground">Track bin movement history</p>
      </div>
      <Card className="p-8 text-center">
        <Move className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Bin movements tracking coming soon...</p>
      </Card>
    </div>
  );
}

function BinContentsContent() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Bin Contents</h3>
        <p className="text-muted-foreground">Manage contents of storage bins</p>
      </div>
      <Card className="p-8 text-center">
        <Box className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Bin contents management coming soon...</p>
      </Card>
    </div>
  );
}

// Main Locations Tab with nested tabs
export function WarehouseLocationsTab() {
  return (
    <div className="w-full space-y-6">
      {/* Main Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Warehouse Locations & Bin Management</h2>
        <p className="text-muted-foreground">
          Manage warehouse locations, storage bins, and their configurations
        </p>
      </div>

      {/* Nested Tab Navigation */}
      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="locations"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Target className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger
            value="bin_types"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Archive className="h-4 w-4" />
            Bin Types
          </TabsTrigger>
          <TabsTrigger
            value="bins"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Package className="h-4 w-4" />
            Bins
          </TabsTrigger>
          <TabsTrigger
            value="bin_movements"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Move className="h-4 w-4" />
            Movements
          </TabsTrigger>
          <TabsTrigger
            value="bin_contents"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Box className="h-4 w-4" />
            Contents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-4">
          <LocationsContent />
        </TabsContent>

        <TabsContent value="bin_types" className="space-y-4">
          <BinTypesContent />
        </TabsContent>

        <TabsContent value="bins" className="space-y-4">
          <BinsContent />
        </TabsContent>

        <TabsContent value="bin_movements" className="space-y-4">
          <BinMovementsContent />
        </TabsContent>

        <TabsContent value="bin_contents" className="space-y-4">
          <BinContentsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}