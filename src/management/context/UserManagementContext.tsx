// User management context for user list state and operations

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { userManagementService } from '../services/userManagementService';
import type { 
  ManagementUser, 
  UserDetails, 
  UserFilters, 
  UserSortConfig,
  BulkUserOperationRequest 
} from '../types/user';
import type { PaginationInfo, BulkOperationResult } from '../types/management';
import { PAGINATION_DEFAULTS } from '../utils/constants';

interface UserManagementState {
  // User list state
  users: ManagementUser[];
  totalUsers: number;
  pagination: PaginationInfo | null;
  filters: UserFilters;
  sort: UserSortConfig;
  isLoading: boolean;
  error: string | null;

  // Selected user details
  selectedUser: UserDetails | null;
  selectedUserLoading: boolean;
  selectedUserError: string | null;

  // Bulk operations
  selectedUserIds: string[];
  bulkOperationInProgress: boolean;
  bulkOperationResults: BulkOperationResult | null;

  // Search
  searchQuery: string;
  searchResults: ManagementUser[];
  searchLoading: boolean;
}

type UserManagementAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: { users: ManagementUser[]; pagination: PaginationInfo; totalUsers: number } }
  | { type: 'SET_FILTERS'; payload: UserFilters }
  | { type: 'SET_SORT'; payload: UserSortConfig }
  | { type: 'SET_SELECTED_USER'; payload: UserDetails | null }
  | { type: 'SET_SELECTED_USER_LOADING'; payload: boolean }
  | { type: 'SET_SELECTED_USER_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_USER_IDS'; payload: string[] }
  | { type: 'TOGGLE_USER_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_USERS'; payload: boolean }
  | { type: 'SET_BULK_OPERATION_IN_PROGRESS'; payload: boolean }
  | { type: 'SET_BULK_OPERATION_RESULTS'; payload: BulkOperationResult | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: ManagementUser[] }
  | { type: 'SET_SEARCH_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: ManagementUser }
  | { type: 'REMOVE_USER'; payload: string };

const initialState: UserManagementState = {
  users: [],
  totalUsers: 0,
  pagination: null,
  filters: {},
  sort: { field: 'created_at', direction: 'desc' },
  isLoading: false,
  error: null,
  selectedUser: null,
  selectedUserLoading: false,
  selectedUserError: null,
  selectedUserIds: [],
  bulkOperationInProgress: false,
  bulkOperationResults: null,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
};

function userManagementReducer(state: UserManagementState, action: UserManagementAction): UserManagementState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USERS':
      return { 
        ...state, 
        users: action.payload.users,
        pagination: action.payload.pagination,
        totalUsers: action.payload.totalUsers,
        isLoading: false,
        error: null,
      };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: action.payload,
        selectedUserIds: [], // Clear selection when filters change
      };
    
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    
    case 'SET_SELECTED_USER':
      return { ...state, selectedUser: action.payload };
    
    case 'SET_SELECTED_USER_LOADING':
      return { ...state, selectedUserLoading: action.payload };
    
    case 'SET_SELECTED_USER_ERROR':
      return { ...state, selectedUserError: action.payload };
    
    case 'SET_SELECTED_USER_IDS':
      return { ...state, selectedUserIds: action.payload };
    
    case 'TOGGLE_USER_SELECTION':
      const userId = action.payload;
      const isSelected = state.selectedUserIds.includes(userId);
      return {
        ...state,
        selectedUserIds: isSelected
          ? state.selectedUserIds.filter(id => id !== userId)
          : [...state.selectedUserIds, userId],
      };
    
    case 'SELECT_ALL_USERS':
      return {
        ...state,
        selectedUserIds: action.payload 
          ? state.users.map(user => user.id)
          : [],
      };
    
    case 'SET_BULK_OPERATION_IN_PROGRESS':
      return { ...state, bulkOperationInProgress: action.payload };
    
    case 'SET_BULK_OPERATION_RESULTS':
      return { ...state, bulkOperationResults: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    
    case 'SET_SEARCH_LOADING':
      return { ...state, searchLoading: action.payload };
    
    case 'UPDATE_USER':
      const updatedUser = action.payload;
      return {
        ...state,
        users: state.users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ),
        selectedUser: state.selectedUser?.id === updatedUser.id 
          ? { ...state.selectedUser, ...updatedUser }
          : state.selectedUser,
      };
    
    case 'REMOVE_USER':
      const removedUserId = action.payload;
      return {
        ...state,
        users: state.users.filter(user => user.id !== removedUserId),
        selectedUserIds: state.selectedUserIds.filter(id => id !== removedUserId),
        selectedUser: state.selectedUser?.id === removedUserId ? null : state.selectedUser,
        totalUsers: state.totalUsers - 1,
      };
    
    default:
      return state;
  }
}

interface UserManagementContextType {
  state: UserManagementState;
  
  // User list operations
  loadUsers: (page?: number, limit?: number) => Promise<void>;
  setFilters: (filters: UserFilters) => void;
  setSort: (sort: UserSortConfig) => void;
  refreshUsers: () => Promise<void>;
  
  // User details operations
  loadUserDetails: (userId: string) => Promise<void>;
  clearSelectedUser: () => void;
  
  // User CRUD operations
  createUser: (userData: any) => Promise<boolean>;
  updateUser: (userId: string, userData: any) => Promise<boolean>;
  deactivateUser: (userId: string, reason?: string) => Promise<boolean>;
  activateUser: (userId: string, reason?: string) => Promise<boolean>;
  
  // Selection operations
  toggleUserSelection: (userId: string) => void;
  selectAllUsers: (selected: boolean) => void;
  clearSelection: () => void;
  
  // Bulk operations
  performBulkOperation: (operation: BulkUserOperationRequest) => Promise<boolean>;
  clearBulkResults: () => void;
  
  // Search operations
  searchUsers: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Utility functions
  clearError: () => void;
  isUserSelected: (userId: string) => boolean;
  getSelectedUsersCount: () => number;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};

interface UserManagementProviderProps {
  children: ReactNode;
}

export const UserManagementProvider: React.FC<UserManagementProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userManagementReducer, initialState);

  const loadUsers = useCallback(async (
    page: number = PAGINATION_DEFAULTS.PAGE,
    limit: number = PAGINATION_DEFAULTS.LIMIT
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await userManagementService.getUsers(page, limit, state.filters);
      
      if (response.success && response.data) {
        dispatch({
          type: 'SET_USERS',
          payload: {
            users: response.data.users,
            pagination: response.data.pagination,
            totalUsers: response.data.pagination.total,
          },
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to load users' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load users' });
    }
  }, [state.filters]);

  const setFilters = useCallback((filters: UserFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSort = useCallback((sort: UserSortConfig) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  const refreshUsers = useCallback(async () => {
    const currentPage = state.pagination?.page || 1;
    const currentLimit = state.pagination?.per_page || PAGINATION_DEFAULTS.LIMIT;
    await loadUsers(currentPage, currentLimit);
  }, [loadUsers, state.pagination]);

  const loadUserDetails = useCallback(async (userId: string) => {
    try {
      dispatch({ type: 'SET_SELECTED_USER_LOADING', payload: true });
      dispatch({ type: 'SET_SELECTED_USER_ERROR', payload: null });
      
      const response = await userManagementService.getUserById(userId);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_SELECTED_USER', payload: response.data });
      } else {
        dispatch({ type: 'SET_SELECTED_USER_ERROR', payload: response.message || 'Failed to load user details' });
      }
    } catch (error) {
      dispatch({ type: 'SET_SELECTED_USER_ERROR', payload: 'Failed to load user details' });
    } finally {
      dispatch({ type: 'SET_SELECTED_USER_LOADING', payload: false });
    }
  }, []);

  const clearSelectedUser = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_USER', payload: null });
    dispatch({ type: 'SET_SELECTED_USER_ERROR', payload: null });
  }, []);

  const createUser = useCallback(async (userData: any): Promise<boolean> => {
    try {
      const response = await userManagementService.createUser(userData);
      
      if (response.success) {
        await refreshUsers();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to create user' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create user' });
      return false;
    }
  }, [refreshUsers]);

  const updateUser = useCallback(async (userId: string, userData: any): Promise<boolean> => {
    try {
      const response = await userManagementService.updateUser(userId, userData);
      
      if (response.success && response.data?.user) {
        dispatch({ type: 'UPDATE_USER', payload: response.data.user });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to update user' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update user' });
      return false;
    }
  }, []);

  const deactivateUser = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    try {
      const response = await userManagementService.deactivateUser(userId, reason);
      
      if (response.success) {
        await refreshUsers();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to deactivate user' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to deactivate user' });
      return false;
    }
  }, [refreshUsers]);

  const activateUser = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    try {
      const response = await userManagementService.activateUser(userId, reason);
      
      if (response.success) {
        await refreshUsers();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to activate user' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to activate user' });
      return false;
    }
  }, [refreshUsers]);

  const toggleUserSelection = useCallback((userId: string) => {
    dispatch({ type: 'TOGGLE_USER_SELECTION', payload: userId });
  }, []);

  const selectAllUsers = useCallback((selected: boolean) => {
    dispatch({ type: 'SELECT_ALL_USERS', payload: selected });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_USER_IDS', payload: [] });
  }, []);

  const performBulkOperation = useCallback(async (operation: BulkUserOperationRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_BULK_OPERATION_IN_PROGRESS', payload: true });
      
      const response = await userManagementService.bulkOperations(operation);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_BULK_OPERATION_RESULTS', payload: response.data });
        await refreshUsers();
        clearSelection();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Bulk operation failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Bulk operation failed' });
      return false;
    } finally {
      dispatch({ type: 'SET_BULK_OPERATION_IN_PROGRESS', payload: false });
    }
  }, [refreshUsers, clearSelection]);

  const clearBulkResults = useCallback(() => {
    dispatch({ type: 'SET_BULK_OPERATION_RESULTS', payload: null });
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
      return;
    }

    try {
      dispatch({ type: 'SET_SEARCH_LOADING', payload: true });
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
      
      const response = await userManagementService.searchUsers(query);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: response.data.results });
      } else {
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
      }
    } catch (error) {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
    } finally {
      dispatch({ type: 'SET_SEARCH_LOADING', payload: false });
    }
  }, []);

  const clearSearch = useCallback(() => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const isUserSelected = useCallback((userId: string): boolean => {
    return state.selectedUserIds.includes(userId);
  }, [state.selectedUserIds]);

  const getSelectedUsersCount = useCallback((): number => {
    return state.selectedUserIds.length;
  }, [state.selectedUserIds]);

  const contextValue: UserManagementContextType = {
    state,
    loadUsers,
    setFilters,
    setSort,
    refreshUsers,
    loadUserDetails,
    clearSelectedUser,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    performBulkOperation,
    clearBulkResults,
    searchUsers,
    clearSearch,
    clearError,
    isUserSelected,
    getSelectedUsersCount,
  };

  return (
    <UserManagementContext.Provider value={contextValue}>
      {children}
    </UserManagementContext.Provider>
  );
};

export default UserManagementProvider;