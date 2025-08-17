// Role hierarchy component displaying role levels and permissions

import React from 'react';
import { Shield, Crown, Users, User, ChevronUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useManagement } from '../../context/ManagementContext';
import { useRoles } from '../../hooks/useRoles';
import { formatRole } from '../../utils/formatters';
import { getManageableRoleNames } from '../../utils/permissions';
import LoadingSpinner from '../common/LoadingSpinner';

interface RoleHierarchyProps {
  className?: string;
}

const RoleHierarchy: React.FC<RoleHierarchyProps> = ({ className }) => {
  const management = useManagement();
  const { roleHierarchy, isLoading, error } = useRoles();

  // Icon component mapping
  const iconComponents = {
    Crown: Crown,
    Shield: Shield,
    Users: Users,
    User: User,
  };

  const getRoleIcon = (roleName: string) => {
    // Handle loading state
    if (!roleHierarchy) {
      return <Shield className="w-5 h-5 text-slate-400" />;
    }

    // Check for missing role metadata in loaded data
    const backendRole = roleHierarchy.role_metadata?.[roleName];
    if (!backendRole) {
      console.error(`Missing role metadata for role: ${roleName}. Check backend /api/v1/roles endpoint.`);
      return <Shield className="w-5 h-5 text-red-400" />;
    }

    const colorMapping = roleHierarchy?.ui_configuration?.color_mapping?.[backendRole.color];
    if (!colorMapping) {
      console.error(`Missing color mapping for ${backendRole.color}. Check backend UI configuration.`);
      return <Shield className="w-5 h-5 text-red-400" />;
    }

    const colorClass = colorMapping.text;
    const iconName = roleHierarchy?.ui_configuration?.icon_mapping?.[backendRole.icon];
    
    if (!iconName || !iconComponents[iconName]) {
      console.error(`Unknown icon component: ${iconName}. Check backend UI configuration.`);
      return <Shield className="w-5 h-5 text-red-400" />;
    }

    // Dynamically render the icon component
    const IconComponent = iconComponents[iconName];
    return <IconComponent className={`w-5 h-5 ${colorClass}`} />;
  };

  const getRoleColor = (roleName: string, isManageable: boolean) => {
    // Handle loading state
    if (!roleHierarchy) {
      return 'bg-slate-900/20 border-slate-500/30 text-slate-200';
    }

    // Check for missing role metadata in loaded data
    const backendRole = roleHierarchy.role_metadata?.[roleName];
    if (!backendRole) {
      console.error(`Missing role metadata for role: ${roleName}. Check backend /api/v1/roles endpoint.`);
      return 'bg-red-900/20 border-red-500/30 text-red-200';
    }

    const colorMapping = roleHierarchy?.ui_configuration?.color_mapping?.[backendRole.color];
    if (!colorMapping) {
      console.error(`Missing color mapping for ${backendRole.color}. Check backend UI configuration.`);
      return 'bg-red-900/20 border-red-500/30 text-red-200';
    }

    const intensity = isManageable ? '30' : '20';
    const borderIntensity = isManageable ? '50' : '30';
    const textIntensity = isManageable ? '100' : '200';
    
    return `${colorMapping.bg.replace('20', intensity)} ${colorMapping.border.replace('30', borderIntensity)} ${colorMapping.text.replace('400', textIntensity)}`;
  };

  const sortedRoles = roleHierarchy?.roles?.sort((a, b) => b.level - a.level) || [];
  const manageableRoleNames = getManageableRoleNames(management.currentUserRole, roleHierarchy);

  const getRoleDescription = (roleName: string) => {
    // Handle loading state
    if (!roleHierarchy) {
      return 'Loading role description...';
    }

    // Check for missing role metadata in loaded data
    const backendRole = roleHierarchy.role_metadata?.[roleName];
    if (!backendRole?.description) {
      console.error(`Missing role description for role: ${roleName}. Check backend /api/v1/roles endpoint.`);
      return `❌ Missing description for ${roleName} role. Check backend configuration.`;
    }

    return backendRole.description;
  };

  if (error) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load role hierarchy</p>
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
            <LoadingSpinner text="Loading role hierarchy..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Role Hierarchy
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current User Role Info */}
        <Alert className="bg-slate-800/50 border-slate-600">
          <Info className="w-4 h-4" />
          <AlertDescription className="text-slate-300">
            <span className="font-medium">Your Role:</span> {formatRole(management.currentUserRole, roleHierarchy).text}
            <br />
            <span className="text-sm text-slate-400">
              You can manage roles: {manageableRoleNames.length > 0 ? manageableRoleNames.join(', ') : 'None'}
            </span>
          </AlertDescription>
        </Alert>

        {/* Role Hierarchy Display */}
        <div className="space-y-4">
          <h3 className="text-slate-300 font-medium mb-4">System Role Hierarchy</h3>
          
          {sortedRoles.map((role, index) => {
            const isManageable = manageableRoleNames.includes(role.name);
            const isCurrentUserRole = role.name === management.currentUserRole;
            
            return (
              <div key={role.name} className="relative">
                {/* Connection line to next role */}
                {index < sortedRoles.length - 1 && (
                  <div className="absolute left-6 top-16 w-px h-8 bg-slate-600" />
                )}
                
                <Card className={cn(
                  'border transition-all duration-200',
                  getRoleColor(role.name, isManageable),
                  isCurrentUserRole && 'ring-2 ring-blue-500/50',
                  isManageable && 'shadow-lg'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(role.name)}
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-lg capitalize text-white">
                              {role.name}
                            </h4>
                            
                            {isCurrentUserRole && (
                              <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                                You
                              </Badge>
                            )}
                            
                            {isManageable && (
                              <Badge variant="outline" className="border-current text-white text-xs">
                                Manageable
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-300 opacity-80">
                            <span>Level {role.level.toLocaleString()}</span>
                            {index < sortedRoles.length - 1 && (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                <span>Higher than {sortedRoles[index + 1].name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                          {role.permissions?.length || 0} permissions
                        </Badge>
                      </div>
                    </div>

                    {/* Role Description */}
                    <div className="mt-3 ml-8 text-sm text-slate-300 opacity-90">
                      <p>{getRoleDescription(role.name)}</p>
                    </div>

                    {/* Key Permissions */}
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="mt-3">
                        <Separator className="bg-current opacity-20 mb-3" />
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 4).map((permission) => (
                            <Badge
                              key={permission}
                              variant="outline"
                              className="border-slate-500 text-slate-200 bg-slate-800/50 text-xs"
                            >
                              {permission.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {role.permissions.length > 4 && (
                            <Badge
                              variant="outline"
                              className="border-slate-500 text-slate-200 bg-slate-800/50 text-xs"
                            >
                              +{role.permissions.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Role Management Summary */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <h4 className="text-slate-200 font-medium mb-3">Role Management Rules</h4>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
              <p>Users can only manage roles lower than their own level</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
              <p>Owner role can only be assigned at deployment time</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
              <p>All role changes are logged in the audit trail</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
              <p>Users cannot change their own role or deactivate themselves</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleHierarchy;