"use client";

// Enhanced Products Tab - Layer 1: UI Component using the layered architecture
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
  Package,
  AlertCircle,
  DollarSign,
  Tag,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Layer 2: Custom Hooks
import {
  useProducts,
  useProductMutations,
  useProductState,
  useProductSearch
} from "@/hooks/use-products";

// Types
import { Product as ProductType } from "@/types/api";

// Form schemas
const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  cost: z.number().min(0, "Cost must be non-negative"),
  stock_quantity: z.number().int().min(0, "Stock quantity must be non-negative"),
  status: z.enum(["active", "inactive", "discontinued"]).default("active"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export function ProductsTab() {
  // Layer 2: Custom Hooks for state management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Product state management
  const {
    selectedProducts,
    currentProduct,
    selectProduct,
    clearSelection,
    setCurrentProduct,
    hasSelection,
    selectionCount
  } = useProductState();

  // Data fetching with React Query
  const {
    data: productsResponse,
    isLoading,
    error,
    refetch
  } = useProducts({
    page: currentPage,
    limit: 10,
    search: searchTerm
  });

  // Mutations
  const {
    createProduct,
    updateProduct,
    deleteProduct,
    bulkOperations
  } = useProductMutations();

  // Search functionality
  const { updateSearch, clearSearch } = useProductSearch();

  // Forms
  const createForm = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      cost: 0,
      stock_quantity: 0,
      status: "active",
    },
  });

  const editForm = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  // Event handlers
  const handleCreateProduct = async (data: ProductFormData) => {
    await createProduct.mutateAsync(data);
    setIsCreateDialogOpen(false);
    createForm.reset();
  };

  const handleEditProduct = async (data: ProductFormData) => {
    if (!currentProduct) return;

    await updateProduct.mutateAsync({
      id: currentProduct.id,
      data
    });
    setIsEditDialogOpen(false);
    setCurrentProduct(null);
    editForm.reset();
  };

  const handleDeleteProduct = async (product: ProductType) => {
    await deleteProduct.mutateAsync(product.id);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    await bulkOperations.mutateAsync({
      operation: 'delete',
      products: selectedProducts.map(p => ({ id: p.id }))
    });
    clearSelection();
  };

  const openEditDialog = (product: ProductType) => {
    setCurrentProduct(product);
    editForm.reset({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      price: product.price,
      cost: product.cost,
      stock_quantity: product.stock_quantity,
      status: product.status as "active" | "inactive" | "discontinued",
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
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">Error loading products</span>
        <Button onClick={() => refetch()} variant="outline" className="ml-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const products = productsResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
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
              title="Delete Selected Products"
              description={`Are you sure you want to delete ${selectionCount} selected products? This action cannot be undone.`}
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
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your catalog
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateProduct)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product name" {...field} />
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
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter SKU" {...field} />
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
                          <Textarea placeholder="Enter product description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={createForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
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
                          <FormLabel>Cost</FormLabel>
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
                      name="stock_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
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
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createProduct.isPending}
                    >
                      {createProduct.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Product
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
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.some(p => p.id === product.id)}
                    onChange={() => selectProduct(product)}
                    className="rounded"
                  />
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <HardDeleteConfirmationDialog
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title="Delete Product"
                    description={`Are you sure you want to delete "${product.name}"?`}
                    onConfirm={() => handleDeleteProduct(product)}
                    loading={deleteProduct.isPending}
                  />
                </div>
              </div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {product.description && (
                  <p className="text-sm line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">${product.price}</span>
                  </div>
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Stock: {product.stock_quantity}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first product.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditProduct)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
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
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SKU" {...field} />
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
                      <Textarea placeholder="Enter product description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
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
                      <FormLabel>Cost</FormLabel>
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
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
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
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={updateProduct.isPending}
                >
                  {updateProduct.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Product
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}