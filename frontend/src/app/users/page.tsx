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
  XCircle
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdvancedUserTable, UserData } from "@/components/ui/advanced-user-table";

// Extended User type with role information from the API
export interface UserWithRoles {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  isAdmin?: boolean;
  defaultWarehouseId?: string;
  lastLogin?: string | Date;
  createdAt?: string | Date;
  role_names?: string[];
  role_slugs?: string[];
}

export default function UsersPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("_all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserWithRoles | null>(null);
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Check if user can access this page
  const canAccessUsersPage = isSuperAdmin() || isAdmin() || hasRole('manager');
  
  // Check if user can perform admin actions (create, edit, delete, role management)
  const canPerformAdminActions = isSuperAdmin();

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

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const onCreateSubmit = async (data: z.infer<typeof userFormSchema>) => {
    try {
      if (!data.password) {
        alert("Please enter a password for the new user");
        return;
      }
      const { confirmPassword, ...userData } = data;
      await apiClient.post("/api/register", userData);
      alert("User created successfully");
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const onEditSubmit = async (data: z.infer<typeof userFormSchema>) => {
    if (!currentUser) return;
    
    try {
      const { password, confirmPassword, ...restData } = data;
      const updateData = password ? { ...restData, password } : restData;
      
      await apiClient.put(`/api/users/${currentUser.id}`, updateData);
      alert("User updated successfully");
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const confirmDelete = async () => {
    if (currentUser) {
      try {
        await apiClient.delete(`/api/users/${currentUser.id}`);
        alert("User deleted successfully");
        setIsDeleteDialogOpen(false);
        setCurrentUser(null);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleEdit = (user: UserWithRoles) => {
    setCurrentUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      country: user.country || "",
      isActive: user.isActive,
      isAdmin: user.isAdmin || false,
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
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      phone: user.phone || "",
      is_active: user.isActive ?? true,
      email_verified: false, // This field doesn't exist in the schema, set default
      last_login_at: user.lastLogin ? (typeof user.lastLogin === 'string' ? user.lastLogin : new Date(user.lastLogin).toISOString()) : undefined,
      created_at: user.createdAt ? (typeof user.createdAt === 'string' ? user.createdAt : new Date(user.createdAt).toISOString()) : new Date().toISOString(),
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

  // Handle user selection from the table
  const handleUserSelection = (userIds: string[]) => {
    console.log("Selected users:", userIds);
  };

  // Handle bulk actions from the table
  const handleBulkAction = (action: string, userIds: string[]) => {
    const selectedUsers = transformedUsers.filter(user => userIds.includes(user.id));
    
    switch (action) {
      case "email":
        alert(`Email functionality for ${userIds.length} user(s) would be implemented here.`);
        break;
      case "delete":
        if (canPerformAdminActions) {
          alert(`Bulk delete for ${userIds.length} user(s) would be implemented here.`);
        } else {
          alert("You don't have permission to delete users.");
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
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              User Management {!canPerformAdminActions && <span className="text-muted-foreground text-xl">(Read Only)</span>}
            </h1>
            <p className="text-muted-foreground">
              {canPerformAdminActions 
                ? "Manage users and their permissions" 
                : "View user information (read-only access)"
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={fetchUsers} variant="outline" className="sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            {canPerformAdminActions && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add User
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
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Read-Only Access
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                You can view user information but cannot create, edit, or delete users. Contact a Super Admin to make changes to user accounts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-6">
          <AdvancedUserTable
            data={transformedUsers}
            loading={loading}
            onUserSelect={handleUserSelection}
            onBulkAction={handleBulkAction}
            onUserEdit={handleUserEdit}
            onUserDelete={handleUserDelete}
            onUserView={handleUserView}
            onUserManageRoles={handleUserManageRoles}
            onUserToggleStatus={handleUserToggleStatus}
          />
        </div>
      </div>

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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{currentUser?.username}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-900">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Warning: This will permanently remove the user account and all associated data.
              Consider deactivating the account instead.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}