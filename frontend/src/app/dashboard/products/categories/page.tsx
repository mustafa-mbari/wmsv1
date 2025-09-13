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
  FolderOpen,
  Save,
  Edit,
  Trash2,
  XCircle,
  Tag,
  TrendingUp,
  Package,
  Copy,
  Download,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  parent_name?: string;
  level: number;
  is_active: boolean;
  product_count: number;
  subcategory_count: number;
  created_at: string;
  updated_at: string;
}

export default function CategoriesPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteCategoryIds, setBulkDeleteCategoryIds] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const canAccessCategoriesPage = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('inventory-manager');
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  const categoryFormSchema = z.object({
    name: z.string().min(1, "Category name is required"),
    slug: z.string().min(1, "Category slug is required"),
    description: z.string().optional(),
    parentId: z.string().optional(),
    isActive: z.boolean().default(true),
  });

  useEffect(() => {
    if (canAccessCategoriesPage) {
      fetchCategories();
    }
  }, [canAccessCategoriesPage]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/categories');
      
      if (response.data?.success) {
        const apiCategories = response.data.data.map((category: any) => ({
          id: parseInt(category.id),
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent_id: category.parent_id ? parseInt(category.parent_id) : undefined,
          parent_name: category.parent_name,
          level: category.level,
          is_active: category.is_active,
          product_count: category.product_count,
          subcategory_count: category.subcategory_count,
          created_at: category.created_at,
          updated_at: category.updated_at,
        }));
        setCategories(apiCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const createForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: "none",
      isActive: true,
    },
  });

  const editForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: "none",
      isActive: true,
    },
  });

  const onCreateSubmit = async (data: z.infer<typeof categoryFormSchema>) => {
    try {
      const categoryData = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parent_id: data.parentId === "none" ? null : data.parentId || null,
        is_active: data.isActive,
      };

      const response = await apiClient.post('/api/categories', categoryData);
      
      if (response.data?.success) {
        setIsCreateDialogOpen(false);
        createForm.reset();
        fetchCategories();
      } else {
        throw new Error(response.data?.message || "Failed to create category");
      }
    } catch (error: any) {
      console.error("Error creating category:", error);
      alert(error.response?.data?.message || "Failed to create category");
    }
  };

  const onEditSubmit = async (data: z.infer<typeof categoryFormSchema>) => {
    if (!currentCategory) return;
    
    try {
      const categoryData = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parent_id: data.parentId === "none" ? null : data.parentId || null,
        is_active: data.isActive,
      };

      const response = await apiClient.put(`/api/categories/${currentCategory.id}`, categoryData);
      
      if (response.data?.success) {
        setIsEditDialogOpen(false);
        setCurrentCategory(null);
        fetchCategories();
      } else {
        throw new Error(response.data?.message || "Failed to update category");
      }
    } catch (error: any) {
      console.error("Error updating category:", error);
      alert(error.response?.data?.message || "Failed to update category");
    }
  };

  const confirmDelete = async () => {
    if (currentCategory) {
      try {
        setIsDeleteLoading(true);
        const response = await apiClient.delete(`/api/categories/${currentCategory.id}`);
        
        if (response.data?.success) {
          setIsDeleteDialogOpen(false);
          setCurrentCategory(null);
          fetchCategories();
        } else {
          throw new Error(response.data?.message || "Failed to delete category");
        }
      } catch (error: any) {
        console.error("Error deleting category:", error);
        alert(error.response?.data?.message || "Failed to delete category");
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
      await Promise.all(
        bulkDeleteCategoryIds.map(categoryId => 
          apiClient.delete(`/api/categories/${categoryId}`)
        )
      );
      setBulkDeleteDialogOpen(false);
      setBulkDeleteCategoryIds([]);
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting categories:", error);
      alert("Failed to delete some categories");
    }
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    editForm.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parent_id?.toString() || "none",
      isActive: category.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Transform categories to TableData format for the table
  const transformedCategories: (Category & TableData)[] = useMemo(() => {
    if (!categories) return [];
    
    return categories.map((category: Category) => ({
      ...category,
      id: String(category.id),
    }));
  }, [categories]);

  // Define column configuration for the table
  const columnConfig: ColumnConfig<Category & TableData>[] = [
    {
      key: "name",
      label: "Category Name",
      width: 200,
      render: (category) => (
        <div className="font-medium">{category.name}</div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      width: 150,
      render: (category) => (
        <span className="font-mono text-sm">{category.slug}</span>
      ),
    },
    {
      key: "parent_name",
      label: "Parent Category",
      width: 150,
      filterType: "select",
      render: (category) => (
        <Badge variant="outline">{category.parent_name || "Root"}</Badge>
      ),
    },
    {
      key: "level",
      label: "Level",
      width: 100,
      filterType: "select",
      render: (category) => (
        <Badge variant="secondary">Level {category.level}</Badge>
      ),
    },
    {
      key: "subcategory_count",
      label: "Subcategories",
      width: 120,
      render: (category) => (
        <span className="text-muted-foreground">
          {category.subcategory_count > 0 ? `${category.subcategory_count} children` : "No children"}
        </span>
      ),
    },
    {
      key: "product_count",
      label: "Products",
      width: 100,
      render: (category) => (
        <span className="font-medium">{category.product_count}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 120,
      filterType: "select",
      render: (category) => (
        <Badge variant={category.is_active ? "default" : "secondary"}>
          {category.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      width: 130,
      render: (category) => (
        <span className="text-muted-foreground">
          {new Date(category.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  const handleCategorySelection = (categoryIds: string[]) => {
    console.log("Selected categories:", categoryIds);
  };

  const handleBulkAction = (action: string, categoryIds: string[]) => {
    switch (action) {
      case "delete":
        if (canPerformAdminActions) {
          setBulkDeleteCategoryIds(categoryIds);
          setBulkDeleteDialogOpen(true);
        }
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleCategoryEdit = (category: Category & TableData) => {
    const categoryFound = categories?.find((c: Category) => c.id.toString() === category.id);
    if (categoryFound) {
      handleEdit(categoryFound);
    }
  };

  const handleCategoryDelete = (category: Category & TableData) => {
    const categoryFound = categories?.find((c: Category) => c.id.toString() === category.id);
    if (categoryFound) {
      setCurrentCategory(categoryFound);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleCategoryView = (category: Category & TableData) => {
    console.log("View category details:", category.name);
  };

  // Get parent categories for dropdown
  const parentCategories = categories.filter(c => c.level === 1);

  // Calculate stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.is_active).length;
  const parentCategoriesCount = categories.filter(c => c.level === 1).length;
  const totalProducts = categories.reduce((sum, c) => sum + c.product_count, 0);

  if (!canAccessCategoriesPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Categories page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Only authorized personnel can view category information.
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
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-medium text-muted-foreground">
              Products / Categories
              {!canPerformAdminActions && (
                <span className="ml-2 text-sm">(Read Only)</span>
              )}
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={fetchCategories} variant="outline" size="default">
              <RefreshCw className="mr-2 h-4 w-4" /> 
              Refresh
            </Button>
            {canPerformAdminActions && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                      Add a new product category to organize your inventory.
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
                              <FormLabel>Category Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="Category name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category Slug*</FormLabel>
                              <FormControl>
                                <Input placeholder="category-slug" {...field} />
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
                              <Textarea placeholder="Category description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="parentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select parent category (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">None (Root Category)</SelectItem>
                                {parentCategories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Leave empty to create a root category
                            </FormDescription>
                            <FormMessage />
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
                                Category is available for product assignment
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
                          <FolderOpen className="mr-2 h-4 w-4" />
                          Create Category
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
                You have view-only access to category information. To create, edit, or delete categories, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Categories</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalCategories}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Categories</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeCategories}</p>
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
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Parent Categories</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{parentCategoriesCount}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
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

      {/* Main Categories Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedTable
              data={transformedCategories}
              columns={columnConfig}
              loading={loading}
              title="Category Directory"
              onRowSelect={handleCategorySelection}
              onBulkAction={handleBulkAction}
              onRowEdit={canPerformAdminActions ? handleCategoryEdit : undefined}
              onRowDelete={canPerformAdminActions ? handleCategoryDelete : undefined}
              onRowView={handleCategoryView}
              actions={{
                view: { label: "View Details" },
                edit: canPerformAdminActions ? { label: "Edit Category" } : undefined,
                delete: canPerformAdminActions ? { label: "Delete Category" } : undefined,
              }}
              bulkActions={canPerformAdminActions ? undefined : [
                { label: "Copy", action: "copy", icon: <Copy className="h-4 w-4 mr-2" /> },
                { label: "Export", action: "export", icon: <Download className="h-4 w-4 mr-2" /> },
              ]}
              emptyMessage="No categories found"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category details and settings.
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
                      <FormLabel>Category Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Slug*</FormLabel>
                      <FormControl>
                        <Input placeholder="category-slug" {...field} />
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
                      <Textarea placeholder="Category description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Root Category)</SelectItem>
                        {parentCategories
                          .filter(c => c.id !== currentCategory?.id) // Don't allow self as parent
                          .map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
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
                        Category is available for product assignment
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
                  Update Category
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
        title="Delete Category Permanently"
        description={`Are you sure you want to permanently delete "${currentCategory?.name}" category? This action cannot be undone and will affect ${currentCategory?.product_count || 0} product(s) assigned to this category.`}
        loading={isDeleteLoading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {!canPerformAdminActions ? "Permission Denied" : "Delete Multiple Categories"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!canPerformAdminActions 
                ? "You don't have permission to delete categories. Only authorized personnel can perform this action."
                : `Are you sure you want to permanently delete ${bulkDeleteCategoryIds.length} categor${bulkDeleteCategoryIds.length === 1 ? 'y' : 'ies'}? This action cannot be undone and may affect products assigned to these categories.`
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
                Delete {bulkDeleteCategoryIds.length} Categor{bulkDeleteCategoryIds.length === 1 ? 'y' : 'ies'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}