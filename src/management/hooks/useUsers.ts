// Custom hook for user management operations

import { useState, useEffect, useCallback } from 'react';
import { useUserManagement } from '../context/UserManagementContext';
import { useManagement } from '../context/ManagementContext';
import { useRoles } from './useRoles';
import { validateUpdateUserForm } from '../utils/validators';
import type { 
  ManagementUser, 
  UserDetails, 
  UserFilters, 
 
  UpdateUserRequest 
} from '../types/user';

export interface UseUsersOptions {
  autoLoad?: boolean;
  pageSize?: number;
}

export interface UseUsersReturn {
  // Data
  users: ManagementUser[];
  selectedUser: UserDetails | null;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  pagination: any; // PaginationInfo | null
  
  // Loading states
  isLoading: boolean;
  isLoadingUser: boolean;
  isLoadingNewPage: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  userError: string | null;
  
  // Filters and search
  filters: UserFilters;
  searchQuery: string;
  searchResults: Pick<ManagementUser, 'id' | 'email' | 'name' | 'role' | 'avatar_url'>[];
  isSearching: boolean;
  
  // Selection
  selectedUserIds: string[];
  selectedCount: number;
  isUserSelected: (userId: string) => boolean;
  
  // Operations
  loadUsers: (page?: number) => Promise<void>;
  loadUser: (userId: string) => Promise<void>;
  loadNextPage: () => Promise<void>;
  updateUser: (userId: string, userData: UpdateUserRequest) => Promise<boolean>;
  deactivateUser: (userId: string, reason?: string) => Promise<boolean>;
  activateUser: (userId: string, reason?: string) => Promise<boolean>;
  deleteUser: (userId: string, reason?: string) => Promise<boolean>;
  
  // Filters and search
  setFilters: (filters: UserFilters) => void;
  clearFilters: () => void;
  searchUsers: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Selection
  toggleUserSelection: (userId: string) => void;
  selectAllUsers: (selected: boolean) => void;
  clearSelection: () => void;
  
  // Pagination
  goToPage: (page: number) => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPrevPage: () => Promise<void>;
  
  // Utility
  refresh: () => Promise<void>;
  clearErrors: () => void;
  
  // Form validation
  validateUpdateForm: (data: UpdateUserRequest) => { isValid: boolean; errors: Record<string, string> };
}

