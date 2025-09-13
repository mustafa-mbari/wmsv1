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
  AlertDialogTrigger,
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
import {
  Loader2,
  Plus,
  RefreshCw,
  UserPlus,
  Save,
  Edit,
  Trash2,
  XCircle,
  Users,
  User,
  Settings
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedTable, TableData, ColumnConfig } from "@/components/ui/advanced-table";
import { useAlert } from "@/hooks/useAlert";

// User data interface for table display
export interface UserData extends TableData {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  role_names: string[];
  role_slugs: string[];
}

// Extended User type with role information from the API (matching backend response)
export interface UserWithRoles {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  is_active: boolean;
  is_admin?: boolean;
  defaultWarehouseId?: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
  role_names?: string[];
  role_slugs?: string[];
  email_verified?: boolean;
}

// Define form schema with zod
const userFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
  isActive: z.boolean().default(true),
  isAdmin: z.boolean().default(false),
  defaultWarehouseId: z.string().optional(),
}).refine((data) => {
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function UsersTab() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("_all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteUserIds, setBulkDeleteUserIds] = useState<string[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserWithRoles | null>(null);
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Check if user can access this page
  const canAccessUsersPage = isSuperAdmin() || isAdmin() || hasRole('manager');

  // Check if user can perform admin actions (create, edit, delete, role management)
  const canPerformAdminActions = isSuperAdmin();

  // Create form for new user
  const createForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      isActive: true,
      isAdmin: false,
    },
  });

  // Create form for editing user
  const editForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      isActive: true,
      isAdmin: false,
      defaultWarehouseId: "",
    },
  });

  useEffect(() => {
    if (canAccessUsersPage) {
      fetchUsers();
    }
  }, [canAccessUsersPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/users");
      const userData = response.data.data || [];
      console.log("Fetched user data:", userData);
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const onCreateSubmit = async (data: z.infer<typeof userFormSchema>) => {
    try {
      if (!data.password) {
        showAlert({
          title: "Password Required",
          description: "Please enter a password for the new user"
        });
        return;
      }
      const { confirmPassword, ...userData } = data;
      await apiClient.post("/api/auth/register", userData);
      showAlert({
        title: "Success",
        description: "User created successfully"
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      showAlert({
        title: "Error",
        description: "Failed to create user"
      });
    }
  };

  const onEditSubmit = async (data: z.infer<typeof userFormSchema>) => {
    if (!currentUser) return;

    try {
      const { password, confirmPassword, ...restData } = data;
      const updateData = password ? { ...restData, password } : restData;

      await apiClient.put(`/api/users/${currentUser.id}`, updateData);
      showAlert({
        title: "Success",
        description: "User updated successfully"
      });
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      showAlert({
        title: "Error",
        description: "Failed to update user"
      });
    }
  };

  const confirmDelete = async () => {
    if (currentUser) {
      try {
        setIsDeleteLoading(true);
        await apiClient.delete(`/api/users/${currentUser.id}`);
        setIsDeleteDialogOpen(false);
        setCurrentUser(null);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        showAlert({
          title: "Error",
          description: "Failed to delete user"
        });
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
      for (const userId of bulkDeleteUserIds) {
        await apiClient.delete(`/api/users/${userId}`);
      }
      setBulkDeleteDialogOpen(false);
      setBulkDeleteUserIds([]);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting users:", error);
      showAlert({
        title: "Error",
        description: "Failed to delete some users"
      });
    }
  };

  const handleEdit = (user: UserWithRoles) => {
    setCurrentUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      country: user.country || "",
      isActive: user.is_active,
      isAdmin: user.is_admin || false,
      defaultWarehouseId: user.defaultWarehouseId || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: UserWithRoles) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Transform UserWithRoles to UserData format for the advanced table
  const transformedUsers: UserData[] = useMemo(() => {
    if (!users) return [];

    return users.map((user: UserWithRoles) => ({
      id: String(user.id),
      username: user.username || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      is_active: user.is_active ?? true,
      email_verified: user.email_verified ?? false,
      last_login_at: user.last_login_at || undefined,
      created_at: user.created_at || new Date().toISOString(),
      role_names: user.role_names || [],
      role_slugs: user.role_slugs || []
    }));
  }, [users]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super-admin':
        return 'destructive';
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'supervisor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Define column configuration for the users table
  const columnConfig: ColumnConfig<UserData>[] = [
    {
      key: "first_name",
      label: "Name",
      width: 200,
      sortable: true,
      filterable: true,
      render: (user) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {user.first_name} {user.last_name}
          </span>
        </div>
      ),
    },
    {
      key: "username",
      label: "Username",
      width: 150,
      sortable: true,
      filterable: true,
      render: (user) => (
        <span className="font-mono text-sm">{user.username}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      width: 250,
      sortable: true,
      filterable: true,
      render: (user) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm">{user.email}</span>
          {user.email_verified && (
            <Badge variant="outline" className="text-xs">Verified</Badge>
          )}
        </div>
      ),
    },
    {
      key: "role_names",
      label: "Roles",
      width: 200,
      filterable: true,
      filterType: "select",
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.role_names.map((role, index) => (
            <Badge
              key={index}
              variant={getRoleBadgeVariant(role) as any}
              className="text-xs"
            >
              {role}
            </Badge>
          ))}
          {user.role_names.length === 0 && (
            <span className="text-muted-foreground text-sm">No roles</span>
          )}
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      width: 150,
      filterable: true,
      render: (user) => (
        <span className="text-sm">{user.phone || "N/A"}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      width: 120,
      sortable: true,
      filterable: true,
      filterType: "select",
      render: (user) => (
        <Badge variant={user.is_active ? "default" : "secondary"}>
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "last_login_at",
      label: "Last Login",
      width: 150,
      sortable: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user.last_login_at
            ? new Date(user.last_login_at).toLocaleDateString()
            : "Never"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      width: 130,
      sortable: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  // Handle user selection from the table
  const handleUserSelection = (userIds: string[]) => {
    console.log("Selected users:", userIds);
  };

  // Handle bulk actions from the table
  const handleBulkAction = (action: string, userIds: string[]) => {
    const selectedUsers = transformedUsers.filter(user => userIds.includes(user.id));

    switch (action) {
      case "email":
        showAlert({
          title: "Email Functionality",
          description: `Email functionality for ${userIds.length} user(s) would be implemented here.`
        });
        break;
      case "delete":
        if (canPerformAdminActions) {
          setBulkDeleteUserIds(userIds);
        setBulkDeleteDialogOpen(true);
        } else {
          setBulkDeleteUserIds(userIds);
        setBulkDeleteDialogOpen(true);
        }
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  // Action handlers for the advanced table
  const handleUserEdit = (user: UserData) => {
    const userFound = users?.find((u: UserWithRoles) => u.id.toString() === user.id);
    if (userFound) {
      handleEdit(userFound);
    }
  };

  const handleUserDelete = (user: UserData) => {
    const userFound = users?.find((u: UserWithRoles) => u.id.toString() === user.id);
    if (userFound) {
      setCurrentUser(userFound);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleUserView = (user: UserData) => {
    console.log("View user details:", user.username);
  };

  const handleUserToggleStatus = (user: UserData) => {
    console.log("Toggle status for user:", user.username);
  };

  const handleUserManageRoles = (user: UserData) => {
    const userFound = users?.find((u: UserWithRoles) => u.id.toString() === user.id);
    if (userFound) {
      console.log("Manage roles for:", userFound.username);
    }
  };

  const getDisplayName = (user: UserWithRoles) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  // If user doesn't have access to users page, show access denied
  if (!canAccessUsersPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Users page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Only Super Admins, Admins, and Managers can view user information.
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
          <p className="text-muted-foreground">Loading users...</p>
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
              {!canPerformAdminActions && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">(Read Only)</span>
              )}
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={fetchUsers} variant="outline" size="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {canPerformAdminActions && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new user account.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="First name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="Last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username*</FormLabel>
                              <FormControl>
                                <Input placeholder="Username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email*</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password*</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password*</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Confirm password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                                <FormDescription>
                                  User can log in and access the system
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

                        <FormField
                          control={createForm.control}
                          name="isAdmin"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Administrator</FormLabel>
                                <FormDescription>
                                  User has full admin privileges
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
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create User
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
                You have view-only access to user information. To create, edit, or delete users, contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{transformedUsers.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {transformedUsers.filter(u => u.is_active).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">With Roles</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {transformedUsers.filter(u => u.role_names && u.role_names.length > 0).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Users Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <AdvancedTable
              data={transformedUsers}
              columns={columnConfig}
              loading={loading}
              title="Users Directory"
              onRowSelect={handleUserSelection}
              onBulkAction={handleBulkAction}
              onRowEdit={canPerformAdminActions ? handleUserEdit : undefined}
              onRowDelete={canPerformAdminActions ? handleUserDelete : undefined}
              onRowView={handleUserView}
              onRowToggleStatus={canPerformAdminActions ? handleUserToggleStatus : undefined}
              onRowAction={(action, user) => {
                if (action === 'manageRoles') {
                  handleUserManageRoles(user);
                }
              }}
              actions={{
                view: { label: "View Details" },
                edit: canPerformAdminActions ? { label: "Edit User" } : undefined,
                delete: canPerformAdminActions ? { label: "Delete User" } : undefined,
                manageRoles: canPerformAdminActions ? { label: "Manage Roles" } : undefined,
              }}
              bulkActions={canPerformAdminActions ? [
                { label: "Delete", action: "delete", icon: <Trash2 className="h-4 w-4 mr-2" /> },
                { label: "Email", action: "email", icon: <Settings className="h-4 w-4 mr-2" /> },
              ] : []}
              emptyMessage="No users found"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username*</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email*</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Leave blank to keep current"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank to keep current password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          User can log in and access the system
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

                <FormField
                  control={editForm.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Administrator</FormLabel>
                        <FormDescription>
                          User has full admin privileges
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
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Update User
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
        title="Delete User Permanently"
        description={`Are you sure you want to permanently delete "${currentUser?.username}" (${currentUser?.email})? This action cannot be undone and will remove all associated data from the database.`}
        loading={isDeleteLoading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {!canPerformAdminActions ? "Permission Denied" : "Delete Multiple Users"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!canPerformAdminActions
                ? "You don't have permission to delete users. Only Super Admins can perform this action."
                : `Are you sure you want to permanently delete ${bulkDeleteUserIds.length} user(s)? This action cannot be undone and will remove all associated data from the database.`
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
                Delete {bulkDeleteUserIds.length} User(s)
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertComponent />
    </div>
  );
}