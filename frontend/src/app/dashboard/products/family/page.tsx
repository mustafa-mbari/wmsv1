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
  Users,
  Save,
  Edit,
  Trash2,
  XCircle,
  Tag,
  TrendingUp,
  Package,
  Layers,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedUserTable, UserData } from "@/components/ui/advanced-user-table";

export interface ProductFamily {
  id: number;
  name: string;
  code: string;
  description?: string;
  category_id?: number;
  category_name?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export default function ProductFamilyPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [families, setFamilies] = useState<ProductFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteFamilyIds, setBulkDeleteFamilyIds] = useState<string[]>([]);
  const [currentFamily, setCurrentFamily] = useState<ProductFamily | null>(null);

  // Mock categories data
  const [categories] = useState([
    { id: 1, name: "Electronics" },
    { id: 2, name: "Clothing" },
    { id: 3, name: "Food & Beverages" },
    { id: 4, name: "Books" },
  ]);

  const canAccessFamiliesPage = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('inventory-manager');
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  const familyFormSchema = z.object({
    name: z.string().min(1, "Family name is required"),
    code: z.string().min(1, "Family code is required"),
    description: z.string().optional(),
    categoryId: z.string().optional(),
    isActive: z.boolean().default(true),
  });

  useEffect(() => {
    if (canAccessFamiliesPage) {
      fetchFamilies();
    }
  }, [canAccessFamiliesPage]);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockFamilies: ProductFamily[] = [
        {
          id: 1,
          name: "Smartphones",
          code: "SMART",
          description: "Mobile phones and smart devices",
          category_id: 1,
          category_name: "Electronics",
          is_active: true,
          product_count: 25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Laptops",
          code: "LAPTOP",
          description: "Portable computers and notebooks",
          category_id: 1,
          category_name: "Electronics",
          is_active: true,
          product_count: 18,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Running Shoes",
          code: "RUNSHOE",
          description: "Athletic footwear for running",
          category_id: 2,
          category_name: "Clothing",
          is_active: true,
          product_count: 32,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 4,
          name: "Casual Shirts",
          code: "CASSHIRT",
          description: "Casual and dress shirts",
          category_id: 2,
          category_name: "Clothing",
          is_active: true,
          product_count: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 5,
          name: "Gaming Accessories",
          code: "GAMEACC",
          description: "Gaming peripherals and accessories",
          category_id: 1,
          category_name: "Electronics",
          is_active: false,
          product_count: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 6,
          name: "Organic Snacks",
          code: "ORGSNACK",
          description: "Healthy organic snack foods",
          category_id: 3,
          category_name: "Food & Beverages",
          is_active: true,
          product_count: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setFamilies(mockFamilies);
    } catch (error) {
      console.error("Error fetching families:", error);
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  const createForm = useForm<z.infer<typeof familyFormSchema>>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      categoryId: "",
      isActive: true,
    },
  });

  const editForm = useForm<z.infer<typeof familyFormSchema>>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      categoryId: "",
      isActive: true,
    },
  });

  const onCreateSubmit = async (data: z.infer<typeof familyFormSchema>) => {
    try {
      console.log("Creating family:", data);
      alert("Product family created successfully");
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchFamilies();
    } catch (error) {
      console.error("Error creating family:", error);
      alert("Failed to create product family");
    }
  };

  const onEditSubmit = async (data: z.infer<typeof familyFormSchema>) => {
    if (!currentFamily) return;
    
    try {
      console.log("Updating family:", data);
      alert("Product family updated successfully");
      setIsEditDialogOpen(false);
      fetchFamilies();
    } catch (error) {
      console.error("Error updating family:", error);
      alert("Failed to update product family");
    }
  };

  const confirmDelete = async () => {
    if (currentFamily) {
      try {
        setIsDeleteLoading(true);
        console.log("Deleting family:", currentFamily.id);
        setIsDeleteDialogOpen(false);
        setCurrentFamily(null);
        fetchFamilies();
      } catch (error) {
        console.error("Error deleting family:", error);
        alert("Failed to delete product family");
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
      console.log("Bulk deleting families:", bulkDeleteFamilyIds);
      setBulkDeleteDialogOpen(false);
      setBulkDeleteFamilyIds([]);
      fetchFamilies();
    } catch (error) {
      console.error("Error deleting families:", error);
      alert("Failed to delete some product families");
    }
  };

  const handleEdit = (family: ProductFamily) => {
    setCurrentFamily(family);
    editForm.reset({
      name: family.name,
      code: family.code,
      description: family.description || "",
      categoryId: family.category_id?.toString() || "",
      isActive: family.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (family: ProductFamily) => {
    setCurrentFamily(family);
    setIsDeleteDialogOpen(true);
  };

  // Transform families to UserData format for reusing the table
  const transformedFamilies: UserData[] = useMemo(() => {
    if (!families) return [];
    
    return families.map((family: ProductFamily) => ({
      id: String(family.id),
      username: family.code,
      email: family.name,
      first_name: family.category_name || "Uncategorized",
      last_name: family.product_count.toString(),
      phone: family.description || "",
      is_active: family.is_active,
      email_verified: family.product_count > 0,
      last_login_at: family.updated_at,
      created_at: family.created_at,
      role_names: [family.is_active ? "Active" : "Inactive"],
      role_slugs: [family.is_active ? "active" : "inactive"]
    }));
  }, [families]);

  const handleFamilySelection = (familyIds: string[]) => {
    console.log("Selected families:", familyIds);
  };

  const handleBulkAction = (action: string, familyIds: string[]) => {
    switch (action) {
      case "delete":
        if (canPerformAdminActions) {
          setBulkDeleteFamilyIds(familyIds);
          setBulkDeleteDialogOpen(true);
        }
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleFamilyEdit = (familyData: UserData) => {
    const familyFound = families?.find((f: ProductFamily) => f.id.toString() === familyData.id);
    if (familyFound) {
      handleEdit(familyFound);
    }
  };

  const handleFamilyDelete = (familyData: UserData) => {
    const familyFound = families?.find((f: ProductFamily) => f.id.toString() === familyData.id);
    if (familyFound) {
      setCurrentFamily(familyFound);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleFamilyView = (familyData: UserData) => {
    console.log("View family details:", familyData.email);
  };

  const handleFamilyToggleStatus = (familyData: UserData) => {
    console.log("Toggle status for family:", familyData.email);
  };

  const handleFamilyManageRoles = (familyData: UserData) => {
    console.log("Manage products in family:", familyData.email);
  };

  // Calculate stats
  const totalFamilies = families.length;
  const activeFamilies = families.filter(f => f.is_active).length;
  const familiesWithProducts = families.filter(f => f.product_count > 0).length;
  const totalProducts = families.reduce((sum, f) => sum + f.product_count, 0);

  if (!canAccessFamiliesPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Product Families page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Only authorized personnel can view product family information.
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
          <p className="text-muted-foreground">Loading product families...</p>
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
              Product Families
              {!canPerformAdminActions && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">(Read Only)</span>
              )}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {canPerformAdminActions 
                ? "Group related products into families for better organization" 
                : "View product family groupings (read-only access)"
              }
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={fetchFamilies} variant="outline" size="default">
              <RefreshCw className="mr-2 h-4 w-4" /> 
              Refresh
            </Button>
            {canPerformAdminActions && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add Family
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Product Family</DialogTitle>
                    <DialogDescription>
                      Add a new product family to group related products.
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
                              <FormLabel>Family Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="Family name" {...field} />
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
                              <FormLabel>Family Code*</FormLabel>
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
                              <Textarea placeholder="Family description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No specific category</SelectItem>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Associate this family with a specific category
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
                                Family is available for product assignment
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
                          <Layers className="mr-2 h-4 w-4" />
                          Create Family
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
                You have view-only access to product family information. To create, edit, or delete families, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Family Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Families</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalFamilies}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Layers className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Families</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeFamilies}</p>
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
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">With Products</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{familiesWithProducts}</p>
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

      {/* Main Families Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Product Family Directory</CardTitle>
              <CardDescription className="mt-1">
                Manage product families and their associated products
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {transformedFamilies.length} {transformedFamilies.length === 1 ? 'family' : 'families'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedUserTable
              data={transformedFamilies}
              loading={loading}
              onUserSelect={handleFamilySelection}
              onBulkAction={handleBulkAction}
              onUserEdit={handleFamilyEdit}
              onUserDelete={handleFamilyDelete}
              onUserView={handleFamilyView}
              onUserManageRoles={handleFamilyManageRoles}
              onUserToggleStatus={handleFamilyToggleStatus}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Family Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product Family</DialogTitle>
            <DialogDescription>
              Update family details and settings.
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
                      <FormLabel>Family Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Family name" {...field} />
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
                      <FormLabel>Family Code*</FormLabel>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Family description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No specific category</SelectItem>
                        {categories.map((category) => (
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
                        Family is available for product assignment
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
                  Update Family
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
        title="Delete Product Family Permanently"
        description={`Are you sure you want to permanently delete "${currentFamily?.name}" family? This action cannot be undone and will affect ${currentFamily?.product_count || 0} product(s) assigned to this family.`}
        loading={isDeleteLoading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {!canPerformAdminActions ? "Permission Denied" : "Delete Multiple Families"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!canPerformAdminActions 
                ? "You don't have permission to delete product families. Only authorized personnel can perform this action."
                : `Are you sure you want to permanently delete ${bulkDeleteFamilyIds.length} famil${bulkDeleteFamilyIds.length === 1 ? 'y' : 'ies'}? This action cannot be undone and may affect products assigned to these families.`
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
                Delete {bulkDeleteFamilyIds.length} Famil{bulkDeleteFamilyIds.length === 1 ? 'y' : 'ies'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}