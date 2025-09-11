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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  RefreshCw,
  Award,
  Save,
  Edit,
  Trash2,
  XCircle,
  Tag,
  TrendingUp,
  Package,
  Star,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedUserTable, UserData } from "@/components/ui/advanced-user-table";

export interface Brand {
  id: number;
  name: string;
  code: string;
  description?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export default function BrandsPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteBrandIds, setBulkDeleteBrandIds] = useState<string[]>([]);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);

  const canAccessBrandsPage = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('inventory-manager');
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  const brandFormSchema = z.object({
    name: z.string().min(1, "Brand name is required"),
    code: z.string().min(1, "Brand code is required"),
    description: z.string().optional(),
    website: z.string().url("Invalid URL format").optional().or(z.literal("")),
    logoUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
    isActive: z.boolean().default(true),
  });

  useEffect(() => {
    if (canAccessBrandsPage) {
      fetchBrands();
    }
  }, [canAccessBrandsPage]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockBrands: Brand[] = [
        {
          id: 1,
          name: "Apple",
          code: "APPLE",
          description: "Technology company known for innovative products",
          website: "https://www.apple.com",
          logo_url: "https://logo.clearbit.com/apple.com",
          is_active: true,
          product_count: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Samsung",
          code: "SAMSUNG",
          description: "Global technology and electronics manufacturer",
          website: "https://www.samsung.com",
          logo_url: "https://logo.clearbit.com/samsung.com",
          is_active: true,
          product_count: 38,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Nike",
          code: "NIKE",
          description: "Athletic footwear and apparel company",
          website: "https://www.nike.com",
          logo_url: "https://logo.clearbit.com/nike.com",
          is_active: true,
          product_count: 67,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 4,
          name: "Adidas",
          code: "ADIDAS",
          description: "German athletic apparel and footwear brand",
          website: "https://www.adidas.com",
          logo_url: "https://logo.clearbit.com/adidas.com",
          is_active: true,
          product_count: 52,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 5,
          name: "Sony",
          code: "SONY",
          description: "Japanese electronics and entertainment company",
          website: "https://www.sony.com",
          logo_url: "https://logo.clearbit.com/sony.com",
          is_active: false,
          product_count: 23,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 6,
          name: "Generic Brand",
          code: "GENERIC",
          description: "Unbranded or generic products",
          is_active: true,
          product_count: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setBrands(mockBrands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const createForm = useForm<z.infer<typeof brandFormSchema>>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      website: "",
      logoUrl: "",
      isActive: true,
    },
  });

  const editForm = useForm<z.infer<typeof brandFormSchema>>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      website: "",
      logoUrl: "",
      isActive: true,
    },
  });

  const onCreateSubmit = async (data: z.infer<typeof brandFormSchema>) => {
    try {
      console.log("Creating brand:", data);
      alert("Brand created successfully");
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchBrands();
    } catch (error) {
      console.error("Error creating brand:", error);
      alert("Failed to create brand");
    }
  };

  const onEditSubmit = async (data: z.infer<typeof brandFormSchema>) => {
    if (!currentBrand) return;
    
    try {
      console.log("Updating brand:", data);
      alert("Brand updated successfully");
      setIsEditDialogOpen(false);
      fetchBrands();
    } catch (error) {
      console.error("Error updating brand:", error);
      alert("Failed to update brand");
    }
  };

  const confirmDelete = async () => {
    if (currentBrand) {
      try {
        setIsDeleteLoading(true);
        console.log("Deleting brand:", currentBrand.id);
        setIsDeleteDialogOpen(false);
        setCurrentBrand(null);
        fetchBrands();
      } catch (error) {
        console.error("Error deleting brand:", error);
        alert("Failed to delete brand");
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
      console.log("Bulk deleting brands:", bulkDeleteBrandIds);
      setBulkDeleteDialogOpen(false);
      setBulkDeleteBrandIds([]);
      fetchBrands();
    } catch (error) {
      console.error("Error deleting brands:", error);
      alert("Failed to delete some brands");
    }
  };

  const handleEdit = (brand: Brand) => {
    setCurrentBrand(brand);
    editForm.reset({
      name: brand.name,
      code: brand.code,
      description: brand.description || "",
      website: brand.website || "",
      logoUrl: brand.logo_url || "",
      isActive: brand.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  // Transform brands to UserData format for reusing the table
  const transformedBrands: UserData[] = useMemo(() => {
    if (!brands) return [];
    
    return brands.map((brand: Brand) => ({
      id: String(brand.id),
      username: brand.code,
      email: brand.name,
      first_name: brand.website ? "With Website" : "No Website",
      last_name: brand.product_count.toString(),
      phone: brand.description || "",
      is_active: brand.is_active,
      email_verified: brand.product_count > 0,
      last_login_at: brand.updated_at,
      created_at: brand.created_at,
      role_names: [brand.is_active ? "Active" : "Inactive"],
      role_slugs: [brand.is_active ? "active" : "inactive"]
    }));
  }, [brands]);

  const handleBrandSelection = (brandIds: string[]) => {
    console.log("Selected brands:", brandIds);
  };

  const handleBulkAction = (action: string, brandIds: string[]) => {
    switch (action) {
      case "delete":
        if (canPerformAdminActions) {
          setBulkDeleteBrandIds(brandIds);
          setBulkDeleteDialogOpen(true);
        }
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleBrandEdit = (brandData: UserData) => {
    const brandFound = brands?.find((b: Brand) => b.id.toString() === brandData.id);
    if (brandFound) {
      handleEdit(brandFound);
    }
  };

  const handleBrandDelete = (brandData: UserData) => {
    const brandFound = brands?.find((b: Brand) => b.id.toString() === brandData.id);
    if (brandFound) {
      setCurrentBrand(brandFound);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleBrandView = (brandData: UserData) => {
    console.log("View brand details:", brandData.email);
  };

  const handleBrandToggleStatus = (brandData: UserData) => {
    console.log("Toggle status for brand:", brandData.email);
  };

  const handleBrandManageRoles = (brandData: UserData) => {
    console.log("Manage products for brand:", brandData.email);
  };

  // Calculate stats
  const totalBrands = brands.length;
  const activeBrands = brands.filter(b => b.is_active).length;
  const brandsWithWebsite = brands.filter(b => b.website).length;
  const totalProducts = brands.reduce((sum, b) => sum + b.product_count, 0);

  if (!canAccessBrandsPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Brands page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Only authorized personnel can view brand information.
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
          <p className="text-muted-foreground">Loading brands...</p>
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
              Product Brands
              {!canPerformAdminActions && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">(Read Only)</span>
              )}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {canPerformAdminActions 
                ? "Manage product brands and manufacturer information" 
                : "View product brand information (read-only access)"
              }
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={fetchBrands} variant="outline" size="default">
              <RefreshCw className="mr-2 h-4 w-4" /> 
              Refresh
            </Button>
            {canPerformAdminActions && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add Brand
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Brand</DialogTitle>
                    <DialogDescription>
                      Add a new brand for product organization.
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
                              <FormLabel>Brand Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="Brand name" {...field} />
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
                              <FormLabel>Brand Code*</FormLabel>
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
                              <Textarea placeholder="Brand description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Brand's official website URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/logo.png" {...field} />
                            </FormControl>
                            <FormDescription>
                              URL to the brand's logo image
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
                                Brand is available for product assignment
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
                          <Award className="mr-2 h-4 w-4" />
                          Create Brand
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
                You have view-only access to brand information. To create, edit, or delete brands, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Brand Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Brands</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalBrands}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Brands</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeBrands}</p>
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
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">With Website</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{brandsWithWebsite}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
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

      {/* Main Brands Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Brand Directory</CardTitle>
              <CardDescription className="mt-1">
                Manage product brands and manufacturer information
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {transformedBrands.length} {transformedBrands.length === 1 ? 'brand' : 'brands'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedUserTable
              data={transformedBrands}
              loading={loading}
              onUserSelect={handleBrandSelection}
              onBulkAction={handleBulkAction}
              onUserEdit={handleBrandEdit}
              onUserDelete={handleBrandDelete}
              onUserView={handleBrandView}
              onUserManageRoles={handleBrandManageRoles}
              onUserToggleStatus={handleBrandToggleStatus}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Update brand details and information.
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
                      <FormLabel>Brand Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Brand name" {...field} />
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
                      <FormLabel>Brand Code*</FormLabel>
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
                      <Textarea placeholder="Brand description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
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
                        Brand is available for product assignment
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
                  Update Brand
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
        title="Delete Brand Permanently"
        description={`Are you sure you want to permanently delete "${currentBrand?.name}" brand? This action cannot be undone and will affect ${currentBrand?.product_count || 0} product(s) assigned to this brand.`}
        loading={isDeleteLoading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {!canPerformAdminActions ? "Permission Denied" : "Delete Multiple Brands"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!canPerformAdminActions 
                ? "You don't have permission to delete brands. Only authorized personnel can perform this action."
                : `Are you sure you want to permanently delete ${bulkDeleteBrandIds.length} brand${bulkDeleteBrandIds.length === 1 ? '' : 's'}? This action cannot be undone and may affect products assigned to these brands.`
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
                Delete {bulkDeleteBrandIds.length} Brand{bulkDeleteBrandIds.length === 1 ? '' : 's'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}