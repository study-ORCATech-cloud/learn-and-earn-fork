// User filters component

import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRoles } from '../../hooks/useRoles';
import type { UserFilters as UserFiltersType } from '../../types/user';
import { USER_ROLES, OAUTH_PROVIDERS } from '../../utils/constants';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  className?: string;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isLoading = false,
  className,
}) => {
  const { roleHierarchy } = useRoles();
  const [localFilters, setLocalFilters] = useState<UserFiltersType>(filters);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local filters when prop filters change
  useEffect(() => {
    setLocalFilters(filters);
    setHasChanges(false);
  }, [filters]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(localFilters) !== JSON.stringify(filters);
    setHasChanges(changed);
  }, [localFilters, filters]);

  const handleFilterChange = (key: keyof UserFiltersType, value: any) => {
    // Convert special "all" values to undefined to clear the filter
    let filterValue = value;
    if (value === 'all_roles' || value === 'all_providers' || value === 'all_statuses' || value === '') {
      filterValue = undefined;
    }
    
    const newFilters = { ...localFilters, [key]: filterValue };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleApply = () => {
    onApplyFilters();
    setHasChanges(false);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
    setHasChanges(false);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const availableRoles = roleHierarchy?.roles || [];

  return (
    <Card className={cn('p-4 bg-slate-900/50 border-slate-700', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="font-medium text-slate-200">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-600 text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isLoading}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Role Filter */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Role</Label>
            <Select
              value={localFilters.role || ''}
              onValueChange={(value) => handleFilterChange('role', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem 
                  value="all_roles"
                  className="text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  All roles
                </SelectItem>
                {availableRoles.map((role) => (
                  <SelectItem
                    key={role.name}
                    value={role.name}
                    className="text-slate-200 focus:bg-slate-700 focus:text-white"
                  >
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider Filter */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Provider</Label>
            <Select
              value={localFilters.provider || ''}
              onValueChange={(value) => handleFilterChange('provider', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue placeholder="All providers" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem 
                  value="all_providers"
                  className="text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  All providers
                </SelectItem>
                <SelectItem
                  value={OAUTH_PROVIDERS.GOOGLE}
                  className="text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  🔍 Google
                </SelectItem>
                <SelectItem
                  value={OAUTH_PROVIDERS.GITHUB}
                  className="text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  🐙 GitHub
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Status</Label>
            <Select
              value={localFilters.is_active === undefined ? '' : String(localFilters.is_active)}
              onValueChange={(value) => 
                handleFilterChange('is_active', value === '' ? undefined : value === 'true')
              }
              disabled={isLoading}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem 
                  value="all_statuses"
                  className="text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  All statuses
                </SelectItem>
                <SelectItem
                  value="true"
                  className="text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  ✅ Active
                </SelectItem>
                <SelectItem
                  value="false"
                  className="text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  ❌ Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apply/Reset Actions */}
          <div className="flex items-end gap-2">
            <Button
              onClick={handleApply}
              disabled={!hasChanges || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
            {filters.role && (
              <Badge 
                variant="secondary" 
                className="bg-slate-700 text-slate-200 hover:bg-slate-600"
              >
                Role: {filters.role}
                <button
                  onClick={() => handleFilterChange('role', undefined)}
                  className="ml-1 hover:text-white"
                  disabled={isLoading}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.provider && (
              <Badge 
                variant="secondary" 
                className="bg-slate-700 text-slate-200 hover:bg-slate-600"
              >
                Provider: {filters.provider}
                <button
                  onClick={() => handleFilterChange('provider', undefined)}
                  className="ml-1 hover:text-white"
                  disabled={isLoading}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.is_active !== undefined && (
              <Badge 
                variant="secondary" 
                className="bg-slate-700 text-slate-200 hover:bg-slate-600"
              >
                Status: {filters.is_active ? 'Active' : 'Inactive'}
                <button
                  onClick={() => handleFilterChange('is_active', undefined)}
                  className="ml-1 hover:text-white"
                  disabled={isLoading}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserFilters;