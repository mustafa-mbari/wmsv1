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
  UserCheck,
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

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleData {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  slug: z.string().min(1, "Role slug is required"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export function RolesTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const canAccessRolesPage = isSuperAdmin() || isAdmin() || hasRole('manager');
  const canPerformAdminActions = isSuperAdmin();

  const createForm = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      is_active: true,
    },
  });

  const editForm = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (canAccessRolesPage) {
      fetchRoles();
    }
  }, [canAccessRolesPage]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/v2/roles");
      const roleData = response.data.data || [];
      setRoles(roleData);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const onCreateSubmit = async (data: z.infer<typeof roleFormSchema>) => {
    try {
      await apiClient.post("/api/v2/roles", data);
      showAlert({
        title: "Success",
        description: "Role created successfully"
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchRoles();
    } catch (error) {
      console.error("Error creating role:", error);
      showAlert({
        title: "Error",
        description: "Failed to create role"
      });
    }
  };

  const onEditSubmit = async (data: z.infer<typeof roleFormSchema>) => {
    if (!currentRole) return;

    try {
      await apiClient.put(`/api/roles/${currentRole.id}`, data);
      showAlert({
        title: "Success",
        description: "Role updated successfully"
      });
      setIsEditDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error("Error updating role:", error);
      showAlert({
        title: "Error",
        description: "Failed to update role"
      });
    }
  };

  const confirmDelete = async () => {
    if (currentRole) {
      try {
        await apiClient.delete(`/api/roles/${currentRole.id}`);
        setIsDeleteDialogOpen(false);
        setCurrentRole(null);
        fetchRoles();
      } catch (error) {
        console.error("Error deleting role:", error);
        showAlert({
          title: "Error",
          description: "Failed to delete role"
        });
      }
    }
  };

  const handleEdit = (role: Role) => {
    setCurrentRole(role);
    editForm.reset({
      name: role.name,
      slug: role.slug,
      description: role.description || "",
      is_active: role.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setCurrentRole(role);
    setIsDeleteDialogOpen(true);
  };

  const transformedRoles: RoleData[] = useMemo(() => {
    if (!roles) return [];

    return roles.map((role: Role) => ({
      id: String(role.id),
      name: role.name || "",
      slug: role.slug || "",
      description: role.description || "",
      is_active: role.is_active ?? true,
      created_at: role.created_at || new Date().toISOString(),
      updated_at: role.updated_at || new Date().toISOString(),
    }));
  }, [roles]);

  const columns = [
    {
      key: "name",
      label: "Role Name",
      sortable: true,
    },
    {
      key: "slug",
      label: "Slug",
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
      render: (item: RoleData) => (
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (item: RoleData) => new Date(item.created_at).toLocaleDateString(),
    },
  ];

  const handleRoleEdit = (role: RoleData) => {
    const roleFound = roles?.find((r: Role) => r.id.toString() === role.id);
    if (roleFound) {
      handleEdit(roleFound);
    }
  };

  const handleRoleDelete = (role: RoleData) => {
    const roleFound = roles?.find((r: Role) => r.id.toString() === role.id);
    if (roleFound) {
      setCurrentRole(roleFound);
      setIsDeleteDialogOpen(true);
    }
  };

  if (!canAccessRolesPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Roles page.
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
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Roles Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Roles</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{transformedRoles.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Roles</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {transformedRoles.filter(r => r.is_active).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Roles Table */}
      <AdvancedTable
        data={transformedRoles}
        columns={columns}
        loading={loading}
        onRowEdit={canPerformAdminActions ? handleRoleEdit : undefined}
        onRowDelete={canPerformAdminActions ? handleRoleDelete : undefined}
        refreshButton={
          <Button onClick={fetchRoles} variant="outline" size="sm">
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
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Add a new role to the system.
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
                            <FormLabel>Role Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Role name" {...field} />
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
                              <Input placeholder="role-slug" {...field} />
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
                            <Input placeholder="Role description" {...field} />
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
                              Role is active and can be assigned
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
                        <UserCheck className="mr-2 h-4 w-4" />
                        Create Role
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and settings.
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
                      <FormLabel>Role Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Role name" {...field} />
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
                        <Input placeholder="role-slug" {...field} />
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
                      <Input placeholder="Role description" {...field} />
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
                        Role is active and can be assigned
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
                  Update Role
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
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{currentRole?.name}"? This action cannot be undone and will remove all user assignments for this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertComponent />
    </div>
  );
}