export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  const { autoLoad = true, pageSize = 50 } = options;
  
  const userManagement = useUserManagement();
  const management = useManagement();
  const { manageableRoles } = useRoles();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-load users on mount only if not already loaded
  useEffect(() => {
    const hasUsersData = userManagement.state.users.length > 0;
    const hasFirstPage = userManagement.state.cachedPages.has(1);
    const isCurrentlyLoading = userManagement.state.isLoading;
    const hasData = hasUsersData || hasFirstPage;
    
    if (autoLoad && management.canAccessManagement && !hasData && !isCurrentlyLoading) {
      userManagement.loadUsers(1, pageSize);
    }
  }, [autoLoad, management.canAccessManagement, pageSize, userManagement.state.users.length, userManagement.state.isLoading]);

  const loadUsers = useCallback(async (page: number = 1) => {
    await userManagement.loadUsers(page, pageSize);
  }, [pageSize]); // Remove userManagement from deps

  const loadUser = useCallback(async (userId: string) => {
    await userManagement.loadUserDetails(userId);
  }, []);


  const updateUser = useCallback(async (userId: string, userData: UpdateUserRequest): Promise<boolean> => {
    if (!management.canPerformOperation('edit_user')) {
      return false;
    }

    setIsUpdating(true);
    try {
      const result = await userManagement.updateUser(userId, userData);
      return result;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deactivateUser = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    if (!management.canPerformOperation('delete_user')) {
      return false;
    }

    setIsDeleting(true);
    try {
      const result = await userManagement.deactivateUser(userId, reason);
      return result;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const activateUser = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    if (!management.canPerformOperation('edit_user')) {
      return false;
    }

    setIsUpdating(true);
    try {
      const result = await userManagement.activateUser(userId, reason);
      return result;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    // This is the same as deactivateUser since we do soft deletes
    return deactivateUser(userId, reason);
  }, [deactivateUser]);

  const setFilters = useCallback((filters: UserFilters) => {
    userManagement.setFilters(filters);
    // Reload users with new filters
    userManagement.loadUsers(1, pageSize);
  }, [pageSize]);

  const clearFilters = useCallback(() => {
    userManagement.setFilters({});
    userManagement.loadUsers(1, pageSize);
  }, [pageSize]);

  const searchUsers = useCallback(async (query: string) => {
    await userManagement.searchUsers(query);
  }, []);

  const clearSearch = useCallback(() => {
    userManagement.clearSearch();
  }, []);

  const toggleUserSelection = useCallback((userId: string) => {
    userManagement.toggleUserSelection(userId);
  }, []);

  const selectAllUsers = useCallback((selected: boolean) => {
    userManagement.selectAllUsers(selected);
  }, []);

  const clearSelection = useCallback(() => {
    userManagement.clearSelection();
  }, []);

  const goToPage = useCallback(async (page: number) => {
    await userManagement.loadUsers(page, pageSize);
  }, [pageSize]);

  const goToNextPage = useCallback(async () => {
    const currentPage = userManagement.state.pagination?.page || 1;
    const hasNext = userManagement.state.pagination?.has_next || false;
    
    if (hasNext) {
      await goToPage(currentPage + 1);
    }
  }, [userManagement.state.pagination, goToPage]);

  const goToPrevPage = useCallback(async () => {
    const currentPage = userManagement.state.pagination?.page || 1;
    const hasPrev = userManagement.state.pagination?.has_prev || false;
    
    if (hasPrev) {
      await goToPage(currentPage - 1);
    }
  }, [userManagement.state.pagination, goToPage]);

  const refresh = useCallback(async () => {
    await userManagement.refreshUsers();
  }, []);

  const clearErrors = useCallback(() => {
    userManagement.clearError();
  }, []);


  const validateUpdateForm = useCallback((data: UpdateUserRequest) => {
    return validateUpdateUserForm(data);
  }, []);

  // Derived state
  const pagination = userManagement.state.pagination;
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.pages || 1;
  const hasNextPage = pagination?.has_next || false;
  const hasPrevPage = pagination?.has_prev || false;

  return {
    // Data
    users: userManagement.state.users,
    selectedUser: userManagement.state.selectedUser,
    totalUsers: userManagement.state.totalUsers,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    pagination: userManagement.state.pagination,
    
    // Loading states
    isLoading: userManagement.state.isLoading,
    isLoadingUser: userManagement.state.selectedUserLoading,
    isLoadingNewPage: userManagement.state.isLoadingNewPage,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error states
    error: userManagement.state.error,
    userError: userManagement.state.selectedUserError,
    
    // Filters and search
    filters: userManagement.state.filters,
    searchQuery: userManagement.state.searchQuery,
    searchResults: userManagement.state.searchResults,
    isSearching: userManagement.state.searchLoading,
    
    // Selection
    selectedUserIds: userManagement.state.selectedUserIds,
    selectedCount: userManagement.getSelectedUsersCount(),
    isUserSelected: userManagement.isUserSelected,
    
    // Operations
    loadUsers,
    loadUser,
    loadNextPage: userManagement.loadNextPage,
    updateUser,
    deactivateUser,
    activateUser,
    deleteUser,
    
    // Filters and search
    setFilters,
    clearFilters,
    searchUsers,
    clearSearch,
    
    // Selection
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    
    // Pagination
    goToPage,
    goToNextPage,
    goToPrevPage,
    
    // Utility
    refresh,
    clearErrors,
    
    // Form validation
    validateUpdateForm,
  };
};