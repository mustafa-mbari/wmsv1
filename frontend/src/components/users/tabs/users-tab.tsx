"use client";

// Enhanced Users Tab - Layer 1: UI Component using the layered architecture
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
  Search,
  Edit,
  Trash2,
  User,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Layer 2: Custom Hooks
import {
  useUsers,
  useUserMutations,
  useUserState,
  useUserSearch
} from "@/hooks/use-users";

// Types
import { User as UserType } from "@/types/api";

// Form schemas
const userFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Valid email is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  roles: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userFormSchema>;

export function UsersTab() {
  // Layer 2: Custom Hooks for state management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // User state management
  const {
    selectedUsers,
    currentUser,
    selectUser,
    clearSelection,
    setCurrentUser,
    hasSelection,
    selectionCount
  } = useUserState();

  // Data fetching with React Query
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch
  } = useUsers({
    page: currentPage,
    limit: 10,
    search: searchTerm
  });

  // Mutations
  const {
    createUser,
    updateUser,
    deleteUser,
    bulkOperations
  } = useUserMutations();

  // Search functionality
  const { updateSearch, clearSearch } = useUserSearch();

  // Forms
  const createForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      roles: [],
      is_active: true,
    },
  });

  const editForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
  });

  // Event handlers
  const handleCreateUser = async (data: UserFormData) => {
    await createUser.mutateAsync(data);
    setIsCreateDialogOpen(false);
    createForm.reset();
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!currentUser) return;

    await updateUser.mutateAsync({
      id: currentUser.id,
      data
    });
    setIsEditDialogOpen(false);
    setCurrentUser(null);
    editForm.reset();
  };

  const handleDeleteUser = async (user: UserType) => {
    await deleteUser.mutateAsync(user.id);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    await bulkOperations.mutateAsync({
      operation: 'delete',
      users: selectedUsers.map(u => ({ id: u.id }))
    });
    clearSelection();
  };

  const openEditDialog = (user: UserType) => {
    setCurrentUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || "",
      roles: user.roles || [],
      is_active: user.is_active,
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
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">Error loading users</span>
        <Button onClick={() => refetch()} variant="outline" className="ml-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const users = usersResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
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
              title="Delete Selected Users"
              description={`Are you sure you want to delete ${selectionCount} selected users? This action cannot be undone.`}
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
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createUser.isPending}
                    >
                      {createUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create User
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.some(u => u.id === user.id)}
                    onChange={() => selectUser(user)}
                    className="rounded"
                  />
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <HardDeleteConfirmationDialog
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title="Delete User"
                    description={`Are you sure you want to delete "${user.username}"?`}
                    onConfirm={() => handleDeleteUser(user)}
                    loading={deleteUser.isPending}
                  />
                </div>
              </div>
              <CardTitle className="text-lg">{user.first_name} {user.last_name}</CardTitle>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {user.roles && user.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first user.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={updateUser.isPending}
                >
                  {updateUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}