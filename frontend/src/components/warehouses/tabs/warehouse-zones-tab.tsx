"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HardDeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  RefreshCw,
  MapPin,
  Save,
  Thermometer,
  Square,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { useAlert } from "@/hooks/useAlert";
import { getErrorMessage } from "@/lib/error-utils";

export interface WarehouseZoneData {
  zone_id: string;
  warehouse_id: string;
  zone_name: string;
  zone_code?: string;
  lc_zone_code?: string;
  lc_full_code?: string;
  zone_type?: string;
  description?: string;
  area?: number;
  area_unit?: string;
  capacity?: number;
  priority?: number;
  center_x?: number;
  center_y?: number;
  coordinate_unit?: string;
  temperature_controlled?: boolean;
  min_temperature?: number;
  max_temperature?: number;
  temperature_unit?: string;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  warehouse_name?: string;
}

export function WarehouseZonesTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [zones, setZones] = useState<WarehouseZoneData[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [currentZone, setCurrentZone] = useState<WarehouseZoneData | null>(null);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  const zoneFormSchema = z.object({
    zone_name: z.string().min(1, "Zone name is required"),
    warehouse_id: z.string().min(1, "Warehouse is required"),
    zone_code: z.string().optional(),
    zone_type: z.string().optional(),
    description: z.string().optional(),
    area: z.coerce.number().min(0).optional(),
    area_unit: z.string().optional(),
    capacity: z.coerce.number().min(0).optional(),
    priority: z.coerce.number().min(1).max(10).optional(),
    center_x: z.coerce.number().optional(),
    center_y: z.coerce.number().optional(),
    coordinate_unit: z.string().optional(),
    temperature_controlled: z.boolean().default(false),
    min_temperature: z.coerce.number().optional(),
    max_temperature: z.coerce.number().optional(),
    temperature_unit: z.string().optional(),
    status: z.enum(["operational", "maintenance", "closed"]).default("operational"),
  });

  useEffect(() => {
    fetchZones();
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get('/api/warehouses');
      if (response.data?.success) {
        setWarehouses(response.data.data?.warehouses || []);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/zones');

      if (response.data?.success) {
        setZones(response.data.data?.zones || []);
      } else {
        setZones([]);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  const createForm = useForm<z.infer<typeof zoneFormSchema>>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      zone_name: "",
      warehouse_id: "",
      zone_code: "",
      zone_type: "",
      description: "",
      area: 0,
      area_unit: "SQM",
      capacity: 0,
      priority: 1,
      center_x: 0,
      center_y: 0,
      coordinate_unit: "METERS",
      temperature_controlled: false,
      min_temperature: 0,
      max_temperature: 0,
      temperature_unit: "CELSIUS",
      status: "operational",
    },
  });

  const editForm = useForm<z.infer<typeof zoneFormSchema>>({
    resolver: zodResolver(zoneFormSchema),
  });

  const onCreateSubmit = async (data: z.infer<typeof zoneFormSchema>) => {
    try {
      const response = await apiClient.post('/api/zones', {
        ...data,
        is_active: true,
      });

      if (response.data?.success) {
        setIsCreateDialogOpen(false);
        createForm.reset();
        fetchZones();
        showAlert({
          title: "Success",
          description: "Zone created successfully",
        });
      } else {
        throw new Error(response.data?.message || "Failed to create zone");
      }
    } catch (error: any) {
      console.error("Error creating zone:", error);
      showAlert({
        title: "Error Creating Zone",
        description: getErrorMessage(error, "Failed to create zone")
      });
    }
  };

  const onEditSubmit = async (data: z.infer<typeof zoneFormSchema>) => {
    if (!currentZone) return;

    try {
      const response = await apiClient.put(`/api/zones/${currentZone.zone_id}`, data);

      if (response.data?.success) {
        setIsEditDialogOpen(false);
        setCurrentZone(null);
        fetchZones();
        showAlert({
          title: "Success",
          description: "Zone updated successfully",
        });
      } else {
        throw new Error(response.data?.message || "Failed to update zone");
      }
    } catch (error: any) {
      console.error("Error updating zone:", error);
      showAlert({
        title: "Error Updating Zone",
        description: getErrorMessage(error, "Failed to update zone")
      });
    }
  };

  const confirmDelete = async () => {
    if (currentZone) {
      try {
        setIsDeleteLoading(true);
        const response = await apiClient.delete(`/api/zones/${currentZone.zone_id}`);

        if (response.data?.success) {
          setIsDeleteDialogOpen(false);
          setCurrentZone(null);
          fetchZones();
          showAlert({
            title: "Success",
            description: "Zone deleted successfully",
          });
        } else {
          throw new Error(response.data?.message || "Failed to delete zone");
        }
      } catch (error: any) {
        console.error("Error deleting zone:", error);
        showAlert({
          title: "Error Deleting Zone",
          description: getErrorMessage(error, "Failed to delete zone")
        });
      } finally {
        setIsDeleteLoading(false);
      }
    }
  };

  const handleEdit = (zone: WarehouseZoneData) => {
    setCurrentZone(zone);
    editForm.reset({
      zone_name: zone.zone_name,
      warehouse_id: zone.warehouse_id,
      zone_code: zone.zone_code || "",
      zone_type: zone.zone_type || "",
      description: zone.description || "",
      area: zone.area || 0,
      area_unit: zone.area_unit || "SQM",
      capacity: zone.capacity || 0,
      priority: zone.priority || 1,
      center_x: zone.center_x || 0,
      center_y: zone.center_y || 0,
      coordinate_unit: zone.coordinate_unit || "METERS",
      temperature_controlled: zone.temperature_controlled || false,
      min_temperature: zone.min_temperature || 0,
      max_temperature: zone.max_temperature || 0,
      temperature_unit: zone.temperature_unit || "CELSIUS",
      status: zone.status as "operational" | "maintenance" | "closed",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (zone: WarehouseZoneData) => {
    setCurrentZone(zone);
    setIsDeleteDialogOpen(true);
  };

  // Transform zones to TableData format for the table
  const transformedZones: (WarehouseZoneData & TableData)[] = useMemo(() => {
    if (!zones) return [];

    return zones.map((zone: WarehouseZoneData) => ({
      ...zone,
      id: zone.zone_id,
    }));
  }, [zones]);

  // Define column configuration for the table
  const columnConfig: ColumnConfig<WarehouseZoneData & TableData>[] = [
    {
      key: "lc_full_code",
      label: "LC Code",
      width: 120,
      render: (zone) => (
        <span className="font-mono text-sm bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">
          {zone.lc_full_code || zone.lc_zone_code}
        </span>
      ),
    },
    {
      key: "zone_name",
      label: "Zone Name",
      width: 180,
      render: (zone) => (
        <div className="font-medium">{zone.zone_name}</div>
      ),
    },
    {
      key: "warehouse_name",
      label: "Warehouse",
      width: 150,
      filterType: "select",
      render: (zone) => (
        <Badge variant="outline">{zone.warehouse_name || zone.warehouse_id}</Badge>
      ),
    },
    {
      key: "zone_type",
      label: "Type",
      width: 120,
      filterType: "select",
      render: (zone) => (
        <Badge variant="secondary">{zone.zone_type || "General"}</Badge>
      ),
    },
    {
      key: "area",
      label: "Area",
      width: 100,
      render: (zone) => (
        <div className="flex items-center gap-1">
          <Square className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">
            {zone.area ? `${zone.area} ${zone.area_unit || 'SQM'}` : "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      width: 100,
      render: (zone) => (
        <span className="text-sm font-medium">
          {zone.capacity ? zone.capacity.toLocaleString() : "N/A"}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      width: 80,
      render: (zone) => (
        <Badge variant={
          (zone.priority || 1) <= 2 ? "default" :
          (zone.priority || 1) <= 5 ? "secondary" : "destructive"
        }>
          {zone.priority || 1}
        </Badge>
      ),
    },
    {
      key: "temperature_controlled",
      label: "Climate",
      width: 100,
      render: (zone) => (
        <div className="flex items-center gap-1">
          <Thermometer className="h-3 w-3 text-muted-foreground" />
          <Badge variant={zone.temperature_controlled ? "default" : "secondary"}>
            {zone.temperature_controlled ? "Controlled" : "Standard"}
          </Badge>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      filterType: "select",
      render: (zone) => (
        <Badge variant={
          zone.status === "operational" ? "default" :
          zone.status === "maintenance" ? "secondary" : "destructive"
        }>
          {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      width: 130,
      render: (zone) => (
        <span className="text-muted-foreground">
          {new Date(zone.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  const handleZoneEdit = (zone: WarehouseZoneData & TableData) => {
    const zoneFound = zones?.find((z: WarehouseZoneData) => z.zone_id === zone.id);
    if (zoneFound) {
      handleEdit(zoneFound);
    }
  };

  const handleZoneDelete = (zone: WarehouseZoneData & TableData) => {
    const zoneFound = zones?.find((z: WarehouseZoneData) => z.zone_id === zone.id);
    if (zoneFound) {
      setCurrentZone(zoneFound);
      setIsDeleteDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading zones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warehouse Zones</h2>
          <p className="text-muted-foreground">
            Manage warehouse zones and their configurations
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={fetchZones} variant="outline" size="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Zone
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Zone</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new warehouse zone.
                  </DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="zone_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zone Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Zone name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="warehouse_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warehouse*</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {warehouses.map((warehouse) => (
                                  <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                                    {warehouse.warehouse_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={createForm.control}
                      name="zone_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zone Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select zone type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="receiving">Receiving</SelectItem>
                              <SelectItem value="storage">Storage</SelectItem>
                              <SelectItem value="picking">Picking</SelectItem>
                              <SelectItem value="packing">Packing</SelectItem>
                              <SelectItem value="shipping">Shipping</SelectItem>
                              <SelectItem value="staging">Staging</SelectItem>
                              <SelectItem value="crossdock">Cross-dock</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Zone description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={createForm.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Area</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="1000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="5000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority (1-10)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                placeholder="1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={createForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="operational">Operational</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <MapPin className="mr-2 h-4 w-4" />
                        Create Zone
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Main Zones Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedTable
              data={transformedZones}
              columns={columnConfig}
              loading={loading}
              title="Warehouse Zones"
              onRowEdit={canPerformAdminActions ? handleZoneEdit : undefined}
              onRowDelete={canPerformAdminActions ? handleZoneDelete : undefined}
              actions={{
                edit: canPerformAdminActions ? { label: "Edit Zone" } : undefined,
                delete: canPerformAdminActions ? { label: "Delete Zone" } : undefined,
              }}
              emptyMessage="No zones found"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Zone Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
            <DialogDescription>
              Update zone details and configuration.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="zone_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Zone name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="warehouse_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                              {warehouse.warehouse_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Update Zone
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <HardDeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Zone Permanently"
        description={`Are you sure you want to permanently delete "${currentZone?.zone_name}" zone? This action cannot be undone and will remove all associated data from the database.`}
        loading={isDeleteLoading}
      />

      {/* General Alert Dialog */}
      <AlertComponent />
    </div>
  );
}