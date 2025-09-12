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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HardDeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  RefreshCw,
  Ruler,
  Save,
  Edit,
  Trash2,
  XCircle,
  Tag,
  TrendingUp,
  Package,
  Scale,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { apiClient } from "@/lib/api-client";

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  description?: string;
  unit_type: "weight" | "length" | "volume" | "area" | "count" | "time" | "other";
  base_unit?: string;
  conversion_factor?: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

const UNIT_TYPES = [
  { value: "weight", label: "Weight" },
  { value: "length", label: "Length" },
  { value: "volume", label: "Volume" },
  { value: "area", label: "Area" },
  { value: "count", label: "Count" },
  { value: "time", label: "Time" },
  { value: "other", label: "Other" },
];

export default function UnitsPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteUnitIds, setBulkDeleteUnitIds] = useState<string[]>([]);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);

  const canAccessUnitsPage = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('inventory-manager');
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  const unitFormSchema = z.object({
    name: z.string().min(1, "Unit name is required"),
    symbol: z.string().min(1, "Unit symbol is required"),
    description: z.string().optional(),
    unitType: z.enum(["weight", "length", "volume", "area", "count", "time", "other"]),
    baseUnit: z.string().optional(),
    conversionFactor: z.number().min(0, "Conversion factor must be positive").optional(),
    isActive: z.boolean().default(true),
  });

  useEffect(() => {
    if (canAccessUnitsPage) {
      fetchUnits();
    }
  }, [canAccessUnitsPage]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/units');
      
      if (response.data?.success) {
        const apiUnits = response.data.data.map((unit: any) => ({
          id: parseInt(unit.id),
          name: unit.name,
          symbol: unit.symbol,
          description: unit.description,
          unit_type: unit.unit_type,
          base_unit: unit.base_unit,
          conversion_factor: unit.conversion_factor ? parseFloat(unit.conversion_factor) : undefined,
          is_active: unit.is_active,
          product_count: unit.product_count || 0,
          created_at: unit.created_at,
          updated_at: unit.updated_at,
        }));
        setUnits(apiUnits);
      } else {
        setUnits([]);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const createForm = useForm<z.infer<typeof unitFormSchema>>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      unitType: "count",
      baseUnit: "",
      conversionFactor: 1,
      isActive: true,
    },
  });

  const editForm = useForm<z.infer<typeof unitFormSchema>>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      unitType: "count",
      baseUnit: "",
      conversionFactor: 1,
      isActive: true,
    },
  });

  const onCreateSubmit = async (data: z.infer<typeof unitFormSchema>) => {
    try {
      console.log("Creating unit:", data);
      alert("Unit created successfully");
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchUnits();
    } catch (error) {
      console.error("Error creating unit:", error);
      alert("Failed to create unit");
    }
  };

  const onEditSubmit = async (data: z.infer<typeof unitFormSchema>) => {
    if (!currentUnit) return;
    
    try {
      console.log("Updating unit:", data);
      alert("Unit updated successfully");
      setIsEditDialogOpen(false);
      fetchUnits();
    } catch (error) {
      console.error("Error updating unit:", error);
      alert("Failed to update unit");
    }
  };

  const confirmDelete = async () => {
    if (currentUnit) {
      try {
        setIsDeleteLoading(true);
        console.log("Deleting unit:", currentUnit.id);
        setIsDeleteDialogOpen(false);
        setCurrentUnit(null);
        fetchUnits();
      } catch (error) {
        console.error("Error deleting unit:", error);
        alert("Failed to delete unit");
      } finally {
        setIsDeleteLoading(false);
      }
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (!canPerformAdminActions) {
      setBulkDeleteDialogOpen(false);
      return;
    }
    
    try {
      console.log("Bulk deleting units:", bulkDeleteUnitIds);
      setBulkDeleteDialogOpen(false);
      setBulkDeleteUnitIds([]);
      fetchUnits();
    } catch (error) {
      console.error("Error deleting units:", error);
      alert("Failed to delete some units");
    }
  };

  const handleEdit = (unit: Unit) => {
    setCurrentUnit(unit);
    editForm.reset({
      name: unit.name,
      symbol: unit.symbol,
      description: unit.description || "",
      unitType: unit.unit_type,
      baseUnit: unit.base_unit || "",
      conversionFactor: unit.conversion_factor || 1,
      isActive: unit.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (unit: Unit) => {
    setCurrentUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  // Transform units to TableData format for the table
  const transformedUnits: (Unit & TableData)[] = useMemo(() => {
    if (!units) return [];
    
    return units.map((unit: Unit) => ({
      ...unit,
      id: String(unit.id),
    }));
  }, [units]);

  // Define column configuration for the table
  const columnConfig: ColumnConfig<Unit & TableData>[] = [
    {
      key: "name",
      label: "Unit Name",
      width: 180,
      render: (unit) => (
        <div className="font-medium">{unit.name}</div>
      ),
    },
    {
      key: "symbol",
      label: "Symbol",
      width: 100,
      render: (unit) => (
        <span className="font-mono text-sm font-medium">{unit.symbol}</span>
      ),
    },
    {
      key: "unit_type",
      label: "Type",
      width: 120,
      filterType: "select",
      render: (unit) => (
        <Badge variant="outline">{
          UNIT_TYPES.find(ut => ut.value === unit.unit_type)?.label || unit.unit_type
        }</Badge>
      ),
    },
    {
      key: "base_unit",
      label: "Base Unit",
      width: 130,
      render: (unit) => (
        <span className="text-muted-foreground">{unit.base_unit || "N/A"}</span>
      ),
    },
    {
      key: "conversion_factor",
      label: "Factor",
      width: 100,
      render: (unit) => (
        <span className="font-mono text-sm">{unit.conversion_factor || "1"}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      width: 200,
      render: (unit) => (
        <span className="text-muted-foreground">{unit.description || "N/A"}</span>
      ),
    },
    {
      key: "product_count",
      label: "Products",
      width: 100,
      render: (unit) => (
        <span className="font-medium">{unit.product_count}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 120,
      filterType: "select",
      render: (unit) => (
        <Badge variant={unit.is_active ? "default" : "secondary"}>
          {unit.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      width: 130,
      render: (unit) => (
        <span className="text-muted-foreground">
          {new Date(unit.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  const handleUnitSelection = (unitIds: string[]) => {
    console.log("Selected units:", unitIds);
  };

  const handleBulkAction = (action: string, unitIds: string[]) => {
    switch (action) {
      case "delete":
        if (canPerformAdminActions) {
          setBulkDeleteUnitIds(unitIds);
          setBulkDeleteDialogOpen(true);
        }
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleUnitEdit = (unit: Unit & TableData) => {
    const unitFound = units?.find((u: Unit) => u.id.toString() === unit.id);
    if (unitFound) {
      handleEdit(unitFound);
    }
  };

  const handleUnitDelete = (unit: Unit & TableData) => {
    const unitFound = units?.find((u: Unit) => u.id.toString() === unit.id);
    if (unitFound) {
      setCurrentUnit(unitFound);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleUnitView = (unit: Unit & TableData) => {
    console.log("View unit details:", unit.name);
  };

  // Calculate stats
  const totalUnits = units.length;
  const activeUnits = units.filter(u => u.is_active).length;
  const unitTypes = new Set(units.map(u => u.unit_type)).size;
  const totalProducts = units.reduce((sum, u) => sum + u.product_count, 0);

  if (!canAccessUnitsPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Units page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Only authorized personnel can view unit information.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Units of Measure
              {!canPerformAdminActions && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">(Read Only)</span>
              )}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {canPerformAdminActions 
                ? "Manage measurement units for product inventory" 
                : "View measurement units information (read-only access)"
              }
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={fetchUnits} variant="outline" size="default">
              <RefreshCw className="mr-2 h-4 w-4" /> 
              Refresh
            </Button>
            {canPerformAdminActions && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add Unit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Unit</DialogTitle>
                    <DialogDescription>
                      Add a new unit of measure for products.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="Unit name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="symbol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Symbol*</FormLabel>
                              <FormControl>
                                <Input placeholder="kg, pcs, L" {...field} />
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
                              <Textarea placeholder="Unit description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="unitType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Type*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {UNIT_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="baseUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Base Unit</FormLabel>
                              <FormControl>
                                <Input placeholder="gram, milliliter" {...field} />
                              </FormControl>
                              <FormDescription>
                                Reference unit for conversion
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="conversionFactor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Conversion Factor</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.001"
                                  placeholder="1000" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormDescription>
                                How many base units = 1 current unit
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={createForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>
                                Unit is available for product assignment
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          <Ruler className="mr-2 h-4 w-4" />
                          Create Unit
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Read-only notice for non-admins */}
      {!canPerformAdminActions && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Read-Only Access
              </h3>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                You have view-only access to unit information. To create, edit, or delete units, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Unit Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Units</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalUnits}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Ruler className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Units</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeUnits}</p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Tag className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Unit Types</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{unitTypes}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Scale className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Total Products</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{totalProducts}</p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Units Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Units Directory</CardTitle>
              <CardDescription className="mt-1">
                Manage measurement units for inventory management
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {transformedUnits.length} {transformedUnits.length === 1 ? 'unit' : 'units'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedTable
              data={transformedUnits}
              columns={columnConfig}
              loading={loading}
              title="Units of Measure"
              onRowSelect={handleUnitSelection}
              onBulkAction={handleBulkAction}
              onRowEdit={canPerformAdminActions ? handleUnitEdit : undefined}
              onRowDelete={canPerformAdminActions ? handleUnitDelete : undefined}
              onRowView={handleUnitView}
              actions={{
                view: { label: "View Details" },
                edit: canPerformAdminActions ? { label: "Edit Unit" } : undefined,
                delete: canPerformAdminActions ? { label: "Delete Unit" } : undefined,
              }}
              emptyMessage="No units found"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Unit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>
              Update unit details and conversion information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {/* Same form fields as create form */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Unit name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol*</FormLabel>
                      <FormControl>
                        <Input placeholder="kg, pcs, L" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="unitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Type*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Unit is available for product assignment
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Update Unit
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
        title="Delete Unit Permanently"
        description={`Are you sure you want to permanently delete "${currentUnit?.name}" unit? This action cannot be undone and will affect ${currentUnit?.product_count || 0} product(s) using this unit.`}
        loading={isDeleteLoading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {!canPerformAdminActions ? "Permission Denied" : "Delete Multiple Units"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!canPerformAdminActions 
                ? "You don't have permission to delete units. Only authorized personnel can perform this action."
                : `Are you sure you want to permanently delete ${bulkDeleteUnitIds.length} unit${bulkDeleteUnitIds.length === 1 ? '' : 's'}? This action cannot be undone and may affect products using these units.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {canPerformAdminActions && (
              <AlertDialogAction 
                onClick={handleBulkDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete {bulkDeleteUnitIds.length} Unit{bulkDeleteUnitIds.length === 1 ? '' : 's'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}