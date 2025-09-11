"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Package,
  Save,
  Edit,
  Trash2,
  XCircle,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedProductTable, ProductData } from "@/components/ui/advanced-product-table";

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  category_id: number;
  category_name?: string;
  family_id?: number;
  family_name?: string;
  unit_id: number;
  unit_name?: string;
  price: number;
  cost: number;
  quantity: number;
  min_quantity?: number;
  max_quantity?: number;
  status: "active" | "inactive" | "discontinued";
  barcode?: string;
  weight?: number;
  dimensions?: string;
  created_at: string;
  updated_at: string;
}

export default function ProductsPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteProductIds, setBulkDeleteProductIds] = useState<string[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Dropdown data from APIs
  const [categories, setCategories] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const canAccessProductsPage = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('inventory-manager');
  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  const productFormSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    description: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    familyId: z.string().optional(),
    unitId: z.string().min(1, "Unit is required"),
    price: z.number().min(0, "Price must be positive"),
    cost: z.number().min(0, "Cost must be positive"),
    quantity: z.number().min(0, "Quantity must be positive"),
    minQuantity: z.number().min(0, "Min quantity must be positive").optional(),
    maxQuantity: z.number().min(0, "Max quantity must be positive").optional(),
    status: z.enum(["active", "inactive", "discontinued"]).default("active"),
    barcode: z.string().optional(),
    weight: z.number().min(0, "Weight must be positive").optional(),
    dimensions: z.string().optional(),
  });

  useEffect(() => {
    if (canAccessProductsPage) {
      fetchProducts();
      fetchDropdownData();
    }
  }, [canAccessProductsPage]);

  const fetchDropdownData = async () => {
    try {
      const [categoriesResponse, familiesResponse, unitsResponse] = await Promise.all([
        apiClient.get('/api/categories'),
        apiClient.get('/api/families'),
        apiClient.get('/api/units')
      ]);

      if (categoriesResponse.data?.success) {
        setCategories(categoriesResponse.data.data);
      }
      if (familiesResponse.data?.success) {
        setFamilies(familiesResponse.data.data);
      }
      if (unitsResponse.data?.success) {
        setUnits(unitsResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/products');
      
      if (response.data?.success) {
        const apiProducts = response.data.data.map((product: any) => ({
          id: parseInt(product.id),
          name: product.name,
          sku: product.sku,
          description: product.description,
          category_id: parseInt(product.category_id) || 0,
          category_name: product.category_name,
          family_id: product.family_id ? parseInt(product.family_id) : undefined,
          family_name: product.family_name,
          unit_id: parseInt(product.unit_id) || 0,
          unit_name: product.unit_name,
          price: parseFloat(product.price) || 0,
          cost: parseFloat(product.cost) || 0,
          quantity: parseInt(product.stock_quantity) || 0,
          min_quantity: parseInt(product.min_stock_level) || 0,
          max_quantity: undefined,
          status: product.status as "active" | "inactive" | "discontinued",
          barcode: product.barcode,
          weight: product.weight ? parseFloat(product.weight) : undefined,
          dimensions: `${product.length || 0} x ${product.width || 0} x ${product.height || 0}`,
          created_at: product.created_at,
          updated_at: product.updated_at,
        }));
        setProducts(apiProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const createForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      categoryId: "",
      familyId: "none",
      unitId: "",
      price: 0,
      cost: 0,
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      status: "active",
      barcode: "",
      weight: 0,
      dimensions: "",
    },
  });

  const editForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      categoryId: "",
      familyId: "none",
      unitId: "",
      price: 0,
      cost: 0,
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      status: "active",
      barcode: "",
      weight: 0,
      dimensions: "",
    },
  });

  const onCreateSubmit = async (data: z.infer<typeof productFormSchema>) => {
    try {
      const productData = {
        name: data.name,
        sku: data.sku,
        description: data.description || null,
        category_id: data.categoryId,
        family_id: data.familyId === "none" ? null : data.familyId || null,
        unit_id: data.unitId,
        price: data.price,
        cost: data.cost,
        stock_quantity: data.quantity,
        min_stock_level: data.minQuantity || 0,
        status: data.status,
        barcode: data.barcode || null,
        weight: data.weight || null,
        is_digital: false,
        track_stock: true
      };

      const response = await apiClient.post('/api/products', productData);
      
      if (response.data?.success) {
        setIsCreateDialogOpen(false);
        createForm.reset();
        fetchProducts();
      } else {
        throw new Error(response.data?.message || "Failed to create product");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      alert(error.response?.data?.message || "Failed to create product");
    }
  };

  const onEditSubmit = async (data: z.infer<typeof productFormSchema>) => {
    if (!currentProduct) return;
    
    try {
      const productData = {
        name: data.name,
        sku: data.sku,
        description: data.description || null,
        category_id: data.categoryId,
        family_id: data.familyId === "none" ? null : data.familyId || null,
        unit_id: data.unitId,
        price: data.price,
        cost: data.cost,
        stock_quantity: data.quantity,
        min_stock_level: data.minQuantity || 0,
        status: data.status,
        barcode: data.barcode || null,
        weight: data.weight || null
      };

      const response = await apiClient.put(`/api/products/${currentProduct.id}`, productData);
      
      if (response.data?.success) {
        setIsEditDialogOpen(false);
        setCurrentProduct(null);
        fetchProducts();
      } else {
        throw new Error(response.data?.message || "Failed to update product");
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      alert(error.response?.data?.message || "Failed to update product");
    }
  };

  const confirmDelete = async () => {
    if (currentProduct) {
      try {
        setIsDeleteLoading(true);
        const response = await apiClient.delete(`/api/products/${currentProduct.id}`);
        
        if (response.data?.success) {
          setIsDeleteDialogOpen(false);
          setCurrentProduct(null);
          fetchProducts();
        } else {
          throw new Error(response.data?.message || "Failed to delete product");
        }
      } catch (error: any) {
        console.error("Error deleting product:", error);
        alert(error.response?.data?.message || "Failed to delete product");
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
        bulkDeleteProductIds.map(productId => 
          apiClient.delete(`/api/products/${productId}`)
        )
      );
      setBulkDeleteDialogOpen(false);
      setBulkDeleteProductIds([]);
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting products:", error);
      alert("Failed to delete some products");
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    editForm.reset({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      categoryId: product.category_id.toString(),
      familyId: product.family_id?.toString() || "none",
      unitId: product.unit_id.toString(),
      price: product.price,
      cost: product.cost,
      quantity: product.quantity,
      minQuantity: product.min_quantity || 0,
      maxQuantity: product.max_quantity || 0,
      status: product.status,
      barcode: product.barcode || "",
      weight: product.weight || 0,
      dimensions: product.dimensions || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const transformedProducts: ProductData[] = useMemo(() => {
    if (!products) return [];
    
    return products.map((product: Product) => ({
      id: String(product.id),
      name: product.name,
      sku: product.sku,
      category: product.category_name || "",
      family: product.family_name,
      unit: product.unit_name || "",
      price: product.price,
      cost: product.cost,
      quantity: product.quantity,
      status: product.status,
      description: product.description,
      created_at: product.created_at,
      updated_at: product.updated_at,
    }));
  }, [products]);

  const handleProductSelection = (productIds: string[]) => {
    console.log("Selected products:", productIds);
  };

  const handleBulkAction = (action: string, productIds: string[]) => {
    switch (action) {
      case "delete":
        if (canPerformAdminActions) {
          setBulkDeleteProductIds(productIds);
          setBulkDeleteDialogOpen(true);
        }
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleProductEdit = (product: ProductData) => {
    const productFound = products?.find((p: Product) => p.id.toString() === product.id);
    if (productFound) {
      handleEdit(productFound);
    }
  };

  const handleProductDelete = (product: ProductData) => {
    const productFound = products?.find((p: Product) => p.id.toString() === product.id);
    if (productFound) {
      setCurrentProduct(productFound);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleProductView = (product: ProductData) => {
    console.log("View product details:", product.name);
  };

  const handleProductToggleStatus = (product: ProductData) => {
    console.log("Toggle status for product:", product.name);
  };

  // Calculate stats
  const totalProducts = transformedProducts.length;
  const activeProducts = transformedProducts.filter(p => p.status === "active").length;
  const lowStockProducts = transformedProducts.filter(p => p.quantity <= 10).length;
  const totalValue = transformedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  if (!canAccessProductsPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Products page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Only authorized personnel can view product information.
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
          <p className="text-muted-foreground">Loading products...</p>
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
              Product Management
              {!canPerformAdminActions && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">(Read Only)</span>
              )}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {canPerformAdminActions 
                ? "Manage your product inventory, pricing, and stock levels" 
                : "View product information and inventory levels (read-only access)"
              }
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={fetchProducts} variant="outline" size="default">
              <RefreshCw className="mr-2 h-4 w-4" /> 
              Refresh
            </Button>
            {canPerformAdminActions && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new product.
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
                              <FormLabel>Product Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="Product name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU*</FormLabel>
                              <FormControl>
                                <Input placeholder="SKU" {...field} />
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
                              <Textarea placeholder="Product description" {...field} />
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
                            <FormLabel>Category*</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.filter(category => category.id).map((category) => (
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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="familyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Family</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select family" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">No Family</SelectItem>
                                  {families.filter(family => family.id).map((family) => (
                                    <SelectItem key={family.id} value={family.id.toString()}>
                                      {family.name}
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
                          name="unitId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit*</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {units.filter(unit => unit.id).map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                      {unit.name} ({unit.symbol})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={createForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price*</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="0.00" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost*</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="0.00" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity*</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="discontinued">Discontinued</SelectItem>
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
                          <Package className="mr-2 h-4 w-4" />
                          Create Product
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
                You have view-only access to product information. To create, edit, or delete products, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Products</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalProducts}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Products</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeProducts}</p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{lowStockProducts}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  ${totalValue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Products Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Product Inventory</CardTitle>
              <CardDescription className="mt-1">
                Manage and view all products in your inventory
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {transformedProducts.length} {transformedProducts.length === 1 ? 'product' : 'products'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedProductTable
              data={transformedProducts}
              loading={loading}
              onProductSelect={handleProductSelection}
              onBulkAction={handleBulkAction}
              onProductEdit={handleProductEdit}
              onProductDelete={handleProductDelete}
              onProductView={handleProductView}
              onProductToggleStatus={handleProductToggleStatus}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details and inventory information.
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
                      <FormLabel>Product Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU*</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU" {...field} />
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
                      <Textarea placeholder="Product description" {...field} />
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
                    <FormLabel>Category*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.filter(category => category.id).map((category) => (
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="familyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select family" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Family</SelectItem>
                          {families.filter(family => family.id).map((family) => (
                            <SelectItem key={family.id} value={family.id.toString()}>
                              {family.name}
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
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.filter(unit => unit.id).map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                              {unit.name} ({unit.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Update Product
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
        title="Delete Product Permanently"
        description={`Are you sure you want to permanently delete "${currentProduct?.name}" (${currentProduct?.sku})? This action cannot be undone and will remove all associated data from the database.`}
        loading={isDeleteLoading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {!canPerformAdminActions ? "Permission Denied" : "Delete Multiple Products"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!canPerformAdminActions 
                ? "You don't have permission to delete products. Only authorized personnel can perform this action."
                : `Are you sure you want to permanently delete ${bulkDeleteProductIds.length} product(s)? This action cannot be undone and will remove all associated data from the database.`
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
                Delete {bulkDeleteProductIds.length} Product(s)
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}