"use client";

// Enhanced Warehouses Tab - Layer 1: UI Component using the layered architecture
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  Warehouse,
  AlertCircle,
  MapPin,
  Building,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Layer 2: Custom Hooks
import {
  useWarehouses,
  useWarehouseMutations,
  useWarehouseState,
  useWarehouseSearch
} from "@/hooks/use-warehouses";

// Types
import { Warehouse as WarehouseType } from "@/types/api";

// Form schemas
const warehouseFormSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  code: z.string().min(1, "Warehouse code is required"),
  description: z.string().optional(),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    postal_code: z.string().min(1, "Postal code is required"),
  }),
  status: z.enum(["active", "inactive"]).default("active"),
});

type WarehouseFormData = z.infer<typeof warehouseFormSchema>;

export function WarehousesTab() {
  // Layer 2: Custom Hooks for state management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Warehouse state management
  const {
    selectedWarehouses,
    currentWarehouse,
    selectWarehouse,
    clearSelection,
    setCurrentWarehouse,
    hasSelection,
    selectionCount
  } = useWarehouseState();

  // Data fetching with React Query
  const {
    data: warehousesResponse,
    isLoading,
    error,
    refetch
  } = useWarehouses({
    page: currentPage,
    limit: 10,
    search: searchTerm
  });

  // Mutations
  const {
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    bulkOperations
  } = useWarehouseMutations();

  // Search functionality
  const { updateSearch, clearSearch } = useWarehouseSearch();

  // Forms
  const createForm = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
      },
      status: "active",
    },
  });

  const editForm = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseFormSchema),
  });

  // Event handlers
  const handleCreateWarehouse = async (data: WarehouseFormData) => {
    await createWarehouse.mutateAsync(data);
    setIsCreateDialogOpen(false);
    createForm.reset();
  };

  const handleEditWarehouse = async (data: WarehouseFormData) => {
    if (!currentWarehouse) return;

    await updateWarehouse.mutateAsync({
      id: currentWarehouse.id,
      data
    });
    setIsEditDialogOpen(false);
    setCurrentWarehouse(null);
    editForm.reset();
  };

  const handleDeleteWarehouse = async (warehouse: WarehouseType) => {
    await deleteWarehouse.mutateAsync(warehouse.id);
  };

  const handleBulkDelete = async () => {
    if (selectedWarehouses.length === 0) return;

    await bulkOperations.mutateAsync({
      operation: 'delete',
      warehouses: selectedWarehouses.map(w => ({ id: w.id }))
    });
    clearSelection();
  };

  const openEditDialog = (warehouse: WarehouseType) => {
    setCurrentWarehouse(warehouse);
    editForm.reset({
      name: warehouse.name,
      code: warehouse.code,
      description: warehouse.description || "",
      address: warehouse.address,
      status: warehouse.status as "active" | "inactive",
    });
    setIsEditDialogOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateSearch({ search: value });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading warehouses...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">Error loading warehouses</span>
        <Button onClick={() => refetch()} variant="outline" className="ml-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const warehouses = warehousesResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warehouses</h2>
          <p className="text-muted-foreground">
            Manage warehouse locations and facilities
          </p>
        </div>
        <div className="flex space-x-2">
          {hasSelection && (
            <HardDeleteConfirmationDialog
              trigger={
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectionCount})
                </Button>
              }
              title="Delete Selected Warehouses"
              description={`Are you sure you want to delete ${selectionCount} selected warehouses? This action cannot be undone.`}
              onConfirm={handleBulkDelete}
              loading={bulkOperations.isPending}
            />
          )}
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Warehouse</DialogTitle>
                <DialogDescription>
                  Add a new warehouse facility
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateWarehouse)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warehouse Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter warehouse name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warehouse Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter warehouse code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter warehouse description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Address</h4>
                    <FormField
                      control={createForm.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="address.postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter postal code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createWarehouse.isPending}
                    >
                      {createWarehouse.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Warehouse
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search warehouses..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <Card key={warehouse.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedWarehouses.some(w => w.id === warehouse.id)}
                    onChange={() => selectWarehouse(warehouse)}
                    className="rounded"
                  />
                  <Warehouse className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(warehouse)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <HardDeleteConfirmationDialog
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title="Delete Warehouse"
                    description={`Are you sure you want to delete "${warehouse.name}"?`}
                    onConfirm={() => handleDeleteWarehouse(warehouse)}
                    loading={deleteWarehouse.isPending}
                  />
                </div>
              </div>
              <CardTitle className="text-lg">{warehouse.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Code: {warehouse.code}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {warehouse.description && (
                  <p className="text-sm line-clamp-2">{warehouse.description}</p>
                )}
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div>{warehouse.address.street}</div>
                    <div>{warehouse.address.city}, {warehouse.address.state} {warehouse.address.postal_code}</div>
                    <div>{warehouse.address.country}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
                    {warehouse.status}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Facility</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {warehouses.length === 0 && (
        <div className="text-center py-12">
          <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first warehouse.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Warehouse</DialogTitle>
            <DialogDescription>
              Update warehouse information
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditWarehouse)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter warehouse name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter warehouse code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter warehouse description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Address</h4>
                <FormField
                  control={editForm.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="address.postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter postal code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={updateWarehouse.isPending}
                >
                  {updateWarehouse.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Warehouse
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}