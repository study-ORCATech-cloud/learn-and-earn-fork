// Main management context for global management state

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { roleManagementService } from '../services/roleManagementService';
import { canAccessManagement, getEffectivePermissions } from '../utils/permissions';
import type { UserRole, UserPermissions, ManageableRoles } from '../types/role';

interface ManagementState {
  isManagementEnabled: boolean;
  canAccessManagement: boolean;
  currentUserRole: UserRole | null;
  currentUserPermissions: UserPermissions | null;
  manageableRoles: ManageableRoles | null;
  isLoading: boolean;
  error: string | null;
}

interface ManagementContextType extends ManagementState {
  refreshPermissions: () => Promise<void>;
  clearError: () => void;
  checkPermission: (permission: string) => boolean;
  canManageRole: (targetRole: UserRole) => boolean;
  canPerformOperation: (operation: string, targetRole?: UserRole) => boolean;
}

const initialState: ManagementState = {
  isManagementEnabled: false,
  canAccessManagement: false,
  currentUserRole: null,
  currentUserPermissions: null,
  manageableRoles: null,
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Initialize management state when authentication is ready
  useEffect(() => {
    const initializeManagement = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check if management is enabled
        const isEnabled = import.meta.env.VITE_MANAGEMENT_ENABLED === 'true';
        
        if (!isEnabled) {
          setState(prev => ({
            ...prev,
            isManagementEnabled: false,
            canAccessManagement: false,
            isLoading: false,
          }));
          return;
        }

        // Check if user is authenticated and has management access
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
        const hasAccess = canAccessManagement(userRole);

        if (!hasAccess) {
          setState(prev => ({
            ...prev,
            isManagementEnabled: true,
            canAccessManagement: false,
            currentUserRole: userRole,
            isLoading: false,
          }));
          return;
        }

        // Load user permissions and manageable roles
        const [permissionsResponse, manageableRolesResponse] = await Promise.all([
          roleManagementService.getUserPermissions(user.id),
          roleManagementService.getManageableRoles(),
        ]);

        setState(prev => ({
          ...prev,
          isManagementEnabled: true,
          canAccessManagement: true,
          currentUserRole: userRole,
          currentUserPermissions: permissionsResponse.success ? permissionsResponse.data : null,
          manageableRoles: manageableRolesResponse.success ? manageableRolesResponse.data : null,
          isLoading: false,
          error: permissionsResponse.success && manageableRolesResponse.success 
            ? null 
            : 'Failed to load management permissions',
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

      const [permissionsResponse, manageableRolesResponse] = await Promise.all([
        roleManagementService.getUserPermissions(user.id),
        roleManagementService.getManageableRoles(),
      ]);

      setState(prev => ({
        ...prev,
        currentUserPermissions: permissionsResponse.success ? permissionsResponse.data : null,
        manageableRoles: manageableRolesResponse.success ? manageableRolesResponse.data : null,
        isLoading: false,
        error: permissionsResponse.success && manageableRolesResponse.success 
          ? null 
          : 'Failed to refresh permissions',
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

  const checkPermission = (permission: string): boolean => {
    if (!state.currentUserPermissions) return false;
    return state.currentUserPermissions.permissions.includes(permission);
  };

  const canManageRoleHelper = (targetRole: UserRole): boolean => {
    if (!state.manageableRoles) return false;
    return state.manageableRoles.manageable_roles.includes(targetRole);
  };

  const canPerformOperation = (operation: string, targetRole?: UserRole): boolean => {
    if (!state.currentUserRole) return false;
    
    // Use utility function for operation validation
    const { validateOperation } = require('../utils/permissions');
    return validateOperation(
      state.currentUserRole,
      operation,
      targetRole,
      user?.id,
    );
  };

  const contextValue: ManagementContextType = {
    ...state,
    refreshPermissions,
    clearError,
    checkPermission,
    canManageRole: canManageRoleHelper,
    canPerformOperation,
  };

  return (
    <ManagementContext.Provider value={contextValue}>
      {children}
    </ManagementContext.Provider>
  );
};

export default ManagementProvider;