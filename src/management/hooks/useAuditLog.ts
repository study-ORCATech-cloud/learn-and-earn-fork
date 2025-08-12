// Custom hook for audit log operations

import { useState, useEffect, useCallback } from 'react';
import { userManagementService } from '../services/userManagementService';
import { formatDate, formatRelativeTime, formatAuditAction } from '../utils/formatters';
import { validateDateRange } from '../utils/validators';
import type { AuditLogEntry, PaginationInfo } from '../types/management';
import type { UserAuditResponse } from '../types/user';

export interface AuditLogFilters {
  action?: string;
  start_date?: string;
  end_date?: string;
  performed_by?: string;
}

export interface UseAuditLogOptions {
  userId?: string;
  autoLoad?: boolean;
  pageSize?: number;
  defaultFilters?: AuditLogFilters;
}

export interface UseAuditLogReturn {
  // Data
  auditLogs: AuditLogEntry[];
  totalLogs: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: AuditLogFilters;
  appliedFilters: AuditLogFilters;
  
  // Operations
  loadAuditLogs: (page?: number) => Promise<void>;
  setFilters: (filters: AuditLogFilters) => void;
  applyFilters: () => Promise<void>;
  clearFilters: () => void;
  
  // Pagination
  goToPage: (page: number) => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPrevPage: () => Promise<void>;
  
  // Formatting helpers
  formatLogDate: (dateString: string) => string;
  formatLogTime: (dateString: string) => string;
  formatLogAction: (action: string) => string;
  formatTimeAgo: (dateString: string) => string;
  
  // Analysis helpers
  getActionCounts: () => Record<string, number>;
  getRecentActivity: (days?: number) => AuditLogEntry[];
  getLogsByPerformer: (performer: string) => AuditLogEntry[];
  
  // Utility
  refresh: () => Promise<void>;
  clearError: () => void;
  exportLogs: (format: 'csv' | 'json') => string;
  
  // Validation
  validateFilters: (filters: AuditLogFilters) => { isValid: boolean; errors: string[] };
}

export const useAuditLog = (options: UseAuditLogOptions = {}): UseAuditLogReturn => {
  const { 
    userId, 
    autoLoad = true, 
    pageSize = 50, 
    defaultFilters = {} 
  } = options;
  
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AuditLogFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<AuditLogFilters>(defaultFilters);

  // Auto-load audit logs on mount
  useEffect(() => {
    if (autoLoad && userId) {
      loadAuditLogs(1);
    }
  }, [autoLoad, userId]);

  const loadAuditLogs = useCallback(async (page: number = 1) => {
    if (!userId) {
      setError('User ID is required to load audit logs');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userManagementService.getUserAudit(
        userId, 
        page, 
        pageSize, 
        appliedFilters
      );
      
      if (response.success && response.data) {
        setAuditLogs(response.data.audit_logs);
        setPagination(response.data.pagination);
        setTotalLogs(response.data.pagination.total);
      } else {
        setError(response.message || 'Failed to load audit logs');
        setAuditLogs([]);
        setPagination(null);
        setTotalLogs(0);
      }
    } catch (err) {
      setError('Failed to load audit logs');
      setAuditLogs([]);
      setPagination(null);
      setTotalLogs(0);
    } finally {
      setIsLoading(false);
    }
  }, [userId, pageSize, appliedFilters]);

  const setFilters = useCallback((newFilters: AuditLogFilters) => {
    setFiltersState(newFilters);
  }, []);

  const applyFilters = useCallback(async () => {
    setAppliedFilters(filters);
    await loadAuditLogs(1);
  }, [filters, loadAuditLogs]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {};
    setFiltersState(emptyFilters);
    setAppliedFilters(emptyFilters);
    loadAuditLogs(1);
  }, [loadAuditLogs]);

  const goToPage = useCallback(async (page: number) => {
    await loadAuditLogs(page);
  }, [loadAuditLogs]);

  const goToNextPage = useCallback(async () => {
    const currentPage = pagination?.page || 1;
    const hasNext = pagination?.has_next || false;
    
    if (hasNext) {
      await goToPage(currentPage + 1);
    }
  }, [pagination, goToPage]);

  const goToPrevPage = useCallback(async () => {
    const currentPage = pagination?.page || 1;
    const hasPrev = pagination?.has_prev || false;
    
    if (hasPrev) {
      await goToPage(currentPage - 1);
    }
  }, [pagination, goToPage]);

  const formatLogDate = useCallback((dateString: string): string => {
    return formatDate(dateString);
  }, []);

  const formatLogTime = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'Invalid time';
    }
  }, []);

  const formatLogAction = useCallback((action: string): string => {
    return formatAuditAction(action);
  }, []);

  const formatTimeAgo = useCallback((dateString: string): string => {
    return formatRelativeTime(dateString);
  }, []);

  const getActionCounts = useCallback((): Record<string, number> => {
    return auditLogs.reduce((counts, log) => {
      const action = log.action;
      counts[action] = (counts[action] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }, [auditLogs]);

  const getRecentActivity = useCallback((days: number = 7): AuditLogEntry[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return auditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= cutoffDate;
    });
  }, [auditLogs]);

  const getLogsByPerformer = useCallback((performer: string): AuditLogEntry[] => {
    return auditLogs.filter(log => log.performed_by === performer);
  }, [auditLogs]);

  const refresh = useCallback(async () => {
    const currentPage = pagination?.page || 1;
    await loadAuditLogs(currentPage);
  }, [pagination, loadAuditLogs]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const exportLogs = useCallback((format: 'csv' | 'json'): string => {
    if (format === 'json') {
      return JSON.stringify(auditLogs, null, 2);
    }
    
    // CSV format
    const headers = ['Timestamp', 'Action', 'Performed By', 'Old Values', 'New Values', 'Reason', 'IP Address'];
    const csvRows = [headers.join(',')];
    
    auditLogs.forEach(log => {
      const row = [
        log.timestamp,
        log.action,
        log.performed_by,
        JSON.stringify(log.old_values || {}),
        JSON.stringify(log.new_values || {}),
        log.reason || '',
        log.ip_address || '',
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });
    
    return csvRows.join('\n');
  }, [auditLogs]);

  const validateFilters = useCallback((filtersToValidate: AuditLogFilters): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Validate date range
    const dateValidation = validateDateRange(filtersToValidate.start_date, filtersToValidate.end_date);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.error!);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  // Derived state
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.pages || 1;
  const hasNextPage = pagination?.has_next || false;
  const hasPrevPage = pagination?.has_prev || false;

  return {
    // Data
    auditLogs,
    totalLogs,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    
    // Loading and error states
    isLoading,
    error,
    
    // Filters
    filters,
    appliedFilters,
    
    // Operations
    loadAuditLogs,
    setFilters,
    applyFilters,
    clearFilters,
    
    // Pagination
    goToPage,
    goToNextPage,
    goToPrevPage,
    
    // Formatting helpers
    formatLogDate,
    formatLogTime,
    formatLogAction,
    formatTimeAgo,
    
    // Analysis helpers
    getActionCounts,
    getRecentActivity,
    getLogsByPerformer,
    
    // Utility
    refresh,
    clearError,
    exportLogs,
    
    // Validation
    validateFilters,
  };
};