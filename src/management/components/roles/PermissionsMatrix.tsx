// Permissions matrix component showing role capabilities comparison

import React, { useState } from 'react';
import { Shield, Check, X, Search, Filter, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useRoles } from '../../hooks/useRoles';
import { formatRole } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';

interface PermissionsMatrixProps {
  showOnlyManageable?: boolean;
  highlightRole?: string;
  className?: string;
}

const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({
  showOnlyManageable = false,
  highlightRole,
  className,
}) => {
  const { roleHierarchy, manageableRoles, isLoading, error } = useRoles();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
  };

  const getPermissionCategory = (permission: string) => {
    if (permission.includes('user') || permission.includes('profile')) {
      return 'user_management';
    }
    if (permission.includes('role') || permission.includes('permission')) {
      return 'role_management';
    }
    if (permission.includes('audit') || permission.includes('log')) {
      return 'audit_logging';
    }
    if (permission.includes('system') || permission.includes('cache') || permission.includes('health')) {
      return 'system_management';
    }
    if (permission.includes('bulk')) {
      return 'bulk_operations';
    }
    return 'general';
  };

  const formatPermissionName = (permission: string) => {
    return permission
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (error) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load permissions matrix</p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner text="Loading permissions matrix..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  const roles = showOnlyManageable 
    ? manageableRoles?.detailed_roles?.sort((a, b) => b.level - a.level) || []
    : roleHierarchy?.roles?.sort((a, b) => b.level - a.level) || [];

  // Get all unique permissions across all roles
  const allPermissions = Array.from(
    new Set(roles.flatMap((role: any) => role.permissions || []))
  ).sort();

  // Filter permissions based on search and category
  const filteredPermissions = allPermissions.filter((permission: string) => {
    const matchesSearch = !searchTerm || 
      permission.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatPermissionName(permission).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      getPermissionCategory(permission) === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = Array.from(
    new Set(allPermissions.map(getPermissionCategory))
  ).sort();

  const categoryLabels = {
    user_management: 'User Management',
    role_management: 'Role Management',
    audit_logging: 'Audit & Logging',
    system_management: 'System Management',
    bulk_operations: 'Bulk Operations',
    general: 'General'
  };

  return (
    <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Permissions Matrix
          <Badge variant="secondary" className="bg-slate-700 text-slate-200">
            {roles.length} roles × {filteredPermissions.length} permissions
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-slate-200"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] bg-slate-800 border-slate-600 text-slate-200">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem 
                value="all"
                className="text-slate-200 focus:bg-slate-700 focus:text-white"
              >
                All Categories
              </SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  {categoryLabels[category] || category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={searchTerm === '' && categoryFilter === 'all'}
            className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Matrix Table */}
        <Card className="bg-slate-800/30 border-slate-600">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="w-[300px] text-slate-300 font-medium sticky left-0 bg-slate-900/90 backdrop-blur-sm">
                    Permission
                  </TableHead>
                  {roles.map((role: any) => {
                    const roleInfo = formatRole(role.name, roleHierarchy);
                    const isHighlighted = highlightRole === role.name;
                    return (
                      <TableHead
                        key={role.name}
                        className={cn(
                          'text-center min-w-[100px] text-slate-300',
                          isHighlighted && 'bg-blue-900/30 border-blue-500/50'
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg">{roleInfo.icon}</span>
                          <span className="text-xs font-medium">{roleInfo.text}</span>
                          <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                            L{role.level}
                          </Badge>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={roles.length + 1}
                      className="h-32 text-center text-slate-400"
                    >
                      {searchTerm ? 
                        `No permissions found matching "${searchTerm}"` :
                        'No permissions to display'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPermissions.map((permission, index) => {
                    const category = getPermissionCategory(permission);
                    return (
                      <TableRow 
                        key={permission}
                        className={cn(
                          'border-slate-700 hover:bg-slate-800/50',
                          index % 2 === 0 && 'bg-slate-800/20'
                        )}
                      >
                        <TableCell className="sticky left-0 bg-slate-900/90 backdrop-blur-sm border-r border-slate-700">
                          <div className="space-y-1">
                            <div className="font-medium text-slate-200 text-sm">
                              {formatPermissionName(permission)}
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                                {permission}
                              </code>
                              <Badge 
                                variant="outline" 
                                className="border-slate-600 text-slate-500 text-xs"
                              >
                                {categoryLabels[category] || category}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        
                        {roles.map((role: any) => {
                          const hasPermission = role.permissions?.includes(permission);
                          const isHighlighted = highlightRole === role.name;
                          
                          return (
                            <TableCell 
                              key={`${permission}-${role.name}`}
                              className={cn(
                                'text-center p-4',
                                isHighlighted && 'bg-blue-900/20',
                                hasPermission && 'bg-green-900/20'
                              )}
                            >
                              {hasPermission ? (
                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-700">
                                  <X className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>

        {/* Legend */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-slate-400">Has Permission</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center">
                <X className="w-3 h-3 text-slate-400" />
              </div>
              <span className="text-slate-400">No Permission</span>
            </div>
          </div>
          
          <div className="text-slate-500">
            Showing {filteredPermissions.length} of {allPermissions.length} permissions
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roles.map((role: any) => {
            const rolePermissions = role.permissions || [];
            const visiblePermissions = rolePermissions.filter((p: any) => 
              filteredPermissions.includes(p)
            );
            const percentage = filteredPermissions.length > 0 
              ? Math.round((visiblePermissions.length / filteredPermissions.length) * 100)
              : 0;

            return (
              <Card key={role.name} className="bg-slate-800/30 border-slate-600">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {formatRole(role.name, roleHierarchy).icon}
                    <span className="font-medium text-slate-200 text-sm">
                      {formatRole(role.name, roleHierarchy).text}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-slate-200">
                      {visiblePermissions.length}/{filteredPermissions.length}
                    </div>
                    <div className="text-xs text-slate-400">
                      {percentage}% coverage
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsMatrix;