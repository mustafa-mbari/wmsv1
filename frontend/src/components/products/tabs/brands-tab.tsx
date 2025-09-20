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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  RefreshCw,
  Award,
  Save,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { useAlert } from "@/hooks/useAlert";

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export function BrandsTab() {
  const { isSuperAdmin, hasRole, isAdmin } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);

  const canPerformAdminActions = isSuperAdmin() || isAdmin() || hasRole('manager');

  const brandFormSchema = z.object({
    name: z.string().min(1, "Brand name is required"),
    description: z.string().optional(),
    logoUrl: z.string().url().optional().or(z.literal("")),
    websiteUrl: z.string().url().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v2/brands');

      if (response.data?.success) {
        const apiBrands = response.data.data.map((brand: any) => ({
          id: parseInt(brand.id),
          name: brand.name,
          description: brand.description,
          logo_url: brand.logo_url,
          website_url: brand.website_url,
          is_active: brand.is_active,
          product_count: brand.product_count || 0,
          created_at: brand.created_at,
          updated_at: brand.updated_at,
        }));
        setBrands(apiBrands);
      } else {
        setBrands([]);
      }
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
      description: "",
      logoUrl: "",
      websiteUrl: "",
      isActive: true,
    },
  });

  const editForm = useForm<z.infer<typeof brandFormSchema>>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      description: "",
      logoUrl: "",
      websiteUrl: "",
      isActive: true,
    },
  });

  const onCreateSubmit = async (data: z.infer<typeof brandFormSchema>) => {
    try {
      const brandData = {
        name: data.name,
        description: data.description || null,
        logo_url: data.logoUrl || null,
        website_url: data.websiteUrl || null,
        is_active: data.isActive,
      };

      const response = await apiClient.post('/api/v2/brands', brandData);

      if (response.data?.success) {
        setIsCreateDialogOpen(false);
        createForm.reset();
        fetchBrands();
      } else {
        throw new Error(response.data?.message || "Failed to create brand");
      }
    } catch (error: any) {
      console.error("Error creating brand:", error);
      showAlert({
        title: "Error",
        description: error.response?.data?.message || "Failed to create brand"
      });
    }
  };

  const onEditSubmit = async (data: z.infer<typeof brandFormSchema>) => {
    if (!currentBrand) return;

    try {
      const brandData = {
        name: data.name,
        description: data.description || null,
        logo_url: data.logoUrl || null,
        website_url: data.websiteUrl || null,
        is_active: data.isActive,
      };

      const response = await apiClient.put(`/api/brands/${currentBrand.id}`, brandData);

      if (response.data?.success) {
        setIsEditDialogOpen(false);
        setCurrentBrand(null);
        fetchBrands();
      } else {
        throw new Error(response.data?.message || "Failed to update brand");
      }
    } catch (error: any) {
      console.error("Error updating brand:", error);
      showAlert({
        title: "Error",
        description: error.response?.data?.message || "Failed to update brand"
      });
    }
  };

  const confirmDelete = async () => {
    if (currentBrand) {
      try {
        setIsDeleteLoading(true);
        const response = await apiClient.delete(`/api/brands/${currentBrand.id}`);

        if (response.data?.success) {
          setIsDeleteDialogOpen(false);
          setCurrentBrand(null);
          fetchBrands();
        } else {
          throw new Error(response.data?.message || "Failed to delete brand");
        }
      } catch (error: any) {
        console.error("Error deleting brand:", error);
        showAlert({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete brand"
        });
      } finally {
        setIsDeleteLoading(false);
      }
    }
  };

  const handleEdit = (brand: Brand) => {
    setCurrentBrand(brand);
    editForm.reset({
      name: brand.name,
      description: brand.description || "",
      logoUrl: brand.logo_url || "",
      websiteUrl: brand.website_url || "",
      isActive: brand.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  // Transform brands to TableData format for the table
  const transformedBrands: (Brand & TableData)[] = useMemo(() => {
    if (!brands) return [];

    return brands.map((brand: Brand) => ({
      ...brand,
      id: String(brand.id),
    }));
  }, [brands]);

  // Define column configuration for the table
  const columnConfig: ColumnConfig<Brand & TableData>[] = [
    {
      key: "name",
      label: "Brand Name",
      width: 200,
      render: (brand) => (
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{brand.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      width: 250,
      render: (brand) => (
        <span className="text-muted-foreground">
          {brand.description ? (
            brand.description.length > 60
              ? `${brand.description.substring(0, 60)}...`
              : brand.description
          ) : "No description"}
        </span>
      ),
    },
    {
      key: "website_url",
      label: "Website",
      width: 180,
      render: (brand) => (
        brand.website_url ? (
          <a
            href={brand.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {brand.website_url.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span className="text-muted-foreground">No website</span>
        )
      ),
    },
    {
      key: "product_count",
      label: "Products",
      width: 100,
      render: (brand) => (
        <span className="font-medium">{brand.product_count}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 100,
      filterType: "select",
      render: (brand) => (
        <Badge variant={brand.is_active ? "default" : "secondary"}>
          {brand.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      width: 130,
      render: (brand) => (
        <span className="text-muted-foreground">
          {new Date(brand.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  const handleBrandEdit = (brand: Brand & TableData) => {
    const brandFound = brands?.find((b: Brand) => b.id.toString() === brand.id);
    if (brandFound) {
      handleEdit(brandFound);
    }
  };

  const handleBrandDelete = (brand: Brand & TableData) => {
    const brandFound = brands?.find((b: Brand) => b.id.toString() === brand.id);
    if (brandFound) {
      setCurrentBrand(brandFound);
      setIsDeleteDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading brands...</p>
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
                You have view-only access to brand information. To create, edit, or delete brands, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Brands Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <AdvancedTable
            data={transformedBrands}
            columns={columnConfig}
            loading={loading}
            title="Product Brands"
            onRowEdit={canPerformAdminActions ? handleBrandEdit : undefined}
            onRowDelete={canPerformAdminActions ? handleBrandDelete : undefined}
            actions={{
              edit: canPerformAdminActions ? { label: "Edit Brand" } : undefined,
              delete: canPerformAdminActions ? { label: "Delete Brand" } : undefined,
            }}
            emptyMessage="No brands found"
            refreshButton={
              <Button onClick={fetchBrands} variant="outline" size="sm">
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
                      Add Brand
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create New Brand</DialogTitle>
                      <DialogDescription>
                        Fill in the details to create a new product brand.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...createForm}>
                      <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
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
                          name="websiteUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://brand-website.com" {...field} />
                              </FormControl>
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
                                  Enable this brand for use
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
                            <Award className="mr-2 h-4 w-4" />
                            Create Brand
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

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Update brand details and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
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
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://brand-website.com" {...field} />
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
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this brand for use
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
        description={`Are you sure you want to permanently delete "${currentBrand?.name}"? This action cannot be undone and will remove all associated data from the database.`}
        loading={isDeleteLoading}
      />

      {/* General Alert Dialog */}
      <AlertComponent />
    </div>
  );
}