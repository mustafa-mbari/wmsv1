"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Warehouse,
  Save,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { useAlert } from "@/hooks/useAlert";
import { getErrorMessage } from "@/lib/error-utils";

export interface WarehouseData {
  warehouse_id: string;
  warehouse_name: string;
  warehouse_code: string;
  lc_warehouse_code: string;
  lc_full_code?: string;
  warehouse_type?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  total_area?: number;
  area_unit?: string;
  storage_capacity?: number;
  temperature_controlled: boolean;
  min_temperature?: number;
  max_temperature?: number;
  temperature_unit?: string;
  is_active: boolean;
  status: string;
  timezone?: string;
  operating_hours?: any;
  custom_attributes?: any;
  created_at: string;
  updated_at: string;
}

export function WarehousesTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState<WarehouseData | null>(null);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  const warehouseFormSchema = z.object({
    warehouse_name: z.string().min(1, "Warehouse name is required"),
    warehouse_code: z.string().min(1, "Warehouse code is required"),
    warehouse_type: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    contact_person: z.string().optional(),
    contact_email: z.string().email().optional().or(z.literal("")),
    contact_phone: z.string().optional(),
    total_area: z.coerce.number().min(0).optional(),
    area_unit: z.string().optional(),
    storage_capacity: z.coerce.number().min(0).optional(),
    temperature_controlled: z.boolean().default(false),
    min_temperature: z.coerce.number().optional(),
    max_temperature: z.coerce.number().optional(),
    temperature_unit: z.string().optional(),
    status: z.enum(["operational", "maintenance", "closed"]).default("operational"),
    timezone: z.string().optional(),
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/warehouses');

      if (response.data?.success) {
        setWarehouses(response.data.data?.warehouses || []);
      } else {
        setWarehouses([]);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const createForm = useForm<z.infer<typeof warehouseFormSchema>>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      warehouse_name: "",
      warehouse_code: "",
      warehouse_type: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      total_area: 0,
      area_unit: "SQM",
      storage_capacity: 0,
      temperature_controlled: false,
      min_temperature: 0,
      max_temperature: 0,
      temperature_unit: "CELSIUS",
      status: "operational",
      timezone: "",
    },
  });

  const editForm = useForm<z.infer<typeof warehouseFormSchema>>({
    resolver: zodResolver(warehouseFormSchema),
  });

  const onCreateSubmit = async (data: z.infer<typeof warehouseFormSchema>) => {
    try {
      const response = await apiClient.post('/api/warehouses', {
        ...data,
        is_active: true,
      });

      if (response.data?.success) {
        setIsCreateDialogOpen(false);
        createForm.reset();
        fetchWarehouses();
        showAlert({
          title: "Success",
          description: "Warehouse created successfully",
        });
      } else {
        throw new Error(response.data?.message || "Failed to create warehouse");
      }
    } catch (error: any) {
      console.error("Error creating warehouse:", error);
      showAlert({
        title: "Error Creating Warehouse",
        description: getErrorMessage(error, "Failed to create warehouse")
      });
    }
  };

  const onEditSubmit = async (data: z.infer<typeof warehouseFormSchema>) => {
    if (!currentWarehouse) return;

    try {
      const response = await apiClient.put(`/api/warehouses/${currentWarehouse.warehouse_id}`, data);

      if (response.data?.success) {
        setIsEditDialogOpen(false);
        setCurrentWarehouse(null);
        fetchWarehouses();
        showAlert({
          title: "Success",
          description: "Warehouse updated successfully",
        });
      } else {
        throw new Error(response.data?.message || "Failed to update warehouse");
      }
    } catch (error: any) {
      console.error("Error updating warehouse:", error);
      showAlert({
        title: "Error Updating Warehouse",
        description: getErrorMessage(error, "Failed to update warehouse")
      });
    }
  };

  const confirmDelete = async () => {
    if (currentWarehouse) {
      try {
        setIsDeleteLoading(true);
        const response = await apiClient.delete(`/api/warehouses/${currentWarehouse.warehouse_id}`);

        if (response.data?.success) {
          setIsDeleteDialogOpen(false);
          setCurrentWarehouse(null);
          fetchWarehouses();
          showAlert({
            title: "Success",
            description: "Warehouse deleted successfully",
          });
        } else {
          throw new Error(response.data?.message || "Failed to delete warehouse");
        }
      } catch (error: any) {
        console.error("Error deleting warehouse:", error);
        showAlert({
          title: "Error Deleting Warehouse",
          description: getErrorMessage(error, "Failed to delete warehouse")
        });
      } finally {
        setIsDeleteLoading(false);
      }
    }
  };

  const handleEdit = (warehouse: WarehouseData) => {
    setCurrentWarehouse(warehouse);
    editForm.reset({
      warehouse_name: warehouse.warehouse_name,
      warehouse_code: warehouse.warehouse_code,
      warehouse_type: warehouse.warehouse_type || "",
      address: warehouse.address || "",
      city: warehouse.city || "",
      state: warehouse.state || "",
      country: warehouse.country || "",
      postal_code: warehouse.postal_code || "",
      contact_person: warehouse.contact_person || "",
      contact_email: warehouse.contact_email || "",
      contact_phone: warehouse.contact_phone || "",
      total_area: warehouse.total_area || 0,
      area_unit: warehouse.area_unit || "SQM",
      storage_capacity: warehouse.storage_capacity || 0,
      temperature_controlled: warehouse.temperature_controlled,
      min_temperature: warehouse.min_temperature || 0,
      max_temperature: warehouse.max_temperature || 0,
      temperature_unit: warehouse.temperature_unit || "CELSIUS",
      status: warehouse.status as "operational" | "maintenance" | "closed",
      timezone: warehouse.timezone || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (warehouse: WarehouseData) => {
    setCurrentWarehouse(warehouse);
    setIsDeleteDialogOpen(true);
  };

  // Transform warehouses to TableData format for the table
  const transformedWarehouses: (WarehouseData & TableData)[] = useMemo(() => {
    if (!warehouses) return [];

    return warehouses.map((warehouse: WarehouseData) => ({
      ...warehouse,
      id: warehouse.warehouse_id,
    }));
  }, [warehouses]);

  // Define column configuration for the table
  const columnConfig: ColumnConfig<WarehouseData & TableData>[] = [
    {
      key: "lc_full_code",
      label: "LC Code",
      width: 120,
      render: (warehouse) => (
        <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
          {warehouse.lc_full_code || warehouse.lc_warehouse_code}
        </span>
      ),
    },
    {
      key: "warehouse_name",
      label: "Warehouse Name",
      width: 200,
      render: (warehouse) => (
        <div className="font-medium">{warehouse.warehouse_name}</div>
      ),
    },
    {
      key: "warehouse_code",
      label: "Code",
      width: 120,
      render: (warehouse) => (
        <span className="font-mono text-sm">{warehouse.warehouse_code}</span>
      ),
    },
    {
      key: "warehouse_type",
      label: "Type",
      width: 150,
      filterType: "select",
      render: (warehouse) => (
        <Badge variant="outline">{warehouse.warehouse_type || "Standard"}</Badge>
      ),
    },
    {
      key: "city",
      label: "Location",
      width: 180,
      render: (warehouse) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{warehouse.city ? `${warehouse.city}, ${warehouse.state}` : "N/A"}</span>
        </div>
      ),
    },
    {
      key: "contact_email",
      label: "Contact",
      width: 200,
      render: (warehouse) => (
        <div className="space-y-1">
          {warehouse.contact_email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{warehouse.contact_email}</span>
            </div>
          )}
          {warehouse.contact_phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{warehouse.contact_phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "total_area",
      label: "Area",
      width: 120,
      render: (warehouse) => (
        <span className="text-sm">
          {warehouse.total_area ? `${warehouse.total_area} ${warehouse.area_unit || 'SQM'}` : "N/A"}
        </span>
      ),
    },
    {
      key: "temperature_controlled",
      label: "Climate",
      width: 100,
      render: (warehouse) => (
        <Badge variant={warehouse.temperature_controlled ? "default" : "secondary"}>
          {warehouse.temperature_controlled ? "Controlled" : "Standard"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      filterType: "select",
      render: (warehouse) => (
        <Badge variant={
          warehouse.status === "operational" ? "default" :
          warehouse.status === "maintenance" ? "secondary" : "destructive"
        }>
          {warehouse.status?.charAt(0).toUpperCase() + warehouse.status?.slice(1)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      width: 130,
      render: (warehouse) => (
        <span className="text-muted-foreground">
          {new Date(warehouse.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  const handleWarehouseEdit = (warehouse: WarehouseData & TableData) => {
    const warehouseFound = warehouses?.find((w: WarehouseData) => w.warehouse_id === warehouse.id);
    if (warehouseFound) {
      handleEdit(warehouseFound);
    }
  };

  const handleWarehouseDelete = (warehouse: WarehouseData & TableData) => {
    const warehouseFound = warehouses?.find((w: WarehouseData) => w.warehouse_id === warehouse.id);
    if (warehouseFound) {
      setCurrentWarehouse(warehouseFound);
      setIsDeleteDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading warehouses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warehouses</h2>
          <p className="text-muted-foreground">
            Manage warehouse facilities and their configuration
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={fetchWarehouses} variant="outline" size="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canPerformAdminActions && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Warehouse
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Warehouse</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new warehouse facility.
                  </DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="warehouse_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warehouse Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Warehouse name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="warehouse_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warehouse Code*</FormLabel>
                            <FormControl>
                              <Input placeholder="WH001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={createForm.control}
                      name="warehouse_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warehouse Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select warehouse type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="distribution_center">Distribution Center</SelectItem>
                              <SelectItem value="fulfillment_center">Fulfillment Center</SelectItem>
                              <SelectItem value="cold_storage">Cold Storage</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={createForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="contact_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contact@warehouse.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="contact_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1-555-0123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="total_area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Area</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="10000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="storage_capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Storage Capacity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="50000"
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
                          <FormLabel>Operational Status</FormLabel>
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
                        <Warehouse className="mr-2 h-4 w-4" />
                        Create Warehouse
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Main Warehouses Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedTable
              data={transformedWarehouses}
              columns={columnConfig}
              loading={loading}
              title="Warehouse Facilities"
              onRowEdit={canPerformAdminActions ? handleWarehouseEdit : undefined}
              onRowDelete={canPerformAdminActions ? handleWarehouseDelete : undefined}
              actions={{
                edit: canPerformAdminActions ? { label: "Edit Warehouse" } : undefined,
                delete: canPerformAdminActions ? { label: "Delete Warehouse" } : undefined,
              }}
              emptyMessage="No warehouses found"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Warehouse Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Warehouse</DialogTitle>
            <DialogDescription>
              Update warehouse details and configuration.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {/* Same form fields as create form - abbreviated for brevity */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="warehouse_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Warehouse name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="warehouse_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Code*</FormLabel>
                      <FormControl>
                        <Input placeholder="WH001" {...field} />
                      </FormControl>
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
                  Update Warehouse
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
        title="Delete Warehouse Permanently"
        description={`Are you sure you want to permanently delete "${currentWarehouse?.warehouse_name}" (${currentWarehouse?.warehouse_code})? This action cannot be undone and will remove all associated data from the database.`}
        loading={isDeleteLoading}
      />

      {/* General Alert Dialog */}
      <AlertComponent />
    </div>
  );
}