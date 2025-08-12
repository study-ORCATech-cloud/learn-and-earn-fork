// Custom hook for bulk user operations

import { useState, useCallback } from 'react';
import { useUserManagement } from '../context/UserManagementContext';
import { useManagement } from '../context/ManagementContext';
import { validateUserSelection, validateReason } from '../utils/validators';
import type { BulkUserOperationRequest, UserRole } from '../types/user';
import type { BulkOperationResult, BulkOperation } from '../types/management';

export interface BulkOperationOptions {
  operation: BulkOperation;
  userIds: string[];
  role?: UserRole;
  reason?: string;
}

export interface BulkOperationProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
  currentOperation?: string;
}

export interface UseBulkOperationsReturn {
  // State
  isInProgress: boolean;
  results: BulkOperationResult | null;
  progress: BulkOperationProgress | null;
  error: string | null;
  
  // Operations
  performBulkOperation: (options: BulkOperationOptions) => Promise<boolean>;
  performBulkActivate: (userIds: string[], reason?: string) => Promise<boolean>;
  performBulkDeactivate: (userIds: string[], reason?: string) => Promise<boolean>;
  performBulkRoleChange: (userIds: string[], newRole: UserRole, reason?: string) => Promise<boolean>;
  performBulkDelete: (userIds: string[], reason?: string) => Promise<boolean>;
  
  // Progress tracking
  getSuccessRate: () => number;
  getFailureCount: () => number;
  getSuccessCount: () => number;
  hasFailures: () => boolean;
  
  // Validation
  validateOperation: (options: BulkOperationOptions) => { isValid: boolean; errors: string[] };
  canPerformOperation: (operation: BulkOperation, targetRole?: UserRole) => boolean;
  
  // Utility
  clearResults: () => void;
  clearError: () => void;
  formatResults: () => string;
}

export const useBulkOperations = (): UseBulkOperationsReturn => {
  const userManagement = useUserManagement();
  const management = useManagement();
  
  const [progress, setProgress] = useState<BulkOperationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performBulkOperation = useCallback(async (options: BulkOperationOptions): Promise<boolean> => {
    const { operation, userIds, role, reason } = options;
    
    // Validate the operation
    const validation = validateOperation(options);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return false;
    }

    // Check permissions
    const hasPermission = canPerformOperation(operation, role);
    if (!hasPermission) {
      setError('You do not have permission to perform this operation');
      return false;
    }

    try {
      setError(null);
      setProgress({
        total: userIds.length,
        completed: 0,
        failed: 0,
        inProgress: true,
        currentOperation: operation,
      });

      const request: BulkUserOperationRequest = {
        operation,
        user_ids: userIds,
        role,
        reason,
      };

      const success = await userManagement.performBulkOperation(request);
      
      // Always set progress to not in progress after operation completes
      setProgress(prev => prev ? { ...prev, inProgress: false } : null);

      return success;
    } catch (err) {
      setError('Bulk operation failed');
      setProgress(prev => prev ? { ...prev, inProgress: false } : null);
      return false;
    }
  }, [userManagement, management]);

  const performBulkActivate = useCallback(async (userIds: string[], reason?: string): Promise<boolean> => {
    return performBulkOperation({
      operation: 'ACTIVATE',
      userIds,
      reason,
    });
  }, [performBulkOperation]);

  const performBulkDeactivate = useCallback(async (userIds: string[], reason?: string): Promise<boolean> => {
    return performBulkOperation({
      operation: 'DEACTIVATE',
      userIds,
      reason,
    });
  }, [performBulkOperation]);

  const performBulkRoleChange = useCallback(async (
    userIds: string[], 
    newRole: UserRole, 
    reason?: string
  ): Promise<boolean> => {
    return performBulkOperation({
      operation: 'ROLE_CHANGE',
      userIds,
      role: newRole,
      reason,
    });
  }, [performBulkOperation]);

  const performBulkDelete = useCallback(async (userIds: string[], reason?: string): Promise<boolean> => {
    return performBulkOperation({
      operation: 'DELETE',
      userIds,
      reason,
    });
  }, [performBulkOperation]);

  const getSuccessRate = useCallback((): number => {
    const results = userManagement.state.bulkOperationResults;
    if (!results || results.total_users === 0) return 0;
    return results.summary.success_rate;
  }, [userManagement.state.bulkOperationResults]);

  const getFailureCount = useCallback((): number => {
    const results = userManagement.state.bulkOperationResults;
    return results?.summary.failed_count || 0;
  }, [userManagement.state.bulkOperationResults]);

  const getSuccessCount = useCallback((): number => {
    const results = userManagement.state.bulkOperationResults;
    return results?.summary.successful_count || 0;
  }, [userManagement.state.bulkOperationResults]);

  const hasFailures = useCallback((): boolean => {
    return getFailureCount() > 0;
  }, [getFailureCount]);

  const validateOperation = useCallback((options: BulkOperationOptions): { isValid: boolean; errors: string[] } => {
    const { operation, userIds, role, reason } = options;
    const errors: string[] = [];

    // Validate user selection
    const userValidation = validateUserSelection(userIds);
    if (!userValidation.isValid) {
      errors.push(userValidation.error!);
    }

    // Validate role for role change operations
    if (operation === 'ROLE_CHANGE') {
      if (!role) {
        errors.push('Role is required for role change operations');
      } else if (!management.canManageRole(role)) {
        errors.push(`You cannot assign the ${role} role`);
      }
    }

    // Validate reason for certain operations
    const requiresReason = ['DELETE', 'DEACTIVATE'].includes(operation);
    if (requiresReason) {
      const reasonValidation = validateReason(reason || '', false);
      if (!reasonValidation.isValid) {
        errors.push(reasonValidation.error!);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [management]);

  const canPerformOperation = useCallback((operation: BulkOperation, targetRole?: UserRole): boolean => {
    // Check if user can perform bulk operations
    if (!management.canPerformOperation('bulk_operations')) {
      return false;
    }

    // Check specific operation permissions
    switch (operation) {
      case 'ACTIVATE':
      case 'DEACTIVATE':
      case 'DELETE':
        return management.canPerformOperation('delete_user');
      
      case 'ROLE_CHANGE':
        // For bulk role changes, we need bulk_operations permission and ability to manage the target role
        // Individual change_role permission is for single user role changes
        return targetRole ? management.canManageRole(targetRole) : false;
      
      default:
        return false;
    }
  }, [management]);

  const clearResults = useCallback(() => {
    userManagement.clearBulkResults();
    setProgress(null);
  }, [userManagement]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const formatResults = useCallback((): string => {
    const results = userManagement.state.bulkOperationResults;
    if (!results) return '';

    const { successful_count, failed_count } = results.summary;
    const total = results.total_users;

    if (failed_count === 0) {
      return `All ${total} operations completed successfully`;
    }
    
    if (successful_count === 0) {
      return `All ${total} operations failed`;
    }
    
    return `${successful_count} successful, ${failed_count} failed out of ${total} operations`;
  }, [userManagement.state.bulkOperationResults]);

  return {
    // State
    isInProgress: userManagement.state.bulkOperationInProgress,
    results: userManagement.state.bulkOperationResults,
    progress,
    error,
    
    // Operations
    performBulkOperation,
    performBulkActivate,
    performBulkDeactivate,
    performBulkRoleChange,
    performBulkDelete,
    
    // Progress tracking
    getSuccessRate,
    getFailureCount,
    getSuccessCount,
    hasFailures,
    
    // Validation
    validateOperation,
    canPerformOperation,
    
    // Utility
    clearResults,
    clearError,
    formatResults,
  };
};