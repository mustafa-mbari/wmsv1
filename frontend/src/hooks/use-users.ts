// User Hooks - Layer 2: React-specific state management and caching
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { User, ApiResponse } from '@/types/api';
import { toast } from '@/hooks/use-toast';

// Query keys for React Query
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: any) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

/**
 * Hook for managing users list with pagination and filtering
 */
export function useUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  roles?: string[];
  department?: string;
  is_active?: boolean;
}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for getting a single user
 */
export function useUser(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for current user profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => userService.getCurrentUser(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for user mutations (create, update, delete)
 */
export function useUserMutations() {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: (userData: Partial<User>) => userService.createUser(userData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create user',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.updateUser(id, data),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update user',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (response, id) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        queryClient.removeQueries({ queryKey: userKeys.detail(id) });
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete user',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });

  const updateProfile = useMutation({
    mutationFn: ({ id, profileData }: { id: string; profileData: any }) =>
      userService.updateProfile(id, profileData),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile() });
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
      }
    },
  });

  const changePassword = useMutation({
    mutationFn: ({ id, passwordData }: { id: string; passwordData: any }) =>
      userService.changePassword(id, passwordData),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        });
      }
    },
  });

  const updateUserRoles = useMutation({
    mutationFn: ({ id, rolesData }: { id: string; rolesData: any }) =>
      userService.updateUserRoles(id, rolesData),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
        toast({
          title: 'Success',
          description: 'User roles updated successfully',
        });
      }
    },
  });

  const bulkOperations = useMutation({
    mutationFn: ({ operation, users }: { operation: 'activate' | 'deactivate' | 'delete'; users: any[] }) =>
      userService.bulkOperations(operation, users),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        toast({
          title: 'Success',
          description: `Bulk ${response.data?.operation} completed. ${response.data?.successful} successful, ${response.data?.failed} failed.`,
        });
      }
    },
  });

  return {
    createUser,
    updateUser,
    deleteUser,
    updateProfile,
    changePassword,
    updateUserRoles,
    bulkOperations,
  };
}

/**
 * Hook for user search with debouncing
 */
export function useUserSearch() {
  const [searchQuery, setSearchQuery] = useState<any>({});
  const [debouncedQuery, setDebouncedQuery] = useState<any>({});

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchResult = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => userService.getUsers(debouncedQuery),
    enabled: Object.keys(debouncedQuery).length > 0,
  });

  const updateSearch = useCallback((newQuery: any) => {
    setSearchQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery({});
    setDebouncedQuery({});
  }, []);

  return {
    searchQuery,
    searchResult,
    updateSearch,
    clearSearch,
    isSearching: searchResult.isFetching,
  };
}

/**
 * Hook for local user state management
 */
export function useUserState() {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<any>({});

  const selectUser = useCallback((user: User) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  }, []);

  const selectAllUsers = useCallback((users: User[]) => {
    setSelectedUsers(users);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const updateFilters = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    selectedUsers,
    currentUser,
    filters,
    selectUser,
    selectAllUsers,
    clearSelection,
    setCurrentUser,
    updateFilters,
    clearFilters,
    hasSelection: selectedUsers.length > 0,
    selectionCount: selectedUsers.length,
  };
}