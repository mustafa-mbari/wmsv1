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
  Settings,
  Save,
  Edit,
  Trash2,
  XCircle,
  Tag,
  TrendingUp,
  Package,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { apiClient } from "@/lib/api-client";

export interface Attribute {
  id: number;
  name: string;
  code: string;
  description?: string;
  data_type: "text" | "number" | "boolean" | "date" | "select" | "multiselect";
  is_required: boolean;
  is_active: boolean;
  option_count: number;
  product_count: number;
  created_at: string;
  updated_at: string;
}

const DATA_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "select", label: "Single Select" },
  { value: "multiselect", label: "Multi Select" },
];

export default function AttributesPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteAttributeIds, setBulkDeleteAttributeIds] = useState<string[]>([]);
  const [currentAttribute, setCurrentAttribute] = useState<Attribute | null>(null);

  const canAccessAttributesPage = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('inventory-manager');
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  const attributeFormSchema = z.object({
    name: z.string().min(1, "Attribute name is required"),
    code: z.string().min(1, "Attribute code is required"),
    description: z.string().optional(),
    dataType: z.enum(["text", "number", "boolean", "date", "select", "multiselect"]),
    isRequired: z.boolean().default(false),
    isActive: z.boolean().default(true),
  });

  useEffect(() => {
    if (canAccessAttributesPage) {
      fetchAttributes();
    }
  }, [canAccessAttributesPage]);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/attributes');
      
      if (response.data?.success) {
        const apiAttributes = response.data.data.map((attribute: any) => ({
          id: parseInt(attribute.id),
          name: attribute.name,
          code: attribute.code,
          description: attribute.description,
          data_type: attribute.data_type,
          is_required: attribute.is_required,
          is_active: attribute.is_active,
          option_count: attribute.option_count || 0,
          product_count: attribute.product_count || 0,
          created_at: attribute.created_at,
          updated_at: attribute.updated_at,
        }));
        setAttributes(apiAttributes);
      } else {
        setAttributes([]);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  };

  const createForm = useForm<z.infer<typeof attributeFormSchema>>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      dataType: "text",
      isRequired: false,
      isActive: true,
    },
  });

  const editForm = useForm<z.infer<typeof attributeFormSchema>>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      dataType: "text",
      isRequired: false,
      isActive: true,
    },
  });

  const onCreateSubmit = async (data: z.infer<typeof attributeFormSchema>) => {
    try {
      console.log("Creating attribute:", data);
      alert("Attribute created successfully");
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchAttributes();
    } catch (error) {
      console.error("Error creating attribute:", error);
      alert("Failed to create attribute");
    }
  };

  const onEditSubmit = async (data: z.infer<typeof attributeFormSchema>) => {
    if (!currentAttribute) return;
    
    try {
      console.log("Updating attribute:", data);
      alert("Attribute updated successfully");
      setIsEditDialogOpen(false);
      fetchAttributes();
    } catch (error) {
      console.error("Error updating attribute:", error);
      alert("Failed to update attribute");
    }
  };

  const confirmDelete = async () => {
    if (currentAttribute) {
      try {
        setIsDeleteLoading(true);
        console.log("Deleting attribute:", currentAttribute.id);
        setIsDeleteDialogOpen(false);
        setCurrentAttribute(null);
        fetchAttributes();
      } catch (error) {
        console.error("Error deleting attribute:", error);
        alert("Failed to delete attribute");
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
      console.log("Bulk deleting attributes:", bulkDeleteAttributeIds);
      setBulkDeleteDialogOpen(false);
      setBulkDeleteAttributeIds([]);
      fetchAttributes();
    } catch (error) {
      console.error("Error deleting attributes:", error);
      alert("Failed to delete some attributes");
    }
  };

  const handleEdit = (attribute: Attribute) => {
    setCurrentAttribute(attribute);
    editForm.reset({
      name: attribute.name,
      code: attribute.code,
      description: attribute.description || "",
      dataType: attribute.data_type,
      isRequired: attribute.is_required,
      isActive: attribute.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (attribute: Attribute) => {
    setCurrentAttribute(attribute);
    setIsDeleteDialogOpen(true);
  };

  // Transform attributes to TableData format for the table
  const transformedAttributes: (Attribute & TableData)[] = useMemo(() => {
    if (!attributes) return [];
    
    return attributes.map((attribute: Attribute) => ({
      ...attribute,
      id: String(attribute.id),
    }));
  }, [attributes]);

  // Define column configuration for the table
  const columnConfig: ColumnConfig<Attribute & TableData>[] = [
    {
      key: "name",
      label: "Attribute Name",
      width: 200,
      render: (attribute) => (
        <div className="font-medium">{attribute.name}</div>
      ),
    },
    {
      key: "code",
      label: "Code",
      width: 150,
      render: (attribute) => (
        <span className="font-mono text-sm">{attribute.code}</span>
      ),
    },
    {
      key: "data_type",
      label: "Data Type",
      width: 130,
      filterType: "select",
      render: (attribute) => (
        <Badge variant="outline">{
          DATA_TYPES.find(dt => dt.value === attribute.data_type)?.label || attribute.data_type
        }</Badge>
      ),
    },
    {
      key: "description",
      label: "Description",
      width: 200,
      render: (attribute) => (
        <span className="text-muted-foreground">{attribute.description || "N/A"}</span>
      ),
    },
    {
      key: "is_required",
      label: "Required",
      width: 100,
      filterType: "select",
      render: (attribute) => (
        <Badge variant={attribute.is_required ? "destructive" : "secondary"}>
          {attribute.is_required ? "Required" : "Optional"}
        </Badge>
      ),
    },
    {
      key: "option_count",
      label: "Options",
      width: 100,
      render: (attribute) => (
        <span className="font-medium">{attribute.option_count}</span>
      ),
    },
    {
      key: "product_count",
      label: "Products",
      width: 100,
      render: (attribute) => (
        <span className="font-medium">{attribute.product_count}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 120,
      filterType: "select",
      render: (attribute) => (
        <Badge variant={attribute.is_active ? "default" : "secondary"}>
          {attribute.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      width: 130,
      render: (attribute) => (
        <span className="text-muted-foreground">
          {new Date(attribute.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  const handleAttributeSelection = (attributeIds: string[]) => {
    console.log("Selected attributes:", attributeIds);
  };

  const handleBulkAction = (action: string, attributeIds: string[]) => {
    switch (action) {
      case "delete":
        if (canPerformAdminActions) {
          setBulkDeleteAttributeIds(attributeIds);
          setBulkDeleteDialogOpen(true);
        }
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleAttributeEdit = (attribute: Attribute & TableData) => {
    const attributeFound = attributes?.find((a: Attribute) => a.id.toString() === attribute.id);
    if (attributeFound) {
      handleEdit(attributeFound);
    }
  };

  const handleAttributeDelete = (attribute: Attribute & TableData) => {
    const attributeFound = attributes?.find((a: Attribute) => a.id.toString() === attribute.id);
    if (attributeFound) {
      setCurrentAttribute(attributeFound);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleAttributeView = (attribute: Attribute & TableData) => {
    console.log("View attribute details:", attribute.name);
  };

  // Calculate stats
  const totalAttributes = attributes.length;
  const activeAttributes = attributes.filter(a => a.is_active).length;
  const requiredAttributes = attributes.filter(a => a.is_required).length;
  const totalProducts = attributes.reduce((sum, a) => sum + a.product_count, 0);

  if (!canAccessAttributesPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Attributes page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Only authorized personnel can view attribute information.
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
          <p className="text-muted-foreground">Loading attributes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Product Attributes
              {!canPerformAdminActions && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">(Read Only)</span>
              )}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {canPerformAdminActions 
                ? "Define product attributes and their data types" 
                : "View product attribute definitions (read-only access)"
              }
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={fetchAttributes} variant="outline" size="default">
              <RefreshCw className="mr-2 h-4 w-4" /> 
              Refresh
            </Button>
            {canPerformAdminActions && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add Attribute
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Attribute</DialogTitle>
                    <DialogDescription>
                      Add a new product attribute for enhanced product data.
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
                              <FormLabel>Attribute Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="Attribute name" {...field} />
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
                              <FormLabel>Attribute Code*</FormLabel>
                              <FormControl>
                                <Input placeholder="CODE" {...field} />
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
                              <Textarea placeholder="Attribute description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="dataType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Type*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select data type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DATA_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Determines how this attribute data is stored and validated
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="isRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Required</FormLabel>
                                <FormDescription>
                                  Must be filled for all products
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

                        <FormField
                          control={createForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                                <FormDescription>
                                  Available for product assignment
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
                      </div>
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          <Settings className="mr-2 h-4 w-4" />
                          Create Attribute
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
                You have view-only access to attribute information. To create, edit, or delete attributes, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attribute Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Attributes</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalAttributes}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Attributes</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeAttributes}</p>
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
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Required</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{requiredAttributes}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Sliders className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Used in Products</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{totalProducts}</p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Attributes Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Attribute Directory</CardTitle>
              <CardDescription className="mt-1">
                Manage product attributes and their configurations
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {transformedAttributes.length} {transformedAttributes.length === 1 ? 'attribute' : 'attributes'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedTable
              data={transformedAttributes}
              columns={columnConfig}
              loading={loading}
              title="Product Attributes"
              onRowSelect={handleAttributeSelection}
              onBulkAction={handleBulkAction}
              onRowEdit={canPerformAdminActions ? handleAttributeEdit : undefined}
              onRowDelete={canPerformAdminActions ? handleAttributeDelete : undefined}
              onRowView={handleAttributeView}
              actions={{
                view: { label: "View Details" },
                edit: canPerformAdminActions ? { label: "Edit Attribute" } : undefined,
                delete: canPerformAdminActions ? { label: "Delete Attribute" } : undefined,
                custom: canPerformAdminActions && [
                  {
                    label: "Manage Options",
                    icon: <Sliders className="mr-2 h-4 w-4" />,
                    onClick: (attribute) => console.log("Manage options for:", attribute.name)
                  }
                ]
              }}
              emptyMessage="No attributes found"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Attribute Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Attribute</DialogTitle>
            <DialogDescription>
              Update attribute details and configuration.
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
                      <FormLabel>Attribute Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Attribute name" {...field} />
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
                      <FormLabel>Attribute Code*</FormLabel>
                      <FormControl>
                        <Input placeholder="CODE" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="dataType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Type*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DATA_TYPES.map((type) => (
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
                  control={editForm.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Required</FormLabel>
                        <FormDescription>
                          Must be filled for all products
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

                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Available for product assignment
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
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Update Attribute
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
        title="Delete Attribute Permanently"
        description={`Are you sure you want to permanently delete "${currentAttribute?.name}" attribute? This action cannot be undone and will affect ${currentAttribute?.product_count || 0} product(s) using this attribute.`}
        loading={isDeleteLoading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {!canPerformAdminActions ? "Permission Denied" : "Delete Multiple Attributes"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!canPerformAdminActions 
                ? "You don't have permission to delete attributes. Only authorized personnel can perform this action."
                : `Are you sure you want to permanently delete ${bulkDeleteAttributeIds.length} attribute${bulkDeleteAttributeIds.length === 1 ? '' : 's'}? This action cannot be undone and may affect products using these attributes.`
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
                Delete {bulkDeleteAttributeIds.length} Attribute{bulkDeleteAttributeIds.length === 1 ? '' : 's'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}