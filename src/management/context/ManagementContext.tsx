// Main management context that fetches permissions from backend

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { roleManagementService } from '../services/roleManagementService';
import { setAuthLogoutCallback } from '../services/managementApiService';
import type { UserRole } from '../types/role';

interface RoleHierarchy {
  roles: Array<{
    name: string;
    level: number;
    permissions: string[];
  }>;
  levels: Record<string, number>;
  permissions: Record<string, string[]>;
}

interface ManagementState {
  isManagementEnabled: boolean;
  canAccessManagement: boolean;
  currentUser: any;
  currentUserRole: UserRole | null;
  roleHierarchy: RoleHierarchy | null;
  isLoading: boolean;
  error: string | null;
}

interface ManagementContextType extends ManagementState {
  refreshPermissions: () => Promise<void>;
  clearError: () => void;
  canPerformOperation: (operation: string) => boolean;
  canManageRole: (targetRole: UserRole) => boolean;
}

const initialState: ManagementState = {
  isManagementEnabled: false,
  canAccessManagement: false,
  currentUser: null,
  currentUserRole: null,
  roleHierarchy: null,
  isLoading: true,
  error: null,
};

const ManagementContext = createContext<ManagementContextType | undefined>(undefined);

export const useManagement = () => {
  const context = useContext(ManagementContext);
  if (!context) {
    throw new Error('useManagement must be used within a ManagementProvider');
  }
  return context;
};

interface ManagementProviderProps {
  children: ReactNode;
}

export const ManagementProvider: React.FC<ManagementProviderProps> = ({ children }) => {
  const [state, setState] = useState<ManagementState>(initialState);
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  // Set up logout callback for management API service
  useEffect(() => {
    setAuthLogoutCallback(logout);
  }, [logout]);

  // Initialize management state when authentication is ready
  useEffect(() => {
    const initializeManagement = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check if management is enabled
        const isEnabled = import.meta.env.VITE_MANAGEMENT_ENABLED !== 'false';
        
        if (!isEnabled) {
          setState(prev => ({
            ...prev,
            isManagementEnabled: false,
            canAccessManagement: false,
            isLoading: false,
          }));
          return;
        }

        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          setState(prev => ({
            ...prev,
            isManagementEnabled: true,
            canAccessManagement: false,
            isLoading: false,
          }));
          return;
        }

        const userRole = user.role as UserRole;
        
        // Check if user has management access (admin, moderator, owner)
        const hasAccess = ['admin', 'moderator', 'owner'].includes(userRole);

        if (!hasAccess) {
          setState(prev => ({
            ...prev,
            isManagementEnabled: true,
            canAccessManagement: false,
            currentUser: user,
            currentUserRole: userRole,
            isLoading: false,
          }));
          return;
        }

        // Fetch role hierarchy from backend
        const rolesResponse = await roleManagementService.getRoles();

        if (!rolesResponse.success) {
          throw new Error('Failed to fetch role hierarchy');
        }

        setState(prev => ({
          ...prev,
          isManagementEnabled: true,
          canAccessManagement: true,
          currentUser: user,
          currentUserRole: userRole,
          roleHierarchy: rolesResponse.data,
          isLoading: false,
          error: null,
        }));

      } catch (error) {
        console.error('Management initialization failed:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize management system',
        }));
      }
    };

    // Only initialize when auth is ready
    if (!authLoading) {
      initializeManagement();
    }
  }, [isAuthenticated, user, authLoading]);

  const refreshPermissions = async () => {
    if (!user || !isAuthenticated) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const rolesResponse = await roleManagementService.getRoles();

      if (!rolesResponse.success) {
        throw new Error('Failed to refresh role hierarchy');
      }

      setState(prev => ({
        ...prev,
        roleHierarchy: rolesResponse.data,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to refresh permissions',
      }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const canPerformOperation = (operation: string): boolean => {
    if (!state.currentUserRole || !state.roleHierarchy) return false;
    
    // Get user's permissions from the fetched role hierarchy
    const userPermissions = state.roleHierarchy.permissions[state.currentUserRole] || [];
    return userPermissions.includes(operation);
  };

  const canManageRole = (targetRole: UserRole): boolean => {
    if (!state.currentUserRole || !state.roleHierarchy) return false;
    
    const currentUserLevel = state.roleHierarchy.levels[state.currentUserRole] || 0;
    const targetRoleLevel = state.roleHierarchy.levels[targetRole] || 0;
    
    // Can only manage roles with lower level than current user
    return currentUserLevel > targetRoleLevel;
  };

  const contextValue: ManagementContextType = {
    ...state,
    refreshPermissions,
    clearError,
    canPerformOperation,
    canManageRole,
  };

  return (
    <ManagementContext.Provider value={contextValue}>
      {children}
    </ManagementContext.Provider>
  );
};

export default ManagementProvider;