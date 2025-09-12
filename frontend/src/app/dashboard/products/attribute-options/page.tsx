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
import {
  Loader2,
  Plus,
  RefreshCw,
  XCircle,
  Settings,
  List,
  Tag,
  Save,
  Edit,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { useAlert } from "@/hooks/useAlert";
import { getErrorMessage } from "@/lib/error-utils";

export interface AttributeOption {
  id: string;
  attribute_id: string;
  attribute_name: string;
  attribute_type: string;
  value: string;
  label: string;
  sort_order: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attribute {
  id: string;
  name: string;
  type: string;
}

const attributeOptionFormSchema = z.object({
  attribute_id: z.string().min(1, "Attribute is required").refine((val) => val !== "" && val !== "undefined", "Please select a valid attribute"),
  value: z.string().min(1, "Value is required"),
  label: z.string().min(1, "Label is required"),
  sort_order: z.coerce.number().min(0, "Sort order must be positive").optional(),
  is_active: z.boolean().default(true),
});

export default function AttributeOptionsPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [attributeOptions, setAttributeOptions] = useState<AttributeOption[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteOptionIds, setBulkDeleteOptionIds] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState<AttributeOption | null>(null);

  const canAccessPage = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('inventory-manager');
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  useEffect(() => {
    if (canAccessPage) {
      fetchAttributeOptions();
      fetchAttributes();
    }
  }, [canAccessPage]);

  const fetchAttributes = async () => {
    try {
      const response = await apiClient.get('/api/attributes');
      if (response.data?.success) {
        setAttributes(response.data.data.map((attr: any) => ({
          id: attr.id.toString(),
          name: attr.name,
          type: attr.data_type || attr.type
        })));
      } else {
        setAttributes([]);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      setAttributes([]);
      showAlert({
        title: "Error Loading Attributes",
        description: "Failed to load attributes. Please refresh the page or contact support."
      });
    }
  };

  const fetchAttributeOptions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/attribute-options');
      
      if (response.data?.success) {
        setAttributeOptions(response.data.data);
      } else {
        setAttributeOptions([]);
      }
    } catch (error) {
      console.error("Error fetching attribute options:", error);
      setAttributeOptions([]);
      showAlert({
        title: "Error Loading Attribute Options",
        description: "Failed to load attribute options. Please refresh the page or contact support."
      });
    } finally {
      setLoading(false);
    }
  };

  const createForm = useForm<z.infer<typeof attributeOptionFormSchema>>({
    resolver: zodResolver(attributeOptionFormSchema),
    defaultValues: {
      attribute_id: "",
      value: "",
      label: "",
      sort_order: 0,
      is_active: true,
    },
  });

  const editForm = useForm<z.infer<typeof attributeOptionFormSchema>>({
    resolver: zodResolver(attributeOptionFormSchema),
    defaultValues: {
      attribute_id: "",
      value: "",
      label: "",
      sort_order: 0,
      is_active: true,
    },
  });

  const onCreateSubmit = async (data: z.infer<typeof attributeOptionFormSchema>) => {
    try {
      const optionData = {
        attribute_id: parseInt(data.attribute_id),
        value: data.value.trim(),
        label: data.label.trim(),
        sort_order: Number(data.sort_order) || 0,
        is_active: data.is_active,
      };

      const response = await apiClient.post('/api/attribute-options', optionData);
      
      if (response.data?.success) {
        setIsCreateDialogOpen(false);
        createForm.reset();
        fetchAttributeOptions();
      } else {
        throw new Error(response.data?.message || "Failed to create attribute option");
      }
    } catch (error: any) {
      console.error("Error creating attribute option:", error);
      showAlert({
        title: "Error Creating Attribute Option",
        description: getErrorMessage(error, "Failed to create attribute option")
      });
    }
  };

  const onEditSubmit = async (data: z.infer<typeof attributeOptionFormSchema>) => {
    if (!currentOption) return;
    
    try {
      const optionData = {
        attribute_id: parseInt(data.attribute_id),
        value: data.value.trim(),
        label: data.label.trim(),
        sort_order: Number(data.sort_order) || 0,
        is_active: data.is_active,
      };

      const response = await apiClient.put(`/api/attribute-options/${currentOption.id}`, optionData);
      
      if (response.data?.success) {
        setIsEditDialogOpen(false);
        setCurrentOption(null);
        fetchAttributeOptions();
      } else {
        throw new Error(response.data?.message || "Failed to update attribute option");
      }
    } catch (error: any) {
      console.error("Error updating attribute option:", error);
      showAlert({
        title: "Error Updating Attribute Option",
        description: getErrorMessage(error, "Failed to update attribute option")
      });
    }
  };

  const confirmDelete = async () => {
    if (!currentOption) return;
    
    try {
      setIsDeleteLoading(true);
      console.log(`Attempting to delete attribute option with ID: ${currentOption.id}`);
      
      const response = await apiClient.delete(`/api/attribute-options/${currentOption.id}`);
      console.log('Delete response:', response.data);
      
      if (response.data?.success) {
        console.log(`Successfully deleted attribute option: ${currentOption.label}`);
        setIsDeleteDialogOpen(false);
        setCurrentOption(null);
        // Refresh the data to ensure the deleted item is removed from the UI
        await fetchAttributeOptions();
      } else {
        throw new Error(response.data?.message || "Failed to delete attribute option from database");
      }
    } catch (error: any) {
      console.error("Error deleting attribute option:", error);
      showAlert({
        title: "Error Deleting Attribute Option",
        description: getErrorMessage(error, "Failed to delete attribute option. The item may still exist in the database.")
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleEdit = (option: AttributeOption) => {
    setCurrentOption(option);
    editForm.reset({
      attribute_id: option.attribute_id,
      value: option.value,
      label: option.label,
      sort_order: option.sort_order,
      is_active: option.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (option: AttributeOption) => {
    setCurrentOption(option);
    setIsDeleteDialogOpen(true);
  };

  // Transform options to TableData format for the table
  const transformedOptions: (AttributeOption & TableData)[] = useMemo(() => {
    if (!attributeOptions) return [];
    
    return attributeOptions.map((option: AttributeOption) => ({
      ...option,
      id: option.id,
    }));
  }, [attributeOptions]);

  // Define column configuration for the table
  const columnConfig: ColumnConfig<AttributeOption & TableData>[] = [
    {
      key: "attribute_name",
      label: "Attribute",
      width: 180,
      filterType: "select",
      render: (option) => (
        <div className="font-medium">{option.attribute_name}</div>
      ),
    },
    {
      key: "label",
      label: "Label",
      width: 200,
      render: (option) => (
        <span className="font-medium">{option.label}</span>
      ),
    },
    {
      key: "value",
      label: "Value",
      width: 150,
      render: (option) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{option.value}</span>
      ),
    },
    {
      key: "attribute_type",
      label: "Type",
      width: 120,
      filterType: "select",
      render: (option) => (
        <Badge variant="outline">{option.attribute_type}</Badge>
      ),
    },
    {
      key: "sort_order",
      label: "Sort Order",
      width: 100,
      render: (option) => (
        <span className="text-muted-foreground">{option.sort_order}</span>
      ),
    },
    {
      key: "usage_count",
      label: "Usage",
      width: 100,
      render: (option) => (
        <span className={`font-medium ${option.usage_count > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
          {option.usage_count}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 100,
      filterType: "select",
      render: (option) => (
        <Badge variant={option.is_active ? "default" : "secondary"}>
          {option.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      width: 130,
      render: (option) => (
        <span className="text-muted-foreground">
          {new Date(option.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  const handleBulkDeleteConfirm = async () => {
    if (!canPerformAdminActions || bulkDeleteOptionIds.length === 0) {
      setBulkDeleteDialogOpen(false);
      return;
    }
    
    try {
      console.log(`Attempting to bulk delete ${bulkDeleteOptionIds.length} attribute options:`, bulkDeleteOptionIds);
      
      const deletePromises = bulkDeleteOptionIds.map(async (optionId) => {
        console.log(`Deleting attribute option ID: ${optionId}`);
        const response = await apiClient.delete(`/api/attribute-options/${optionId}`);
        if (!response.data?.success) {
          throw new Error(`Failed to delete option ${optionId}: ${response.data?.message || 'Unknown error'}`);
        }
        return response;
      });
      
      await Promise.all(deletePromises);
      
      console.log(`Successfully deleted ${bulkDeleteOptionIds.length} attribute options`);
      setBulkDeleteDialogOpen(false);
      setBulkDeleteOptionIds([]);
      // Refresh the data to ensure deleted items are removed from the UI
      await fetchAttributeOptions();
    } catch (error: any) {
      console.error("Error bulk deleting attribute options:", error);
      showAlert({
        title: "Error Deleting Attribute Options",
        description: getErrorMessage(error, "Failed to delete some attribute options. Some items may still exist in the database.")
      });
      // Still refresh to show what was actually deleted
      await fetchAttributeOptions();
    }
  };

  const handleOptionSelection = (optionIds: string[]) => {
    console.log("Selected options:", optionIds);
  };

  const handleBulkAction = (action: string, optionIds: string[]) => {
    switch (action) {
      case "delete":
        if (canPerformAdminActions) {
          setBulkDeleteOptionIds(optionIds);
          setBulkDeleteDialogOpen(true);
        }
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleOptionEdit = (option: AttributeOption & TableData) => {
    const optionFound = attributeOptions?.find((o: AttributeOption) => o.id === option.id);
    if (optionFound) {
      handleEdit(optionFound);
    }
  };

  const handleOptionDelete = (option: AttributeOption & TableData) => {
    const optionFound = attributeOptions?.find((o: AttributeOption) => o.id === option.id);
    if (optionFound) {
      setCurrentOption(optionFound);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleOptionView = (option: AttributeOption & TableData) => {
    console.log("View option details:", option.label);
  };

  // Calculate stats
  const totalOptions = transformedOptions.length;
  const activeOptions = transformedOptions.filter(o => o.is_active).length;
  const usedOptions = transformedOptions.filter(o => o.usage_count > 0).length;

  if (!canAccessPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Attribute Options page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Only authorized personnel can view attribute options.
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
          <p className="text-muted-foreground">Loading attribute options...</p>
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
              Attribute Options
              {!canPerformAdminActions && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">(Read Only)</span>
              )}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {canPerformAdminActions 
                ? "Manage options for product attributes like sizes, colors, materials, etc." 
                : "View attribute options and their configurations (read-only access)"
              }
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={fetchAttributeOptions} variant="outline" size="default">
              <RefreshCw className="mr-2 h-4 w-4" /> 
              Refresh
            </Button>
            {canPerformAdminActions && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add Option
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Attribute Option</DialogTitle>
                    <DialogDescription>
                      Add a new option for an attribute like "Red" for color or "Large" for size.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="attribute_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attribute*</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select attribute" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {attributes.filter(attr => attr.id).map((attribute) => (
                                  <SelectItem key={attribute.id} value={attribute.id}>
                                    {attribute.name} ({attribute.type})
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
                          name="value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value*</FormLabel>
                              <FormControl>
                                <Input placeholder="red" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="label"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Label*</FormLabel>
                              <FormControl>
                                <Input placeholder="Red" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="sort_order"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sort Order</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="is_active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Status</FormLabel>
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
                      </div>
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" />
                          Create Option
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
                You have view-only access to attribute options. To create, edit, or delete options, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Options</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalOptions}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <List className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Options</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeOptions}</p>
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
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Used Options</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{usedOptions}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Options Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Attribute Options</CardTitle>
              <CardDescription className="mt-1">
                Manage options for product attributes
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {transformedOptions.length} {transformedOptions.length === 1 ? 'option' : 'options'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedTable
              data={transformedOptions}
              columns={columnConfig}
              loading={loading}
              title="Attribute Options"
              onRowSelect={handleOptionSelection}
              onBulkAction={handleBulkAction}
              onRowEdit={canPerformAdminActions ? handleOptionEdit : undefined}
              onRowDelete={canPerformAdminActions ? handleOptionDelete : undefined}
              onRowView={handleOptionView}
              actions={{
                view: { label: "View Details" },
                edit: canPerformAdminActions ? { label: "Edit Option" } : undefined,
                delete: canPerformAdminActions ? { label: "Delete Option" } : undefined,
              }}
              bulkActions={canPerformAdminActions ? [
                { label: "Delete", action: "delete", icon: <Trash2 className="h-4 w-4 mr-2" /> },
              ] : []}
              emptyMessage="No attribute options found"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Option Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Attribute Option</DialogTitle>
            <DialogDescription>
              Update the option details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="attribute_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attribute*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select attribute" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {attributes.filter(attr => attr.id).map((attribute) => (
                          <SelectItem key={attribute.id} value={attribute.id}>
                            {attribute.name} ({attribute.type})
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
                  control={editForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value*</FormLabel>
                      <FormControl>
                        <Input placeholder="red" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label*</FormLabel>
                      <FormControl>
                        <Input placeholder="Red" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Status</FormLabel>
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
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Update Option
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
        title="Delete Attribute Option Permanently"
        description={`Are you sure you want to permanently delete "${currentOption?.label}" option? This action cannot be undone and will remove all associated data from the database.`}
        loading={isDeleteLoading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {!canPerformAdminActions ? "Permission Denied" : "Delete Multiple Attribute Options"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!canPerformAdminActions 
                ? "You don't have permission to delete attribute options. Only authorized personnel can perform this action."
                : `Are you sure you want to permanently delete ${bulkDeleteOptionIds.length} attribute option(s)? This action cannot be undone and will remove all associated data from the database.`
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
                Delete {bulkDeleteOptionIds.length} Option(s)
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* General Alert Dialog */}
      <AlertComponent />
    </div>
  );
}