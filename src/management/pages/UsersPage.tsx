// Users management page with tabs, statistics, and user management tools

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Download, RefreshCw, BarChart3, Table, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useManagement } from '../context/ManagementContext';
import { useRoles } from '../hooks/useRoles';
import { useUsers } from '../hooks/useUsers';
import { formatRole } from '../utils/formatters';
import UserTable from '../components/users/UserTable';
import UserFilters from '../components/users/UserFilters';
import type { UserFilters as UserFiltersType } from '../types/user';

const UsersPage: React.FC = () => {
  const management = useManagement();
  const { roleHierarchy } = useRoles();
  const { refresh } = useUsers();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<UserFiltersType>({});

  // For statistics, we'll need to get this info from UserTable or remove it for now
  const totalUsers = 0; // Will be managed by UserTable
  const activeUsers = 0; // Will be managed by UserTable  
  const inactiveUsers = 0; // Will be managed by UserTable

  const handleRefresh = async () => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      try {
        await refresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };


  const handleFilterChange = async (newFilters: Partial<UserFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Export functionality not yet implemented
      console.warn('Export functionality not implemented in useUsers hook');
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsExporting(false);
    }
  };




  if (!management.canPerformOperation('view_all_users')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-6xl text-slate-600">🔒</div>
          <h2 className="text-xl font-semibold text-slate-300">Access Restricted</h2>
          <p className="text-slate-500">
            You don't have permission to view users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            User Management
            <Badge variant="secondary" className="bg-slate-700 text-slate-200">
              {totalUsers} users
            </Badge>
          </h1>
          <p className="text-slate-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {totalUsers}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  All registered accounts
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
                <p className="text-slate-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {activeUsers}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Currently enabled accounts
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

      {/* User Management Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border border-slate-600">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="users"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            <Table className="w-4 h-4 mr-2" />
            All Users
          </TabsTrigger>
          <TabsTrigger 
            value="bulk"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Bulk Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 text-lg">User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-300">Account Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Active Users</span>
                      <span className="text-green-400 font-semibold">{activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Inactive Users</span>
                      <span className="text-orange-400 font-semibold">{inactiveUsers}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-300">Management Access</h4>
                  <div className="space-y-2 text-slate-400">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                      <p>User roles determine system permissions</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                      <p>Higher-level roles can manage lower-level users</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                      <p>All user changes are logged in the audit trail</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Controls Bar */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </div>
              </CardContent>
            </Card>

          {/* User Management Content */}
          <>
            {/* Filters */}
            <UserFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
              onClearFilters={clearFilters}
            />

            {/* Users Table with built-in search and bulk actions */}
            <UserTable
              onUserClick={(user) => navigate(`/management/users/${user.id}`)}
              onUserEdit={(user) => navigate(`/management/users/${user.id}`)}
              filters={filters}
            />
          </>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 text-lg">Bulk Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Select Users for Bulk Actions</h3>
                <p className="text-slate-500">
                  Go to the "All Users" tab and select users to perform bulk operations like role changes, activation, or deactivation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
    </div>
  );
};

export default UsersPage;