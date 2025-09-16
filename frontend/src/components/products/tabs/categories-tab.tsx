"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  RefreshCw,
  FolderOpen,
  Save,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { useAlert } from "@/hooks/useAlert";

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

export function CategoriesTab() {
  const { isSuperAdmin, hasRole, isAdmin } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  const categoryFormSchema = z.object({
    name: z.string().min(1, "Category name is required"),
    slug: z.string().min(1, "Category slug is required"),
    description: z.string().optional(),
    parentId: z.string().optional(),
    isActive: z.boolean().default(true),
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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
      showAlert({
        title: "Error",
        description: error.response?.data?.message || "Failed to create category"
      });
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
      showAlert({
        title: "Error",
        description: error.response?.data?.message || "Failed to update category"
      });
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
        showAlert({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete category"
        });
      } finally {
        setIsDeleteLoading(false);
      }
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
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{category.name}</span>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      width: 150,
      render: (category) => (
        <span className="font-mono text-sm text-muted-foreground">{category.slug}</span>
      ),
    },
    {
      key: "parent_name",
      label: "Parent Category",
      width: 150,
      render: (category) => (
        <span className="text-muted-foreground">{category.parent_name || "Root"}</span>
      ),
    },
    {
      key: "level",
      label: "Level",
      width: 80,
      render: (category) => (
        <Badge variant="secondary">{category.level}</Badge>
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
      key: "subcategory_count",
      label: "Subcategories",
      width: 120,
      render: (category) => (
        <span className="font-medium">{category.subcategory_count}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 100,
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

  // Get parent categories for dropdown (exclude current category and its descendants)
  const availableParentCategories = categories.filter(cat =>
    cat.id !== currentCategory?.id && cat.level < 3
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
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

      {/* Main Categories Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedCategories}
            columns={columnConfig}
            loading={loading}
            title="Product Categories"
            onRowEdit={canPerformAdminActions ? handleCategoryEdit : undefined}
            onRowDelete={canPerformAdminActions ? handleCategoryDelete : undefined}
            actions={{
              edit: canPerformAdminActions ? { label: "Edit Category" } : undefined,
              delete: canPerformAdminActions ? { label: "Delete Category" } : undefined,
            }}
            emptyMessage="No categories found"
            refreshButton={
              <Button onClick={fetchCategories} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            }
            addButton={
              canPerformAdminActions ? (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                      <DialogDescription>
                        Fill in the details to create a new product category.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...createForm}>
                      <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
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
                              <FormLabel>Slug*</FormLabel>
                              <FormControl>
                                <Input placeholder="category-slug" {...field} />
                              </FormControl>
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
                              <Select onValueChange={field.onChange} value={field.value || "none"}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select parent category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">No Parent (Root Category)</SelectItem>
                                  {availableParentCategories.map((category) => (
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
                          control={createForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Active Status</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Enable this category for use
                                </div>
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
              ) : undefined
            }
          />
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
                    <FormLabel>Slug*</FormLabel>
                    <FormControl>
                      <Input placeholder="category-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Parent (Root Category)</SelectItem>
                        {availableParentCategories.map((category) => (
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
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this category for use
                      </div>
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
        description={`Are you sure you want to permanently delete "${currentCategory?.name}"? This action cannot be undone and will remove all associated data from the database.`}
        loading={isDeleteLoading}
      />

      {/* General Alert Dialog */}
      <AlertComponent />
    </div>
  );
}