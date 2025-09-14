"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Target, Package, Move, Archive, Box } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

// Location Data Interface
export interface WarehouseLocationData {
  location_id: string;
  level_id: string;
  location_name: string;
  location_code?: string;
  lc_location_code?: string;
  lc_full_code?: string;
  location_type?: string;
  barcode?: string;
  is_active: boolean;
  status: string;
  created_at: string;
  level_name?: string;
}

// Bin Types Data Interface
export interface BinTypeData {
  bin_type_id: string;
  name: string;
  code?: string;
  description?: string;
  category?: string;
  volume?: number;
  max_weight?: number;
  is_active: boolean;
  created_at: string;
}

// Bins Data Interface
export interface BinData {
  bin_id: string;
  bin_type_id: string;
  location_id?: string;
  bin_code?: string;
  barcode?: string;
  current_quantity?: number;
  max_quantity?: number;
  status: string;
  is_active: boolean;
  created_at: string;
  bin_type_name?: string;
}

// Locations Tab Component
function LocationsContent() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  // Placeholder data
  const sampleLocations: WarehouseLocationData[] = [
    {
      location_id: "WH001-STG-L01-P01",
      level_id: "WH001-STG-R01-L01",
      location_name: "Position 01",
      location_code: "P-001",
      lc_location_code: "01",
      lc_full_code: "LC-01-02-01-01-01-01",
      location_type: "storage",
      barcode: "LOC001",
      is_active: true,
      status: "operational",
      created_at: new Date().toISOString(),
      level_name: "Ground Level",
    },
  ];

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
      key: "level_name",
      label: "Level",
      width: 120,
      render: (location) => (
        <Badge variant="outline">{location.level_name || location.level_id}</Badge>
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
          {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
        </Badge>
      ),
    },
  ];

  const transformedLocations: (WarehouseLocationData & TableData)[] = sampleLocations.map((location) => ({
    ...location,
    id: location.location_id,
  }));

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Storage Locations</h3>
          <p className="text-muted-foreground">Manage warehouse storage locations</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default">
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
            loading={false}
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

  const sampleBinTypes: BinTypeData[] = [
    {
      bin_type_id: "bt001",
      name: "Small Plastic Bin",
      code: "SPB-001",
      description: "Standard small plastic storage bin",
      category: "plastic",
      volume: 0.05,
      max_weight: 10.0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const binTypeColumns: ColumnConfig<BinTypeData & TableData>[] = [
    {
      key: "code",
      label: "Code",
      width: 100,
      render: (binType) => (
        <span className="font-mono text-sm">{binType.code || "N/A"}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      width: 150,
      render: (binType) => <div className="font-medium">{binType.name}</div>,
    },
    {
      key: "category",
      label: "Category",
      width: 100,
      render: (binType) => (
        <Badge variant="secondary">{binType.category || "N/A"}</Badge>
      ),
    },
    {
      key: "volume",
      label: "Volume",
      width: 100,
      render: (binType) => (
        <span className="text-sm">{binType.volume ? `${binType.volume} m³` : "N/A"}</span>
      ),
    },
    {
      key: "max_weight",
      label: "Max Weight",
      width: 120,
      render: (binType) => (
        <span className="text-sm">{binType.max_weight ? `${binType.max_weight} kg` : "N/A"}</span>
      ),
    },
  ];

  const transformedBinTypes: (BinTypeData & TableData)[] = sampleBinTypes.map((binType) => ({
    ...binType,
    id: binType.bin_type_id,
  }));

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Bin Types</h3>
          <p className="text-muted-foreground">Manage different types of storage bins</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default">
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
            loading={false}
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

  const sampleBins: BinData[] = [
    {
      bin_id: "bin001",
      bin_type_id: "bt001",
      location_id: "WH001-STG-L01-P01",
      bin_code: "BIN-001",
      barcode: "123456789",
      current_quantity: 5.5,
      max_quantity: 10.0,
      status: "available",
      is_active: true,
      created_at: new Date().toISOString(),
      bin_type_name: "Small Plastic Bin",
    },
  ];

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
      key: "bin_type_name",
      label: "Type",
      width: 150,
      render: (bin) => (
        <Badge variant="outline">{bin.bin_type_name || "N/A"}</Badge>
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
      key: "current_quantity",
      label: "Fill Level",
      width: 120,
      render: (bin) => {
        const percentage = bin.current_quantity && bin.max_quantity
          ? (bin.current_quantity / bin.max_quantity) * 100
          : 0;
        return (
          <div className="space-y-1">
            <span className="text-sm">{bin.current_quantity || 0} / {bin.max_quantity || 0}</span>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  percentage > 80 ? 'bg-red-500' :
                  percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
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
          {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
        </Badge>
      ),
    },
  ];

  const transformedBins: (BinData & TableData)[] = sampleBins.map((bin) => ({
    ...bin,
    id: bin.bin_id,
  }));

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Storage Bins</h3>
          <p className="text-muted-foreground">Manage individual storage bins</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="default">
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
            loading={false}
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