// Role permissions component showing detailed permission breakdown

import React, { useState } from 'react';
import { Shield, Eye, Settings, Users, Search, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useRoles } from '../../hooks/useRoles';
import { formatRole } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';

interface RolePermissionsProps {
  selectedRole?: string;
  onRoleSelect?: (role: string) => void;
  className?: string;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({
  selectedRole,
  onRoleSelect,
  className,
}) => {
  const { roleHierarchy, isLoading, error } = useRoles();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['user_management']));

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getPermissionCategory = (permission: string) => {
    // Use backend metadata first
    const backendCategory = roleHierarchy?.permission_metadata?.[permission]?.category;
    if (backendCategory) {
      return backendCategory;
    }

    // Use rules-based categorization from backend
    const rules = roleHierarchy?.ui_configuration?.permission_categorization_rules;
    if (rules) {
      const permissionLower = permission.toLowerCase();
      
      for (const rule of rules.sort((a, b) => a.priority - b.priority)) {
        if (rule.rule.includes('contains')) {
          const keywords = rule.rule.match(/'([^']+)'/g)?.map(k => k.slice(1, -1)) || [];
          if (keywords.some(keyword => permissionLower.includes(keyword))) {
            return rule.category;
          }
        }
      }
      
      // Return default from backend rules
      const defaultRule = rules.find(r => r.rule.includes('default'));
      if (defaultRule) {
        return defaultRule.category;
      }
    }

    // No hardcoded fallbacks - show error
    console.error(`Missing permission categorization for: ${permission}. Check backend /api/v1/roles endpoint.`);
    return 'uncategorized';
  };

  const getIconComponent = (iconName: string, className: string = "w-4 h-4") => {
    const iconComponents = {
      Users: <Users className={className} />,
      Shield: <Shield className={className} />,
      Eye: <Eye className={className} />,
      Settings: <Settings className={className} />,
      Crown: <Settings className={className} />, // Crown not available in imports, fallback to Settings
      User: <Users className={className} />
    };
    return iconComponents[iconName] || <Shield className={className} />;
  };

  const getCategoryInfo = (category: string) => {
    // Require backend metadata - no hardcoded fallbacks
    const backendCategory = roleHierarchy?.category_metadata?.[category];
    if (!backendCategory) {
      console.error(`Missing category metadata for: ${category}. Check backend /api/v1/roles endpoint.`);
      return {
        label: category.toUpperCase(),
        icon: <Shield className="w-4 h-4 text-red-400" />,
        color: 'text-red-400',
        description: `❌ Missing metadata for ${category} category`
      };
    }

    const colorMapping = roleHierarchy?.ui_configuration?.color_mapping?.[backendCategory.color];
    const iconComponent = roleHierarchy?.ui_configuration?.icon_mapping?.[backendCategory.icon];
    
    if (!colorMapping) {
      console.error(`Missing color mapping for ${backendCategory.color}. Check backend UI configuration.`);
      return {
        label: backendCategory.label,
        icon: getIconComponent(iconComponent || 'Shield'),
        color: 'text-red-400',
        description: backendCategory.description
      };
    }

    if (!iconComponent) {
      console.error(`Missing icon mapping for ${backendCategory.icon}. Check backend UI configuration.`);
      return {
        label: backendCategory.label,
        icon: <Shield className="w-4 h-4 text-red-400" />,
        color: colorMapping.text,
        description: backendCategory.description
      };
    }
    
    return {
      label: backendCategory.label,
      icon: getIconComponent(iconComponent),
      color: colorMapping.text,
      description: backendCategory.description
    };
  };

  const formatPermissionName = (permission: string) => {
    // Require backend metadata - no hardcoded fallbacks
    const backendPermission = roleHierarchy?.permission_metadata?.[permission];
    if (!backendPermission?.display_name) {
      console.error(`Missing permission display name for: ${permission}. Check backend /api/v1/roles endpoint.`);
      return `❌ ${permission.toUpperCase()}`;
    }

    return backendPermission.display_name;
  };

  const getPermissionDescription = (permission: string) => {
    // Require backend metadata - no hardcoded fallbacks
    const backendPermission = roleHierarchy?.permission_metadata?.[permission];
    if (!backendPermission?.description) {
      console.error(`Missing permission description for: ${permission}. Check backend /api/v1/roles endpoint.`);
      return `❌ Missing description for ${permission}. Check backend configuration.`;
    }

    return backendPermission.description;
  };

  if (error) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load role permissions</p>
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
            <LoadingSpinner text="Loading permissions..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  const roles = roleHierarchy?.roles || [];
  const selectedRoleData = selectedRole ? roles.find(r => r.name === selectedRole) : null;
  const permissions = selectedRoleData?.permissions || [];

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    const category = getPermissionCategory(permission);
    if (!acc[category]) acc[category] = [];
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, string[]>);

  // Filter permissions by search term
  const filteredPermissions = searchTerm
    ? permissions.filter(p => 
        p.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getPermissionDescription(p).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : permissions;

  return (
    <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Permissions
            {selectedRoleData && (
              <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                {formatRole(selectedRoleData.name, roleHierarchy).text}
              </Badge>
            )}
          </CardTitle>
          
          {selectedRoleData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRoleSelect?.('')}
              className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roles
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Role Selection */}
        {!selectedRole && (
          <div className="space-y-4">
            <p className="text-slate-400">Select a role to view its permissions:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {roles.map((role) => {
                const roleInfo = formatRole(role.name, roleHierarchy);
                return (
                  <Button
                    key={role.name}
                    variant="outline"
                    onClick={() => onRoleSelect?.(role.name)}
                    className="h-auto p-4 bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
                  >
                    <div className="text-center space-y-2">
                      <div className="text-2xl">{roleInfo.icon}</div>
                      <div className="font-medium">{roleInfo.text}</div>
                      <div className="text-xs text-slate-500">
                        {role.permissions?.length || 0} permissions
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Role Permissions */}
        {selectedRoleData && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-slate-200"
              />
            </div>

            {/* Permission Summary */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-slate-200 font-medium">
                  {formatRole(selectedRoleData.name, roleHierarchy).text} Permissions
                </h4>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {filteredPermissions.length} / {permissions.length}
                </Badge>
              </div>
              <p className="text-sm text-slate-400">
                Level {selectedRoleData.level.toLocaleString()} • {permissions.length} total permissions
              </p>
            </div>

            {/* Permissions by Category */}
            {searchTerm ? (
              /* Search Results */
              <div className="space-y-3">
                <h4 className="text-slate-300 font-medium">Search Results</h4>
                {filteredPermissions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No permissions found matching "{searchTerm}"
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPermissions.map((permission) => (
                      <Card key={permission} className="bg-slate-800/30 border-slate-600">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h5 className="font-medium text-slate-200">
                                {formatPermissionName(permission)}
                              </h5>
                              <p className="text-sm text-slate-400">
                                {getPermissionDescription(permission)}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                              {getPermissionCategory(permission).replace('_', ' ')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Categorized Permissions */
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
                  const categoryInfo = getCategoryInfo(category);
                  const isExpanded = expandedCategories.has(category);

                  return (
                    <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                      <Card className="bg-slate-800/30 border-slate-600">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-between p-4 h-auto hover:bg-slate-700/50"
                          >
                            <div className="flex items-center gap-3">
                              <span className={categoryInfo.color}>
                                {categoryInfo.icon}
                              </span>
                              <div className="text-left">
                                <h4 className="font-medium text-slate-200">
                                  {categoryInfo.label}
                                </h4>
                                <p className="text-sm text-slate-400">
                                  {categoryInfo.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-slate-600 text-slate-400">
                                {categoryPermissions.length}
                              </Badge>
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-2">
                            {categoryPermissions.map((permission) => (
                              <div
                                key={permission}
                                className="bg-slate-900/50 rounded p-3 border border-slate-700"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <h5 className="font-medium text-slate-200 text-sm">
                                      {formatPermissionName(permission)}
                                    </h5>
                                    <p className="text-xs text-slate-400">
                                      {getPermissionDescription(permission)}
                                    </p>
                                  </div>
                                  <code className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                                    {permission}
                                  </code>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RolePermissions;