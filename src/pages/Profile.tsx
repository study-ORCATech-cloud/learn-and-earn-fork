// User Profile Page - Shows current user's profile information

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Globe, Clock, Shield, ExternalLink, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// Helper functions for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`;
};

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl text-slate-600">🔒</div>
          <h2 className="text-xl font-semibold text-slate-300">Authentication Required</h2>
          <p className="text-slate-500">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const getProviderIcon = (provider: string) => {
    return <Globe className="text-slate-300 w-4 h-4" />;
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-purple-900/30 text-purple-400 border-purple-500/30';
      case 'admin':
        return 'bg-red-900/30 text-red-400 border-red-500/30';
      case 'moderator':
        return 'bg-blue-900/30 text-blue-400 border-blue-500/30';
      case 'user':
        return 'bg-green-900/30 text-green-400 border-green-500/30';
      default:
        return 'bg-slate-900/30 text-slate-400 border-slate-500/30';
    }
  };

  const formatRoleDisplay = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Back to Home Button */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || (user as any).avatar_url} alt={user.name} />
              <AvatarFallback className="bg-slate-700 text-slate-200 text-2xl">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-slate-400 text-lg mb-3">{user.email}</p>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className={cn('text-sm', getRoleBadgeStyle(user.role))}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {formatRoleDisplay(user.role)}
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  <span className="mr-1">{getProviderIcon(user.provider)}</span>
                  {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Information */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">User ID</div>
                  <div className="text-slate-200 font-mono text-sm bg-slate-800 p-3 rounded border border-slate-600">
                    {user.id}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-400 mb-1">Display Name</div>
                  <div className="text-slate-200">{user.name}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-1">Email Address</div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a
                      href={`mailto:${user.email}`}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {user.email}
                    </a>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-1">Authentication Provider</div>
                  <div className="flex items-center gap-2">
                    {getProviderIcon(user.provider)}
                    <span className="text-slate-200 capitalize">{user.provider}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role & Access Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-400 mb-2">Current Role</div>
                  <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-md border border-slate-600">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <div>
                      <div className="text-slate-200 font-medium text-lg">
                        {formatRoleDisplay(user.role)}
                      </div>
                      <div className="text-sm text-slate-400">
                        {user.role === 'owner' && 'Full system access with all administrative privileges'}
                        {user.role === 'admin' && 'Administrative access to most system features'}
                        {user.role === 'moderator' && 'Moderation access with user management capabilities'}
                        {user.role === 'user' && 'Standard user access to learning features'}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-2">Access Permissions</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                      <span className="text-slate-300 text-sm">Learning Content</span>
                      <Badge variant="secondary" className="bg-green-900/30 text-green-400 border-green-500/30">
                        Enabled
                      </Badge>
                    </div>
                    {(user.role === 'admin' || user.role === 'moderator' || user.role === 'owner') && (
                      <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-300 text-sm">Management Dashboard</span>
                        <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-500/30">
                          Enabled
                        </Badge>
                      </div>
                    )}
                    {(user.role === 'admin' || user.role === 'owner') && (
                      <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-300 text-sm">User Management</span>
                        <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 border-purple-500/30">
                          Enabled
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Activity */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Account Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-400 mb-1">Last Login</div>
                <div className="text-slate-200">
                  {(user as any).last_login ? (
                    <div>
                      <div>{formatDate((user as any).last_login)}</div>
                      <div className="text-sm text-slate-500">
                        {formatRelativeTime((user as any).last_login)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500">Login information not available</span>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div>
                <div className="text-sm text-slate-400 mb-1">Account Created</div>
                <div className="text-slate-200">
                  {(user as any).created_at || user.createdAt ? (
                    <div>
                      <div>{formatDate((user as any).created_at || user.createdAt)}</div>
                      <div className="text-sm text-slate-500">
                        {formatRelativeTime((user as any).created_at || user.createdAt)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500">Account creation date not available</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {(user.role === 'admin' || user.role === 'moderator' || user.role === 'owner') && (
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <a href="/management">
                      <Shield className="w-4 h-4 mr-2" />
                      Open Management Dashboard
                    </a>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile Settings
                </Button>

                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-500 text-center">
                    Profile settings and preferences are managed through your {user.provider} account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;