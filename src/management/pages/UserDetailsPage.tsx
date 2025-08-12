// User details page with comprehensive user information

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Shield, 
  UserX, 
  UserCheck,
  RefreshCw,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useManagement } from '../context/ManagementContext';
import { userManagementService } from '../services/userManagementService';
import UserDetails from '../components/users/UserDetails';
import UserForm from '../components/users/UserForm';
import UserAuditLog from '../components/users/UserAuditLog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { ManagementUser, UserProvider, UserAuditEntry } from '../types/user';

const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const management = useManagement();

  const [user, setUser] = useState<ManagementUser | null>(null);
  const [providers, setProviders] = useState<UserProvider[]>([]);
  const [auditLog, setAuditLog] = useState<UserAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showConfirmAction, setShowConfirmAction] = useState<{
    type: 'activate' | 'deactivate';
    user: ManagementUser;
  } | null>(null);

  const canViewUser = management.canPerformOperation('view_all_users') || 
                     (management.currentUser?.id === userId);
  const canEditUser = management.canPerformOperation('edit_all_users') || 
                     (management.currentUser?.id === userId);
  const canViewProviders = management.currentUserRole === 'admin' || 
                          management.currentUserRole === 'owner' ||
                          (management.currentUser?.id === userId);
  const canViewAudit = management.currentUserRole === 'admin' || 
                      management.currentUserRole === 'owner';

  useEffect(() => {
    if (!userId) {
      navigate('/management/users');
      return;
    }

    if (!canViewUser) {
      setError('You do not have permission to view this user.');
      setIsLoading(false);
      return;
    }

    fetchUserData();
  }, [userId, canViewUser]);

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch user details
      const userData = await userManagementService.getUserById(userId);
      setUser(userData);

      // Fetch providers if permitted
      if (canViewProviders) {
        setIsLoadingProviders(true);
        try {
          const providersData = await userManagementService.getUserProviders(userId);
          setProviders(providersData.providers);
        } catch (err) {
          console.error('Failed to fetch user providers:', err);
        } finally {
          setIsLoadingProviders(false);
        }
      }

      // Fetch audit log if permitted
      if (canViewAudit) {
        setIsLoadingAudit(true);
        try {
          const auditData = await userManagementService.getUserAudit(userId, { limit: 20 });
          setAuditLog(auditData.audit_logs);
        } catch (err) {
          console.error('Failed to fetch user audit log:', err);
        } finally {
          setIsLoadingAudit(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleUpdateUser = async (data: any) => {
    if (!user || !userId) return false;

    try {
      setIsUpdating(true);
      await userManagementService.updateUser(userId, data);
      await fetchUserData(); // Refresh user data
      setIsEditing(false);
      return true;
    } catch (err) {
      console.error('Failed to update user:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUserAction = async (action: 'activate' | 'deactivate', reason?: string) => {
    if (!user || !userId) return;

    try {
      setActionLoading(action);

      if (action === 'activate') {
        await userManagementService.activateUser(userId, reason);
      } else {
        await userManagementService.deactivateUser(userId, reason);
      }

      await fetchUserData(); // Refresh user data
      setShowConfirmAction(null);
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!canViewUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-6xl text-slate-600">🔒</div>
          <h2 className="text-xl font-semibold text-slate-300">Access Restricted</h2>
          <p className="text-slate-500">
            You don't have permission to view this user.
          </p>
          <Link to="/management/users">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading user details..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/management/users">
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </Link>

        <Alert className="bg-red-900/20 border-red-500/30">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-red-300">
            {error || 'User not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/management/users">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          
          <div className="h-6 w-px bg-slate-600" />
          
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit User' : 'User Details'}
            </h1>
            <p className="text-slate-400">{user.name} • {user.email}</p>
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUserData}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </Button>

            {/* User Actions */}
            {management.canPerformOperation('delete_user') && user.id !== management.currentUser?.id && (
              <>
                {user.is_active ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmAction({ type: 'deactivate', user })}
                    disabled={!!actionLoading}
                    className="border-red-500/50 text-red-400 hover:bg-red-900/20"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmAction({ type: 'activate', user })}
                    disabled={!!actionLoading}
                    className="border-green-500/50 text-green-400 hover:bg-green-900/20"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                )}
              </>
            )}

            {canEditUser && (
              <Button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit User
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      {isEditing ? (
        <UserForm
          user={user}
          onSubmit={handleUpdateUser}
          onCancel={handleCancelEdit}
          isLoading={isUpdating}
        />
      ) : (
        <UserDetails
          user={user}
          providers={providers}
          auditLog={auditLog}
          onEdit={canEditUser ? handleEdit : undefined}
          onRefresh={fetchUserData}
          isLoadingProviders={isLoadingProviders}
          isLoadingAudit={isLoadingAudit}
        />
      )}

      {/* Audit Log Section */}
      {!isEditing && canViewAudit && (
        <UserAuditLog userId={user.id} />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={!!showConfirmAction}
        onClose={() => setShowConfirmAction(null)}
        onConfirm={(reason) => {
          if (showConfirmAction) {
            handleUserAction(showConfirmAction.type, reason);
          }
        }}
        title={showConfirmAction ? `${showConfirmAction.type === 'activate' ? 'Activate' : 'Deactivate'} User` : ''}
        description={
          showConfirmAction
            ? `Are you sure you want to ${showConfirmAction.type} ${showConfirmAction.user.name}? ${
                showConfirmAction.type === 'deactivate' 
                  ? 'This will prevent them from accessing the system.' 
                  : 'This will restore their access to the system.'
              }`
            : ''
        }
        confirmText={showConfirmAction?.type === 'activate' ? 'Activate User' : 'Deactivate User'}
        cancelText="Cancel"
        variant={showConfirmAction?.type === 'deactivate' ? 'destructive' : 'default'}
        requiresReason={showConfirmAction?.type === 'deactivate'}
        isLoading={!!actionLoading}
      />
    </div>
  );
};

export default UserDetailsPage;