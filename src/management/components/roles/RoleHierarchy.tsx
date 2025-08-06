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
import LoadingSpinner from '../common/LoadingSpinner';

interface RoleHierarchyProps {
  className?: string;
}

const RoleHierarchy: React.FC<RoleHierarchyProps> = ({ className }) => {
  const management = useManagement();
  const { roleHierarchy, manageableRoles, isLoading, error } = useRoles();

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'owner':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'moderator':
        return <Users className="w-5 h-5 text-blue-400" />;
      case 'user':
        return <User className="w-5 h-5 text-green-400" />;
      default:
        return <Shield className="w-5 h-5 text-slate-400" />;
    }
  };

  const getRoleColor = (roleName: string, isManageable: boolean) => {
    const baseColors = {
      owner: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-200',
      admin: 'bg-purple-900/20 border-purple-500/30 text-purple-200',
      moderator: 'bg-blue-900/20 border-blue-500/30 text-blue-200',
      user: 'bg-green-900/20 border-green-500/30 text-green-200',
    };

    const managedColors = {
      owner: 'bg-yellow-900/30 border-yellow-400/50 text-yellow-100',
      admin: 'bg-purple-900/30 border-purple-400/50 text-purple-100',
      moderator: 'bg-blue-900/30 border-blue-400/50 text-blue-100',
      user: 'bg-green-900/30 border-green-400/50 text-green-100',
    };

    return isManageable ? managedColors[roleName] || baseColors.user : baseColors[roleName] || baseColors.user;
  };

  const sortedRoles = roleHierarchy?.roles?.sort((a, b) => b.level - a.level) || [];
  const manageableRoleNames = manageableRoles?.manageable_roles?.map(r => r.name) || [];

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
            <span className="font-medium">Your Role:</span> {formatRole(management.currentUserRole).text}
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
                            <h4 className="font-semibold text-lg capitalize">
                              {role.name}
                            </h4>
                            
                            {isCurrentUserRole && (
                              <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                                You
                              </Badge>
                            )}
                            
                            {isManageable && (
                              <Badge variant="outline" className="border-current text-xs">
                                Manageable
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm opacity-80">
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
                    <div className="mt-3 ml-8 text-sm opacity-90">
                      {role.name === 'owner' && (
                        <p>Complete system control. Can manage all users and roles, including admins. Set only at deployment time.</p>
                      )}
                      {role.name === 'admin' && (
                        <p>Full administrative access. Can manage moderators and users, view audit logs, perform bulk operations.</p>
                      )}
                      {role.name === 'moderator' && (
                        <p>Limited administrative access. Can view and manage regular users only.</p>
                      )}
                      {role.name === 'user' && (
                        <p>Standard user access. Can manage own profile and access learning content.</p>
                      )}
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