// Management dashboard with overview metrics and quick actions

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Settings, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Database,
  Plus,
  Eye,
  UserPlus,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useManagement } from '../context/ManagementContext';
import { useUsers } from '../hooks/useUsers';
import { useSystemHealth } from '../hooks/useSystemHealth';
import { formatRelativeTime } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  permission?: string;
  color?: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  to,
  permission,
  color = 'text-blue-400'
}) => {
  const management = useManagement();
  
  if (permission && !management.canPerformOperation(permission)) {
    return null;
  }

  return (
    <Link to={to}>
      <Card className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 transition-all duration-200 hover:border-slate-500">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn('mt-1', color)}>
              {icon}
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-slate-200">{title}</h4>
              <p className="text-sm text-slate-400">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const ManagementDashboard: React.FC = () => {
  const management = useManagement();
  const { 
    users, 
    pagination, 
    isLoading: usersLoading, 
    fetchUsers 
  } = useUsers();
  
  const { 
    healthData, 
    cacheStats, 
    isLoading: healthLoading 
  } = useSystemHealth({ autoRefresh: true });

  // Load initial data
  React.useEffect(() => {
    if (management.canPerformOperation('view_all_users')) {
      fetchUsers({ limit: 10 }); // Just for stats
    }
  }, [management, fetchUsers]);

  const getHealthStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
      case 'unhealthy':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getHealthStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
      case 'unhealthy':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  // Calculate user statistics
  const userStats = React.useMemo(() => {
    if (!users.length) return null;
    
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeCount = users.filter(user => user.is_active).length;
    const inactiveCount = users.length - activeCount;
    const recentLogins = users.filter(user => 
      user.last_login && 
      new Date(user.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      total: pagination?.total || users.length,
      active: activeCount,
      inactive: inactiveCount,
      recentLogins,
      roles: roleCount
    };
  }, [users, pagination]);

  const quickActions = [
    {
      title: 'View All Users',
      description: 'Manage user accounts and permissions',
      icon: <Users className="w-5 h-5" />,
      to: '/management/users',
      permission: 'view_all_users',
      color: 'text-blue-400'
    },
    {
      title: 'Create User',
      description: 'Add a new user account',
      icon: <UserPlus className="w-5 h-5" />,
      to: '/management/users/create',
      permission: 'create_users',
      color: 'text-green-400'
    },
    {
      title: 'Role Management',
      description: 'View roles and permissions',
      icon: <Shield className="w-5 h-5" />,
      to: '/management/roles',
      permission: 'view_all_users',
      color: 'text-purple-400'
    },
    {
      title: 'System Health',
      description: 'Monitor system status and performance',
      icon: <Activity className="w-5 h-5" />,
      to: '/management/system',
      permission: 'manage_system',
      color: 'text-orange-400'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {management.currentUser?.name || 'Administrator'}
        </h1>
        <p className="text-slate-400">
          System overview and management dashboard
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Health */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">System Health</p>
                <div className="flex items-center gap-2 mt-1">
                  {healthLoading ? (
                    <div className="w-5 h-5 bg-slate-600 rounded animate-pulse" />
                  ) : (
                    getHealthStatusIcon(healthData?.status)
                  )}
                  <span className={cn('font-semibold', getHealthStatusColor(healthData?.status))}>
                    {healthLoading ? 'Loading...' : (healthData?.status?.charAt(0).toUpperCase() + healthData?.status?.slice(1) || 'Unknown')}
                  </span>
                </div>
                {healthData?.timestamp && (
                  <p className="text-xs text-slate-500 mt-1">
                    Updated {formatRelativeTime(healthData.timestamp)}
                  </p>
                )}
              </div>
              <Activity className="w-8 h-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Users */}
        {management.canPerformOperation('view_all_users') && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {usersLoading ? '...' : (userStats?.total.toLocaleString() || '0')}
                  </p>
                  {userStats && (
                    <p className="text-xs text-slate-500 mt-1">
                      {userStats.active} active, {userStats.inactive} inactive
                    </p>
                  )}
                </div>
                <Users className="w-8 h-8 text-slate-600" />
              </div>
            </div>
          </Card>
        )}

        {/* Cache Performance */}
        {management.canPerformOperation('manage_system') && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Cache Hit Rate</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {healthLoading ? '...' : `${cacheStats?.lab_cache?.hit_rate?.toFixed(1) || '0'}%`}
                  </p>
                  {cacheStats?.lab_cache && (
                    <p className="text-xs text-slate-500 mt-1">
                      {cacheStats.lab_cache.hits?.toLocaleString()} hits
                    </p>
                  )}
                </div>
                <Database className="w-8 h-8 text-slate-600" />
              </div>
            </div>
          </Card>
        )}

        {/* Role Distribution */}
        {management.canPerformOperation('view_all_users') && userStats && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Role Distribution</p>
                  <div className="mt-2 space-y-1">
                    {Object.entries(userStats.roles).slice(0, 2).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300 capitalize">{role}s</span>
                        <span className="text-slate-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Shield className="w-8 h-8 text-slate-600" />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <QuickAction key={action.title} {...action} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        {management.canPerformOperation('view_all_users') && userStats && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                User Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Activity Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Active Users</span>
                  <span className="text-slate-300">
                    {Math.round((userStats.active / userStats.total) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(userStats.active / userStats.total) * 100} 
                  className="h-2"
                />
              </div>

              {/* Recent Logins */}
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">Recent Logins</p>
                    <p className="text-xs text-slate-500">Last 7 days</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {userStats.recentLogins}
                </Badge>
              </div>

              {/* Role Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Role Breakdown</h4>
                {Object.entries(userStats.roles).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 capitalize">{role}s</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">{count}</span>
                      <span className="text-slate-500">
                        ({Math.round((count / userStats.total) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-700">
                <Link to="/management/users">
                  <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Users
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        {management.canPerformOperation('manage_system') && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="w-20 h-4 bg-slate-700 rounded animate-pulse" />
                      <div className="w-16 h-4 bg-slate-700 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* System Status */}
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getHealthStatusIcon(healthData?.status)}
                      <div>
                        <p className="text-sm font-medium text-slate-200">System Status</p>
                        <p className="text-xs text-slate-500">Overall health</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn('border-current', getHealthStatusColor(healthData?.status))}
                    >
                      {healthData?.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>

                  {/* Environment */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Environment</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'border text-xs',
                        healthData?.environment === 'production'
                          ? 'border-red-500/30 text-red-400'
                          : 'border-blue-500/30 text-blue-400'
                      )}
                    >
                      {healthData?.environment?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>

                  {/* Version */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Version</span>
                    <span className="text-slate-300 text-sm font-mono">
                      {healthData?.version || 'Unknown'}
                    </span>
                  </div>

                  {/* Cache Stats */}
                  {cacheStats?.lab_cache && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Cache Hit Rate</span>
                        <span className="text-slate-300 text-sm">
                          {cacheStats.lab_cache.hit_rate?.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Cache Size</span>
                        <span className="text-slate-300 text-sm">
                          {cacheStats.data_cache?.size || 'Unknown'}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="pt-2 border-t border-slate-700">
                <Link to="/management/system">
                  <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300">
                    <Settings className="w-4 h-4 mr-2" />
                    System Management
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Welcome Message for New Users */}
      {management.currentUserRole === 'admin' && (
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Management System Ready</h3>
                <p className="text-slate-300">
                  You have full administrative access to the Learn & Earn management system. 
                  Use the navigation above to manage users, roles, and system settings.
                </p>
                <div className="flex gap-3 mt-4">
                  <Link to="/management/users">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                  <Link to="/management/roles">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                      <Shield className="w-4 h-4 mr-2" />
                      View Roles
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManagementDashboard;