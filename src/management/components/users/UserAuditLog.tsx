// User audit log component for activity timeline

import React, { useState } from 'react';
import { 
  Activity, 
  Filter, 
  Calendar, 
  User, 
  Edit2, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Download,
  Search,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { useAuditLog } from '../../hooks/useAuditLog';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import type { UserAuditEntry, AuditFilters } from '../../types/user';

interface UserAuditLogProps {
  userId: string;
  className?: string;
}

const UserAuditLog: React.FC<UserAuditLogProps> = ({
  userId,
  className,
}) => {
  const [filters, setFilters] = useState<AuditFilters>({});
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  const {
    auditLogs,
    pagination,
    isLoading,
    error,
    refresh,
    exportLogs,
    isExporting,
  } = useAuditLog(userId, filters);

  const actionTypes = [
    'CREATE',
    'UPDATE', 
    'ROLE_CHANGE',
    'ACTIVATE',
    'DEACTIVATE',
    'LOGIN',
    'LOGOUT',
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <User className="w-4 h-4 text-green-400" />;
      case 'UPDATE':
        return <Edit2 className="w-4 h-4 text-blue-400" />;
      case 'ROLE_CHANGE':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'ACTIVATE':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'DEACTIVATE':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'LOGIN':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'LOGOUT':
        return <X className="w-4 h-4 text-slate-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'ACTIVATE':
        return 'text-green-400';
      case 'UPDATE':
      case 'LOGIN':
        return 'text-blue-400';
      case 'ROLE_CHANGE':
        return 'text-purple-400';
      case 'DEACTIVATE':
        return 'text-red-400';
      case 'LOGOUT':
        return 'text-slate-400';
      default:
        return 'text-slate-300';
    }
  };

  const handleFilterChange = (key: keyof AuditFilters, value: any) => {
    // Convert special "all" values to undefined to clear the filter
    let filterValue = value;
    if (value === 'all_actions' || value === '') {
      filterValue = undefined;
    }
    
    setFilters(prev => ({
      ...prev,
      [key]: filterValue,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  if (error) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load audit log</p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="mt-3 border-slate-600 text-slate-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            User Activity Log
            {pagination?.total && (
              <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                {pagination.total} events
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={isExporting || isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        {isFiltersExpanded && (
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Action Filter */}
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Action Type</Label>
                  <Select
                    value={filters.action || ''}
                    onValueChange={(value) => handleFilterChange('action', value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem 
                        value="all_actions"
                        className="text-slate-200 focus:bg-slate-700 focus:text-white"
                      >
                        All actions
                      </SelectItem>
                      {actionTypes.map((action) => (
                        <SelectItem
                          key={action}
                          value={action}
                          className="text-slate-200 focus:bg-slate-700 focus:text-white"
                        >
                          <div className="flex items-center gap-2">
                            {getActionIcon(action)}
                            {action.replace('_', ' ').toLowerCase()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.start_date || ''}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-slate-200"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">End Date</Label>
                  <Input
                    type="date"
                    value={filters.end_date || ''}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-slate-200"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">
                  {activeFiltersCount > 0 ? `${activeFiltersCount} filter(s) active` : 'No filters applied'}
                </div>
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Log Timeline */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner text="Loading audit log..." />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No activity found</p>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-slate-600 text-slate-300"
              >
                Clear filters to see all activity
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((entry, index) => (
              <div
                key={entry.id}
                className="relative flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700"
              >
                {/* Timeline connector */}
                {index < auditLogs.length - 1 && (
                  <div className="absolute left-6 top-12 w-px h-full bg-slate-600" />
                )}

                {/* Action icon */}
                <div className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600">
                  {getActionIcon(entry.action)}
                </div>

                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={cn('font-medium', getActionColor(entry.action))}>
                        {entry.action.replace('_', ' ').toLowerCase()}
                      </h4>
                      {entry.reason && (
                        <p className="text-sm text-slate-400 mt-1">{entry.reason}</p>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-slate-500">
                      <div>{formatRelativeTime(entry.timestamp)}</div>
                      <div>{formatDate(entry.timestamp)}</div>
                    </div>
                  </div>

                  {/* Changes */}
                  {(entry.old_values || entry.new_values) && (
                    <div className="bg-slate-900/50 rounded p-3 mb-3">
                      {entry.old_values && (
                        <div className="mb-2">
                          <span className="text-red-400 text-sm font-medium">Before: </span>
                          <code className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded">
                            {JSON.stringify(entry.old_values, null, 2)}
                          </code>
                        </div>
                      )}
                      {entry.new_values && (
                        <div>
                          <span className="text-green-400 text-sm font-medium">After: </span>
                          <code className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded">
                            {JSON.stringify(entry.new_values, null, 2)}
                          </code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {entry.performed_by && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>By: {entry.performed_by}</span>
                      </div>
                    )}
                    
                    {entry.ip_address && (
                      <div>IP: {entry.ip_address}</div>
                    )}
                    
                    <div>Resource: {entry.resource_type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              pageSize={pagination.per_page}
              onPageChange={(page) => {
                // This would be handled by the useAuditLog hook
                console.log('Page change:', page);
              }}
              onPageSizeChange={(size) => {
                // This would be handled by the useAuditLog hook
                console.log('Page size change:', size);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserAuditLog;