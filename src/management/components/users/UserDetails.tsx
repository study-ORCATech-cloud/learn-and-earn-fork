// User details component with comprehensive information display

import React, { useState } from 'react';
import { 
  Edit2, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  Link2, 
  Activity,
  User,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useManagement } from '../../context/ManagementContext';
import { formatDate, formatRelativeTime, formatRole } from '../../utils/formatters';
import type { ManagementUser, UserProvider, UserAuditEntry } from '../../types/user';

interface UserDetailsProps {
  user: ManagementUser;
  providers?: UserProvider[];
  auditLog?: UserAuditEntry[];
  onEdit?: (user: ManagementUser) => void;
  onRefresh?: () => void;
  isLoadingProviders?: boolean;
  isLoadingAudit?: boolean;
  className?: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  providers = [],
  auditLog = [],
  onEdit,
  onRefresh,
  isLoadingProviders = false,
  isLoadingAudit = false,
  className,
}) => {
  const management = useManagement();
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'activity'>('overview');

  const roleInfo = formatRole(user.role);
  const canEdit = management.canPerformOperation('edit_user', user.role);
  const canViewProviders = management.currentUserRole === 'admin' || management.currentUserRole === 'owner';
  const canViewActivity = management.currentUserRole === 'admin' || management.currentUserRole === 'owner';

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🔍';
      case 'github':
        return '🐙';
      default:
        return '🔗';
    }
  };

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
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: <User className="w-4 h-4" />,
    },
    ...(canViewProviders ? [{
      id: 'providers' as const,
      label: 'Providers',
      icon: <Link2 className="w-4 h-4" />,
      badge: providers.length > 0 ? providers.length : undefined,
    }] : []),
    ...(canViewActivity ? [{
      id: 'activity' as const,
      label: 'Activity',
      icon: <Activity className="w-4 h-4" />,
      badge: auditLog.length > 0 ? auditLog.length : undefined,
    }] : []),
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="bg-slate-700 text-slate-200 text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  {!user.is_active && (
                    <Badge variant="secondary" className="bg-red-900/20 text-red-400 border-red-500/30">
                      Inactive
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={cn('px-3 py-1 border', roleInfo.className)}
                  >
                    <span className="mr-1">{roleInfo.icon}</span>
                    {roleInfo.text}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Refresh
                </Button>
              )}
              
              {canEdit && onEdit && (
                <Button
                  onClick={() => onEdit(user)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <Badge variant="secondary" className="ml-1 bg-slate-600 text-slate-200 text-xs">
                {tab.badge}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">User ID</label>
                  <p className="text-slate-200 font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Status</label>
                  <div className="flex items-center gap-2">
                    {user.is_active ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Created:</span>
                  <span className="text-slate-200">{formatDate(user.created_at)}</span>
                  <span className="text-slate-400">({formatRelativeTime(user.created_at)})</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Updated:</span>
                  <span className="text-slate-200">{formatDate(user.updated_at)}</span>
                  <span className="text-slate-400">({formatRelativeTime(user.updated_at)})</span>
                </div>

                {user.last_login && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Last Login:</span>
                    <span className="text-slate-200">{formatDate(user.last_login)}</span>
                    <span className="text-slate-400">
                      ({user.last_login_ago || formatRelativeTime(user.last_login)})
                    </span>
                  </div>
                )}

                {!user.last_login && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Last Login:</span>
                    <span className="text-slate-500">Never</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canViewProviders && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">OAuth Providers</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {user.provider_count || providers.length || 1}
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Age</span>
                <span className="text-slate-200">{formatRelativeTime(user.created_at)}</span>
              </div>

              {user.last_login && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Activity</span>
                  <span className="text-slate-200">
                    {user.last_login_ago || formatRelativeTime(user.last_login)}
                  </span>
                </div>
              )}

              <Separator className="bg-slate-700" />

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Role Level</span>
                <span className="text-slate-200">{roleInfo.text}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'providers' && canViewProviders && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              OAuth Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProviders ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-400">Loading providers...</div>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No OAuth providers found
              </div>
            ) : (
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getProviderIcon(provider.provider)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-200 font-medium capitalize">
                            {provider.provider}
                          </span>
                          {provider.is_primary && (
                            <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">
                          {provider.provider_email}
                        </div>
                        {provider.provider_name && provider.provider_name !== user.name && (
                          <div className="text-xs text-slate-500">
                            Name: {provider.provider_name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-sm text-slate-400">
                        Linked: {formatDate(provider.linked_at)}
                      </div>
                      {provider.last_used && (
                        <div className="text-xs text-slate-500">
                          Last used: {formatRelativeTime(provider.last_used)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && canViewActivity && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAudit ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-400">Loading activity...</div>
              </div>
            ) : auditLog.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No recent activity found
              </div>
            ) : (
              <div className="space-y-4">
                {auditLog.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700"
                  >
                    <div className="mt-0.5">
                      {getActionIcon(entry.action)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200 font-medium">
                          {entry.action.replace('_', ' ').toLowerCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </div>
                      
                      {entry.reason && (
                        <p className="text-sm text-slate-400">{entry.reason}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {entry.performed_by && (
                          <span>By: {entry.performed_by}</span>
                        )}
                        <span>{formatDate(entry.timestamp)}</span>
                      </div>

                      {(entry.old_values || entry.new_values) && (
                        <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs">
                          {entry.old_values && (
                            <div className="text-red-400">
                              Old: {JSON.stringify(entry.old_values)}
                            </div>
                          )}
                          {entry.new_values && (
                            <div className="text-green-400">
                              New: {JSON.stringify(entry.new_values)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {auditLog.length > 10 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Activity Log
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDetails;