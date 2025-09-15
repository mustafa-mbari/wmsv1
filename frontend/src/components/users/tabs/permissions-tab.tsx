"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Save,
  Edit,
  Trash2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useAlert } from "@/hooks/useAlert";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable } from "@/components/ui/advanced-table";

export interface Permission {
  id: number;
  name: string;
  slug: string;
  description?: string;
  module?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionData {
  id: string;
  name: string;
  slug: string;
  description: string;
  module: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const permissionFormSchema = z.object({
  name: z.string().min(1, "Permission name is required"),
  slug: z.string().min(1, "Permission slug is required"),
  description: z.string().optional(),
  module: z.string().optional(),
  is_active: z.boolean().default(true),
});

export function PermissionsTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);

  const canAccessPermissionsPage = isSuperAdmin() || isAdmin() || hasRole('manager');
  const canPerformAdminActions = isSuperAdmin();

  const createForm = useForm<z.infer<typeof permissionFormSchema>>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      module: "",
      is_active: true,
    },
  });

  const editForm = useForm<z.infer<typeof permissionFormSchema>>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      module: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (canAccessPermissionsPage) {
      fetchPermissions();
    }
  }, [canAccessPermissionsPage]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/permissions");
      const permissionData = response.data.data || [];
      setPermissions(permissionData);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const onCreateSubmit = async (data: z.infer<typeof permissionFormSchema>) => {
    try {
      await apiClient.post("/api/permissions", data);
      showAlert({
        title: "Success",
        description: "Permission created successfully"
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchPermissions();
    } catch (error) {
      console.error("Error creating permission:", error);
      showAlert({
        title: "Error",
        description: "Failed to create permission"
      });
    }
  };

  const onEditSubmit = async (data: z.infer<typeof permissionFormSchema>) => {
    if (!currentPermission) return;

    try {
      await apiClient.put(`/api/permissions/${currentPermission.id}`, data);
      showAlert({
        title: "Success",
        description: "Permission updated successfully"
      });
      setIsEditDialogOpen(false);
      fetchPermissions();
    } catch (error) {
      console.error("Error updating permission:", error);
      showAlert({
        title: "Error",
        description: "Failed to update permission"
      });
    }
  };

  const confirmDelete = async () => {
    if (currentPermission) {
      try {
        await apiClient.delete(`/api/permissions/${currentPermission.id}`);
        setIsDeleteDialogOpen(false);
        setCurrentPermission(null);
        fetchPermissions();
      } catch (error) {
        console.error("Error deleting permission:", error);
        showAlert({
          title: "Error",
          description: "Failed to delete permission"
        });
      }
    }
  };

  const handleEdit = (permission: Permission) => {
    setCurrentPermission(permission);
    editForm.reset({
      name: permission.name,
      slug: permission.slug,
      description: permission.description || "",
      module: permission.module || "",
      is_active: permission.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    setCurrentPermission(permission);
    setIsDeleteDialogOpen(true);
  };

  const transformedPermissions: PermissionData[] = useMemo(() => {
    if (!permissions) return [];

    return permissions.map((permission: Permission) => ({
      id: String(permission.id),
      name: permission.name || "",
      slug: permission.slug || "",
      description: permission.description || "",
      module: permission.module || "",
      is_active: permission.is_active ?? true,
      created_at: permission.created_at || new Date().toISOString(),
      updated_at: permission.updated_at || new Date().toISOString(),
    }));
  }, [permissions]);

  const columns = [
    {
      key: "name",
      label: "Permission Name",
      sortable: true,
    },
    {
      key: "slug",
      label: "Slug",
      sortable: true,
    },
    {
      key: "module",
      label: "Module",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (item: PermissionData) => (
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (item: PermissionData) => new Date(item.created_at).toLocaleDateString(),
    },
  ];

  const handlePermissionEdit = (permission: PermissionData) => {
    const permissionFound = permissions?.find((p: Permission) => p.id.toString() === permission.id);
    if (permissionFound) {
      handleEdit(permissionFound);
    }
  };

  const handlePermissionDelete = (permission: PermissionData) => {
    const permissionFound = permissions?.find((p: Permission) => p.id.toString() === permission.id);
    if (permissionFound) {
      setCurrentPermission(permissionFound);
      setIsDeleteDialogOpen(true);
    }
  };

  if (!canAccessPermissionsPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Permissions page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading permissions...</p>
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
            <h2 className="text-2xl font-bold tracking-tight">
              Permissions Management
              {!canPerformAdminActions && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">(Read Only)</span>
              )}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {canPerformAdminActions
                ? "Manage system permissions and their assignments"
                : "View system permissions and their details (read-only access)"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Read-only notice for non-Super Admins */}
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
                You have view-only access to permissions. To create, edit, or delete permissions, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Permissions</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{transformedPermissions.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Permissions</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {transformedPermissions.filter(p => p.is_active).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Modules</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {new Set(transformedPermissions.filter(p => p.module).map(p => p.module)).size}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Permissions Table */}
      <AdvancedTable
        data={transformedPermissions}
        columns={columns}
        loading={loading}
        onRowEdit={canPerformAdminActions ? handlePermissionEdit : undefined}
        onRowDelete={canPerformAdminActions ? handlePermissionDelete : undefined}
        refreshButton={
          <Button onClick={fetchPermissions} variant="outline" size="sm">
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
                  Add Permission
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Permission</DialogTitle>
                  <DialogDescription>
                    Add a new permission to the system.
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
                            <FormLabel>Permission Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Permission name" {...field} />
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
                              <Input placeholder="permission-slug" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={createForm.control}
                      name="module"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Module</FormLabel>
                          <FormControl>
                            <Input placeholder="Module name" {...field} />
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
                            <Input placeholder="Permission description" {...field} />
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
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Permission is active and can be assigned
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? false}
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
                        <Shield className="mr-2 h-4 w-4" />
                        Create Permission
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {/* Edit Permission Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Update permission details and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permission Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Permission name" {...field} />
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
                        <Input placeholder="permission-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <FormControl>
                      <Input placeholder="Module name" {...field} />
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
                      <Input placeholder="Permission description" {...field} />
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
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Permission is active and can be assigned
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
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
                  Update Permission
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the permission "{currentPermission?.name}"? This action cannot be undone and will remove all role assignments for this permission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertComponent />
    </div>
  );
}