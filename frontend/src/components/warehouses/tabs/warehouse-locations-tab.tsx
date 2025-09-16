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

// Bin Movement Data Interface
export interface BinMovementData {
  movement_id: string;
  source_bin_id?: string;
  destination_bin_id?: string;
  product_id?: string;
  quantity?: number;
  uom?: string;
  movement_type?: string;
  reason?: string;
  movement_date?: string;
  performed_by?: string;
  batch_number?: string;
  serial_number?: string;
  status?: string;
  priority?: string;
  notes?: string;
  created_at?: string;
}

// Bin Content Data Interface
export interface BinContentData {
  content_id: string;
  bin_id?: string;
  product_id?: string;
  batch_number?: string;
  serial_number?: string;
  quantity?: number;
  uom?: string;
  putaway_date?: string;
  expiration_date?: string;
  quality_status?: string;
  is_locked?: boolean;
  locked_by?: string;
  lock_reason?: string;
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
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedLocations}
            columns={columnConfig}
            loading={loading}
            title="Storage Locations"
            emptyMessage="No locations found"
            refreshButton={
              <Button variant="outline" size="sm" onClick={fetchLocations}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              ) : undefined
            }
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
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedBinTypes}
            columns={binTypeColumns}
            loading={loading}
            title="Bin Types"
            emptyMessage="No bin types found"
            refreshButton={
              <Button variant="outline" size="sm" onClick={fetchBinTypes}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bin Type
                </Button>
              ) : undefined
            }
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
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedBins}
            columns={binColumns}
            loading={loading}
            title="Storage Bins"
            emptyMessage="No bins found"
            refreshButton={
              <Button variant="outline" size="sm" onClick={fetchBins}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bin
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Bin Movements Tab Component
function BinMovementsContent() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');
  const [movements, setMovements] = useState<BinMovementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/bin-movements');

      if (response.data?.success) {
        setMovements(response.data.data?.movements || []);
      } else {
        setMovements([]);
      }
    } catch (error) {
      console.error('Error fetching bin movements:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const movementColumns: ColumnConfig<BinMovementData & TableData>[] = [
    {
      key: "movement_date",
      label: "Date",
      width: 140,
      render: (movement) => (
        <span className="text-sm">
          {movement.movement_date ? new Date(movement.movement_date).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      key: "movement_type",
      label: "Type",
      width: 120,
      render: (movement) => (
        <Badge variant={
          movement.movement_type === "inbound" ? "default" :
          movement.movement_type === "outbound" ? "secondary" :
          movement.movement_type === "transfer" ? "outline" : "destructive"
        }>
          {movement.movement_type?.charAt(0).toUpperCase() + movement.movement_type?.slice(1)}
        </Badge>
      ),
    },
    {
      key: "source_bin_id",
      label: "From Bin",
      width: 120,
      render: (movement) => (
        <span className="font-mono text-sm">{movement.source_bin_id || "N/A"}</span>
      ),
    },
    {
      key: "destination_bin_id",
      label: "To Bin",
      width: 120,
      render: (movement) => (
        <span className="font-mono text-sm">{movement.destination_bin_id || "N/A"}</span>
      ),
    },
    {
      key: "product_id",
      label: "Product",
      width: 120,
      render: (movement) => (
        <span className="text-sm">{movement.product_id || "N/A"}</span>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      width: 100,
      render: (movement) => (
        <div className="text-right">
          <span className="font-medium">{movement.quantity || 0}</span>
          {movement.uom && <span className="text-xs text-muted-foreground ml-1">{movement.uom}</span>}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 100,
      render: (movement) => (
        <Badge variant={
          movement.status === "completed" ? "default" :
          movement.status === "pending" ? "secondary" :
          movement.status === "in_progress" ? "outline" : "destructive"
        }>
          {movement.status?.charAt(0).toUpperCase() + movement.status?.slice(1)}
        </Badge>
      ),
    },
  ];

  const transformedMovements: (BinMovementData & TableData)[] = movements.map((movement) => ({
    ...movement,
    id: movement.movement_id,
  }));

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading bin movements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedMovements}
            columns={movementColumns}
            loading={loading}
            title="Bin Movements"
            emptyMessage="No movements found"
            refreshButton={
              <Button variant="outline" size="sm" onClick={fetchMovements}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Movement
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Bin Contents Tab Component
function BinContentsContent() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');
  const [contents, setContents] = useState<BinContentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/bin-contents');

      if (response.data?.success) {
        setContents(response.data.data?.contents || []);
      } else {
        setContents([]);
      }
    } catch (error) {
      console.error('Error fetching bin contents:', error);
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  const contentColumns: ColumnConfig<BinContentData & TableData>[] = [
    {
      key: "bin_id",
      label: "Bin ID",
      width: 120,
      render: (content) => (
        <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
          {content.bin_id || "N/A"}
        </span>
      ),
    },
    {
      key: "product_id",
      label: "Product",
      width: 120,
      render: (content) => (
        <span className="text-sm font-medium">{content.product_id || "N/A"}</span>
      ),
    },
    {
      key: "batch_number",
      label: "Batch #",
      width: 120,
      render: (content) => (
        <span className="font-mono text-sm">{content.batch_number || "N/A"}</span>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      width: 100,
      render: (content) => (
        <div className="text-right">
          <span className="font-medium">{content.quantity || 0}</span>
          {content.uom && <span className="text-xs text-muted-foreground ml-1">{content.uom}</span>}
        </div>
      ),
    },
    {
      key: "quality_status",
      label: "Quality",
      width: 100,
      render: (content) => (
        <Badge variant={
          content.quality_status === "good" ? "default" :
          content.quality_status === "damaged" ? "destructive" :
          content.quality_status === "expired" ? "secondary" : "outline"
        }>
          {content.quality_status?.charAt(0).toUpperCase() + content.quality_status?.slice(1)}
        </Badge>
      ),
    },
    {
      key: "expiration_date",
      label: "Expires",
      width: 120,
      render: (content) => (
        <span className="text-sm">
          {content.expiration_date ? new Date(content.expiration_date).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      key: "is_locked",
      label: "Locked",
      width: 80,
      render: (content) => (
        <Badge variant={content.is_locked ? "destructive" : "default"}>
          {content.is_locked ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "putaway_date",
      label: "Put Away",
      width: 120,
      render: (content) => (
        <span className="text-sm">
          {content.putaway_date ? new Date(content.putaway_date).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
  ];

  const transformedContents: (BinContentData & TableData)[] = contents.map((content) => ({
    ...content,
    id: content.content_id,
  }));

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading bin contents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedContents}
            columns={contentColumns}
            loading={loading}
            title="Bin Contents"
            emptyMessage="No contents found"
            refreshButton={
              <Button variant="outline" size="sm" onClick={fetchContents}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Content
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Main Locations Tab with nested tabs
export function WarehouseLocationsTab() {
  return (
    <div className="w-full space-y-6">
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