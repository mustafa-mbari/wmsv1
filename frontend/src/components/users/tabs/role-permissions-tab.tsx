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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  RefreshCw,
  Link,
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

export interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  created_at: string;
  updated_at: string;
  roles?: {
    id: number;
    name: string;
    slug: string;
  };
  permissions?: {
    id: number;
    name: string;
    slug: string;
    module?: string;
  };
}

export interface RolePermissionData {
  id: string;
  role_name: string;
  role_slug: string;
  permission_name: string;
  permission_slug: string;
  permission_module: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  module?: string;
}

const rolePermissionFormSchema = z.object({
  role_id: z.string().min(1, "Role is required"),
  permission_id: z.string().min(1, "Permission is required"),
});

export function RolePermissionsTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRolePermission, setCurrentRolePermission] = useState<RolePermission | null>(null);

  const canAccessRolePermissionsPage = isSuperAdmin() || isAdmin() || hasRole('manager');
  const canPerformAdminActions = isSuperAdmin();

  const createForm = useForm<z.infer<typeof rolePermissionFormSchema>>({
    resolver: zodResolver(rolePermissionFormSchema),
    defaultValues: {
      role_id: "",
      permission_id: "",
    },
  });

  useEffect(() => {
    if (canAccessRolePermissionsPage) {
      fetchData();
    }
  }, [canAccessRolePermissionsPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolePermissionsRes, rolesRes, permissionsRes] = await Promise.all([
        apiClient.get("/api/role-permissions"),
        apiClient.get("/api/roles"),
        apiClient.get("/api/permissions"),
      ]);

      setRolePermissions(rolePermissionsRes.data.data || []);
      setRoles(rolesRes.data.data || []);
      setPermissions(permissionsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setRolePermissions([]);
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const onCreateSubmit = async (data: z.infer<typeof rolePermissionFormSchema>) => {
    try {
      await apiClient.post("/api/role-permissions", {
        role_id: parseInt(data.role_id),
        permission_id: parseInt(data.permission_id),
      });
      showAlert({
        title: "Success",
        description: "Role permission assigned successfully"
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchData();
    } catch (error) {
      console.error("Error creating role permission:", error);
      showAlert({
        title: "Error",
        description: "Failed to assign permission to role"
      });
    }
  };

  const confirmDelete = async () => {
    if (currentRolePermission) {
      try {
        await apiClient.delete(`/api/role-permissions/${currentRolePermission.id}`);
        setIsDeleteDialogOpen(false);
        setCurrentRolePermission(null);
        fetchData();
      } catch (error) {
        console.error("Error deleting role permission:", error);
        showAlert({
          title: "Error",
          description: "Failed to remove permission from role"
        });
      }
    }
  };

  const handleDelete = (rolePermission: RolePermission) => {
    setCurrentRolePermission(rolePermission);
    setIsDeleteDialogOpen(true);
  };

  const transformedRolePermissions: RolePermissionData[] = useMemo(() => {
    if (!rolePermissions) return [];

    return rolePermissions.map((rolePermission: RolePermission) => ({
      id: String(rolePermission.id),
      role_name: rolePermission.roles?.name || "Unknown Role",
      role_slug: rolePermission.roles?.slug || "",
      permission_name: rolePermission.permissions?.name || "Unknown Permission",
      permission_slug: rolePermission.permissions?.slug || "",
      permission_module: rolePermission.permissions?.module || "",
      created_at: rolePermission.created_at || new Date().toISOString(),
      updated_at: rolePermission.updated_at || new Date().toISOString(),
    }));
  }, [rolePermissions]);

  const columns = [
    {
      key: "role_name",
      label: "Role Name",
      sortable: true,
    },
    {
      key: "permission_name",
      label: "Permission Name",
      sortable: true,
    },
    {
      key: "permission_module",
      label: "Module",
      sortable: true,
      render: (item: RolePermissionData) => item.permission_module ? (
        <Badge variant="outline">{item.permission_module}</Badge>
      ) : "-",
    },
    {
      key: "created_at",
      label: "Assigned",
      sortable: true,
      render: (item: RolePermissionData) => new Date(item.created_at).toLocaleDateString(),
    },
  ];

  const handleRolePermissionDelete = (rolePermission: RolePermissionData) => {
    const rolePermissionFound = rolePermissions?.find((rp: RolePermission) => rp.id.toString() === rolePermission.id);
    if (rolePermissionFound) {
      setCurrentRolePermission(rolePermissionFound);
      setIsDeleteDialogOpen(true);
    }
  };

  if (!canAccessRolePermissionsPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Role Permissions page.
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
          <p className="text-muted-foreground">Loading role permissions...</p>
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
              Role Permissions Management
              {!canPerformAdminActions && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">(Read Only)</span>
              )}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {canPerformAdminActions
                ? "Manage the assignment of permissions to roles"
                : "View role-permission assignments (read-only access)"
              }
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={fetchData} variant="outline" size="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {canPerformAdminActions && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Permission
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Assign Permission to Role</DialogTitle>
                    <DialogDescription>
                      Select a role and permission to create an assignment.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="role_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.name}
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
                        name="permission_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Permission*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a permission" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {permissions.map((permission) => (
                                  <SelectItem key={permission.id} value={permission.id.toString()}>
                                    {permission.name} {permission.module && `(${permission.module})`}
                                  </SelectItem>
                                ))}
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
                          <Link className="mr-2 h-4 w-4" />
                          Assign Permission
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
                You have view-only access to role permissions. To assign or remove permissions, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Role Permissions Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Assignments</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{transformedRolePermissions.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Link className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Roles with Permissions</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {new Set(transformedRolePermissions.map(rp => rp.role_name)).size}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Link className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Permissions Assigned</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {new Set(transformedRolePermissions.map(rp => rp.permission_name)).size}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Link className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Role Permissions Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Role Permissions Directory</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedTable
              data={transformedRolePermissions}
              columns={columns}
              loading={loading}
              onRowDelete={canPerformAdminActions ? handleRolePermissionDelete : undefined}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Permission Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the permission "{currentRolePermission?.permissions?.name}" from role "{currentRolePermission?.roles?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertComponent />
    </div>
  );
}