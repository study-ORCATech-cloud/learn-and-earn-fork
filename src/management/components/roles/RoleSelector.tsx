// Role selector component for choosing roles with descriptions

import React, { useState } from 'react';
import { Shield, Check, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useManagement } from '../../context/ManagementContext';
import { useRoles } from '../../hooks/useRoles';
import { formatRole } from '../../utils/formatters';
import type { Role } from '../../types/role';

interface RoleSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showDescriptions?: boolean;
  showPermissionCount?: boolean;
  filterManageableOnly?: boolean;
  excludeRoles?: string[];
  currentUserRole?: string; // For comparison/warnings
  className?: string;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select a role...",
  showDescriptions = true,
  showPermissionCount = true,
  filterManageableOnly = true,
  excludeRoles = [],
  currentUserRole,
  className,
}) => {
  const management = useManagement();
  const { roleHierarchy, manageableRoles, isLoading } = useRoles();
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  // Determine which roles to show
  const availableRoles = filterManageableOnly 
    ? manageableRoles 
    : roleHierarchy?.roles || [];

  // Filter out excluded roles
  const filteredRoles = availableRoles.filter(role => 
    !excludeRoles.includes(role.name)
  );

  const selectedRole = value ? filteredRoles.find(r => r.name === value) : null;

  const getRoleDescription = (roleName: string) => {
    const descriptions = {
      owner: 'Complete system control with all permissions. Can manage any user or role.',
      admin: 'Full administrative access. Can manage moderators and users, access audit logs.',
      moderator: 'Limited administrative access. Can view and manage regular users only.',
      user: 'Standard user access. Can manage own profile and access learning content.'
    };
    return descriptions[roleName] || 'Role description not available';
  };

  const getRoleWarning = (targetRole: string, currentRole?: string) => {
    if (!currentRole || !targetRole) return null;

    const currentRoleData = roleHierarchy?.roles?.find(r => r.name === currentRole);
    const targetRoleData = roleHierarchy?.roles?.find(r => r.name === targetRole);

    if (!currentRoleData || !targetRoleData) return null;

    if (targetRoleData.level > currentRoleData.level) {
      return {
        type: 'warning' as const,
        message: 'This role has higher privileges than the current user role.'
      };
    }

    if (targetRoleData.level === currentRoleData.level) {
      return {
        type: 'info' as const,
        message: 'This role has the same privilege level as the current user role.'
      };
    }

    return null;
  };

  const warning = currentUserRole ? getRoleWarning(value || '', currentUserRole) : null;

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-slate-400', className)}>
        <Shield className="w-4 h-4 animate-pulse" />
        <span>Loading roles...</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Select
          value={value}
          onValueChange={onValueChange}
          disabled={disabled || filteredRoles.length === 0}
        >
          <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <SelectValue placeholder={placeholder} />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {filteredRoles.length === 0 ? (
              <SelectItem 
                value="" 
                disabled
                className="text-slate-500 focus:bg-slate-700"
              >
                No roles available
              </SelectItem>
            ) : (
              filteredRoles.map((role) => {
                const roleInfo = formatRole(role.name);
                return (
                  <SelectItem
                    key={role.name}
                    value={role.name}
                    className="text-slate-200 focus:bg-slate-700 focus:text-white"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span>{roleInfo.icon}</span>
                        <span>{roleInfo.text}</span>
                        <span className="text-xs text-slate-500">
                          (Level {role.level})
                        </span>
                      </div>
                      {showPermissionCount && (
                        <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs ml-2">
                          {role.permissions?.length || 0}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>

        {/* Role Info Button */}
        {selectedRole && showDescriptions && (
          <Popover open={showRoleInfo} onOpenChange={setShowRoleInfo}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Info className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-slate-800 border-slate-600" align="end">
              <Card className="bg-transparent border-0 shadow-none">
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center gap-2">
                    {formatRole(selectedRole.name).icon}
                    <h4 className="font-semibold text-slate-200">
                      {formatRole(selectedRole.name).text}
                    </h4>
                    <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                      Level {selectedRole.level}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-slate-300">
                    {getRoleDescription(selectedRole.name)}
                  </p>
                  
                  {selectedRole.permissions && selectedRole.permissions.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-slate-300">
                        Key Permissions ({selectedRole.permissions.length} total):
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedRole.permissions.slice(0, 4).map((permission) => (
                          <Badge
                            key={permission}
                            variant="secondary"
                            className="bg-slate-700 text-slate-300 text-xs"
                          >
                            {permission.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {selectedRole.permissions.length > 4 && (
                          <Badge
                            variant="secondary"
                            className="bg-slate-700 text-slate-300 text-xs"
                          >
                            +{selectedRole.permissions.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Role Warning/Info */}
      {warning && (
        <Alert className={cn(
          warning.type === 'warning' 
            ? 'bg-yellow-900/20 border-yellow-500/30' 
            : 'bg-blue-900/20 border-blue-500/30'
        )}>
          {warning.type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          ) : (
            <Info className="w-4 h-4 text-blue-400" />
          )}
          <AlertDescription className={cn(
            warning.type === 'warning' ? 'text-yellow-300' : 'text-blue-300'
          )}>
            {warning.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Role Summary */}
      {selectedRole && showDescriptions && (
        <Card className="bg-slate-800/30 border-slate-600">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {formatRole(selectedRole.name).icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-slate-200">
                    {formatRole(selectedRole.name).text}
                  </h5>
                  <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                    Level {selectedRole.level}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">
                  {getRoleDescription(selectedRole.name)}
                </p>
                {showPermissionCount && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                      {selectedRole.permissions?.length || 0} permissions
                    </Badge>
                    {management.canManageRole(selectedRole.name) && (
                      <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Manageable
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Roles Available Message */}
      {filteredRoles.length === 0 && (
        <Alert className="bg-slate-800/50 border-slate-600">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-slate-300">
            {filterManageableOnly 
              ? 'No manageable roles available. You may not have permission to assign roles.'
              : 'No roles are currently available in the system.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RoleSelector;