// Roles management page with hierarchy and permissions

import React, { useState } from 'react';
import { Shield, Users, Eye, Grid3X3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useManagement } from '../context/ManagementContext';
import { useRoles } from '../hooks/useRoles';
import { getManageableRoleCount } from '../utils/permissions';
import { formatRole } from '../utils/formatters';
import RoleHierarchy from '../components/roles/RoleHierarchy';
import RolePermissions from '../components/roles/RolePermissions';
import PermissionsMatrix from '../components/roles/PermissionsMatrix';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RolesPage: React.FC = () => {
  const management = useManagement();
  const { roleHierarchy, manageableRoles, isLoading, error, refresh } = useRoles();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!management.canPerformOperation('view_all_users')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-6xl text-slate-600">🔒</div>
          <h2 className="text-xl font-semibold text-slate-300">Access Restricted</h2>
          <p className="text-slate-500">
            You don't have permission to view roles and permissions.
          </p>
        </div>
      </div>
    );
  }

  const totalRoles = roleHierarchy?.roles?.length || 0;
  const manageableRoleCount = getManageableRoleCount(management.currentUserRole, roleHierarchy);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('Failed to refresh roles:', error);
    } finally {
      // Add a small delay to show the feedback even if the request is very fast
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <Badge variant="secondary" className="bg-slate-700 text-slate-200">
          {totalRoles} roles
        </Badge>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', (isLoading || isRefreshing) && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Roles</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {isLoading ? '...' : totalRoles}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  System-wide role definitions
                </p>
              </div>
              <Shield className="w-8 h-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Manageable Roles</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {isLoading ? '...' : manageableRoleCount}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Roles you can assign
                </p>
              </div>
              <Users className="w-8 h-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Your Role</p>
                <p className="text-lg font-bold text-white mt-1">
                  {formatRole(management.currentUserRole, roleHierarchy).text}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Current access level
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                {formatRole(management.currentUserRole, roleHierarchy).icon}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <div className="text-center text-red-400">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <p>Failed to load role information</p>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="mt-3 bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
                {isRefreshing ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <LoadingSpinner text="Loading role information..." />
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Role Management Interface */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-600">
            <TabsTrigger 
              value="hierarchy" 
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Role Hierarchy
            </TabsTrigger>
            <TabsTrigger 
              value="permissions"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Permissions
            </TabsTrigger>
            <TabsTrigger 
              value="matrix"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Permissions Matrix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hierarchy" className="space-y-6">
            <RoleHierarchy />
            
            {/* Role Management Tips */}
            <Card className="bg-slate-800/30 border-slate-600">
              <CardHeader>
                <CardTitle className="text-slate-200 text-lg">Role Management Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-300">Role Hierarchy Rules</h4>
                    <div className="space-y-2 text-slate-400">
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                        <p>Higher-level roles can manage lower-level roles</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                        <p>Owner role can only be set at deployment time</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                        <p>Users cannot modify their own role or deactivate themselves</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-300">Permission System</h4>
                    <div className="space-y-2 text-slate-400">
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                        <p>Permissions are inherited from role definitions</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                        <p>Role changes are logged in the audit trail</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                        <p>All operations require proper authorization</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <RolePermissions
              selectedRole={selectedRole}
              onRoleSelect={setSelectedRole}
            />
          </TabsContent>

          <TabsContent value="matrix" className="space-y-6">
            <PermissionsMatrix
              showOnlyManageable={false}
              highlightRole={management.currentUserRole}
            />
            
            {/* Matrix Tips */}
            <Card className="bg-slate-800/30 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Grid3X3 className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-slate-300">Understanding the Permissions Matrix</h4>
                    <p className="text-sm text-slate-400">
                      This matrix shows which permissions each role has. Green checkmarks indicate 
                      granted permissions, while gray X marks indicate permissions not granted to that role.
                      Your current role ({management.currentUserRole}) is highlighted for reference.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RolesPage;