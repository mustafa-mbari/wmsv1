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
  Settings,
  Save,
  Edit,
  Trash2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable } from "@/components/ui/advanced-table";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";
import { useAlert } from "@/hooks/useAlert";

export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  assigned_at?: string;
  assigned_by?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  role?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface UserRoleData {
  id: string;
  user_name: string;
  user_email: string;
  role_name: string;
  role_slug: string;
  assigned_at: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
}

const userRoleFormSchema = z.object({
  user_id: z.string().min(1, "User is required"),
  role_id: z.string().min(1, "Role is required"),
});

export function UserRolesTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const canAccessUserRolesPage = isSuperAdmin() || isAdmin() || hasRole('manager');
  const canPerformAdminActions = isSuperAdmin();

  const createForm = useForm<z.infer<typeof userRoleFormSchema>>({
    resolver: zodResolver(userRoleFormSchema),
    defaultValues: {
      user_id: "",
      role_id: "",
    },
  });

  useEffect(() => {
    if (canAccessUserRolesPage) {
      fetchData();
    }
  }, [canAccessUserRolesPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRolesRes, usersRes, rolesRes] = await Promise.all([
        apiClient.get("/api/user-roles"),
        apiClient.get("/api/users"),
        apiClient.get("/api/roles"),
      ]);

      const userRolesData = userRolesRes.data.data || [];
      const usersData = usersRes.data.data || [];
      const rolesData = rolesRes.data.data || [];

      // Log the fetched data for debugging
      console.log("Fetched data:", {
        userRoles: userRolesData.length,
        users: usersData.length,
        roles: rolesData.length,
        userRolesSample: userRolesData.slice(0, 2),
        usersSample: usersData.slice(0, 2),
        rolesSample: rolesData.slice(0, 2)
      });

      // Filter out any users or roles that might be soft-deleted or invalid
      const validUsers = usersData.filter(user => {
        const isValid = user && user.id && user.username && user.email;
        if (!isValid && user) {
          console.warn("Invalid user data:", user);
        }
        return isValid;
      });

      const validRoles = rolesData.filter(role => {
        const isValid = role && role.id && role.name && role.slug;
        if (!isValid && role) {
          console.warn("Invalid role data:", role);
        }
        return isValid;
      });

      setUserRoles(userRolesData);
      setUsers(validUsers);
      setRoles(validRoles);

      if (validUsers.length === 0) {
        console.warn("No valid users found");
      }
      if (validRoles.length === 0) {
        console.warn("No valid roles found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setUserRoles([]);
      setUsers([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const onCreateSubmit = async (data: z.infer<typeof userRoleFormSchema>) => {
    try {
      console.log("Form submitted with data:", data);

      // Ensure we have data loaded first
      if (users.length === 0 || roles.length === 0) {
        console.warn("No users or roles available", { users: users.length, roles: roles.length });
        setDialogMessage("User and role data is still loading. Please wait a moment and try again.");
        setIsErrorDialogOpen(true);
        return;
      }

      // Validate form data
      if (!data.user_id || !data.role_id) {
        setDialogMessage("Please select both a user and a role.");
        setIsErrorDialogOpen(true);
        return;
      }

      const userId = parseInt(data.user_id);
      const roleId = parseInt(data.role_id);

      // Validate that the user and role IDs are valid numbers
      if (isNaN(userId) || isNaN(roleId)) {
        setDialogMessage("Invalid user or role selection. Please refresh the page and try again.");
        setIsErrorDialogOpen(true);
        return;
      }

      // Check if user exists in our current user list
      console.log("Looking for user with ID:", userId, "in users:", users.map(u => ({ id: u.id, username: u.username })));

      // Try both number comparison and string comparison for robustness
      const selectedUser = users.find(user =>
        user.id === userId ||
        user.id.toString() === userId.toString() ||
        parseInt(user.id.toString()) === userId
      );

      console.log("Found user:", selectedUser);

      if (!selectedUser) {
        console.error("User not found - debugging info:", {
          userId,
          userIdType: typeof userId,
          usersAvailable: users.length,
          userIds: users.map(u => ({ id: u.id, type: typeof u.id })),
          formData: data,
          searchedUserId: userId,
          availableUserIds: users.map(u => u.id)
        });
        setDialogMessage("Selected user not found. Please refresh the page and try again.");
        setIsErrorDialogOpen(true);
        return;
      }

      // Check if role exists in our current role list
      const selectedRole = roles.find(role =>
        role.id === roleId ||
        role.id.toString() === roleId.toString() ||
        parseInt(role.id.toString()) === roleId
      );

      if (!selectedRole) {
        console.error("Role not found - debugging info:", {
          roleId,
          roleIdType: typeof roleId,
          rolesAvailable: roles.length,
          roleIds: roles.map(r => ({ id: r.id, type: typeof r.id })),
          availableRoleIds: roles.map(r => r.id)
        });
        setDialogMessage("Selected role not found. Please refresh the page and try again.");
        setIsErrorDialogOpen(true);
        return;
      }

      // Check if this assignment already exists
      const existingAssignment = userRoles.find(ur => {
        const userMatches = ur.user_id === userId ||
          ur.user_id.toString() === userId.toString() ||
          parseInt(ur.user_id.toString()) === userId;

        const roleMatches = ur.role_id === roleId ||
          ur.role_id.toString() === roleId.toString() ||
          parseInt(ur.role_id.toString()) === roleId;

        return userMatches && roleMatches;
      });
      if (existingAssignment) {
        setDialogMessage(`User "${selectedUser.username}" already has the role "${selectedRole.name}" assigned.`);
        setIsErrorDialogOpen(true);
        return;
      }

      console.log(`Assigning role "${selectedRole.name}" to user "${selectedUser.username}"`, {
        user_id: userId,
        role_id: roleId,
        user: selectedUser,
        role: selectedRole
      });

      await apiClient.post("/api/user-roles", {
        user_id: userId,
        role_id: roleId,
      });

      setDialogMessage(`Role "${selectedRole.name}" assigned to user "${selectedUser.username}" successfully!`);
      setIsSuccessDialogOpen(true);
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchData();
    } catch (error: any) {
      console.error("Error creating user role:", error);

      // Extract more detailed error message
      let errorMessage = "Failed to assign role to user";
      if (error?.response?.status === 403) {
        errorMessage = "Access denied: Only Super Admins can assign roles to users";
      } else if (error?.response?.status === 409) {
        errorMessage = "This user already has this role assigned";
      } else if (error?.response?.status === 404) {
        errorMessage = "User or role not found";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      // Add more detailed logging for debugging
      console.error("Role assignment error details:", {
        error: error?.response?.data,
        status: error?.response?.status,
        users: users.length,
        roles: roles.length,
        userRoles: userRoles.length
      });

      setDialogMessage(errorMessage);
      setIsErrorDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (currentUserRole) {
      try {
        await apiClient.delete(`/api/user-roles/${currentUserRole.id}`);
        setDialogMessage("Role removed from user successfully!");
        setIsSuccessDialogOpen(true);
        setIsDeleteDialogOpen(false);
        setCurrentUserRole(null);
        fetchData();
      } catch (error: any) {
        console.error("Error deleting user role:", error);

        let errorMessage = "Failed to remove role from user";
        if (error?.response?.status === 403) {
          errorMessage = "Access denied: Only Super Admins can remove role assignments";
        } else if (error?.response?.status === 404) {
          errorMessage = "User role assignment not found";
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        setDialogMessage(errorMessage);
        setIsErrorDialogOpen(true);
        setIsDeleteDialogOpen(false);
        setCurrentUserRole(null);
      }
    }
  };

  const handleDelete = (userRole: UserRole) => {
    setCurrentUserRole(userRole);
    setIsDeleteDialogOpen(true);
  };

  const getUserDisplayName = (user?: UserRole['user'] | User) => {
    if (!user) return "Unknown User";
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  const transformedUserRoles: UserRoleData[] = useMemo(() => {
    if (!userRoles) return [];

    return userRoles.map((userRole: UserRole) => ({
      id: String(userRole.id),
      user_name: getUserDisplayName(userRole.user),
      user_email: userRole.user?.email || "",
      role_name: userRole.role?.name || "Unknown Role",
      role_slug: userRole.role?.slug || "",
      assigned_at: userRole.assigned_at || userRole.created_at,
      created_at: userRole.created_at || new Date().toISOString(),
    }));
  }, [userRoles]);

  const columns = [
    {
      key: "user_name",
      label: "User Name",
      sortable: true,
    },
    {
      key: "user_email",
      label: "Email",
      sortable: true,
    },
    {
      key: "role_name",
      label: "Role",
      sortable: true,
      render: (item: UserRoleData) => (
        <Badge variant="outline">{item.role_name}</Badge>
      ),
    },
    {
      key: "assigned_at",
      label: "Assigned",
      sortable: true,
      render: (item: UserRoleData) => new Date(item.assigned_at).toLocaleDateString(),
    },
  ];

  const handleUserRoleDelete = (userRole: UserRoleData) => {
    const userRoleFound = userRoles?.find((ur: UserRole) => ur.id.toString() === userRole.id);
    if (userRoleFound) {
      setCurrentUserRole(userRoleFound);
      setIsDeleteDialogOpen(true);
    }
  };

  if (!canAccessUserRolesPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the User Roles page.
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
          <p className="text-muted-foreground">Loading user roles...</p>
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
              User Roles Management
              {!canPerformAdminActions && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">(Read Only)</span>
              )}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {canPerformAdminActions
                ? "Manage the assignment of roles to users"
                : "View user-role assignments (read-only access)"
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
                    Assign Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Assign Role to User</DialogTitle>
                    <DialogDescription>
                      Select a user and role to create an assignment.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="user_id"
                        render={({ field }) => {
                          const userOptions: SearchableSelectOption[] = users.map((user) => ({
                            value: user.id.toString(),
                            label: getUserDisplayName(user),
                            subtitle: user.email,
                          }));

                          return (
                            <FormItem>
                              <FormLabel>User*</FormLabel>
                              <FormControl>
                                <SearchableSelect
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  options={userOptions}
                                  placeholder="Select a user"
                                  searchPlaceholder="Search users..."
                                  emptyMessage="No users found."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={createForm.control}
                        name="role_id"
                        render={({ field }) => {
                          const roleOptions: SearchableSelectOption[] = roles.map((role) => ({
                            value: role.id.toString(),
                            label: role.name,
                            subtitle: role.slug,
                          }));

                          return (
                            <FormItem>
                              <FormLabel>Role*</FormLabel>
                              <FormControl>
                                <SearchableSelect
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  options={roleOptions}
                                  placeholder="Select a role"
                                  searchPlaceholder="Search roles..."
                                  emptyMessage="No roles found."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading || users.length === 0 || roles.length === 0}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Assign Role
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
                You have view-only access to user roles. To assign or remove roles, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Roles Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Assignments</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{transformedUserRoles.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Users with Roles</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {new Set(transformedUserRoles.map(ur => ur.user_email)).size}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Roles Assigned</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {new Set(transformedUserRoles.map(ur => ur.role_name)).size}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main User Roles Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="border-b bg-muted/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">User Roles Directory</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedTable
              data={transformedUserRoles}
              columns={columns}
              loading={loading}
              onRowDelete={canPerformAdminActions ? handleUserRoleDelete : undefined}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the role "{currentUserRole?.role?.name}" from user "{getUserDisplayName(currentUserRole?.user)}"? This action cannot be undone.
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

      {/* Success Dialog */}
      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSuccessDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setIsErrorDialogOpen(false)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}