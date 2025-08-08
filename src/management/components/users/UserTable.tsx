// User table component with advanced features

import React from 'react';
import { Edit2, Eye, UserX, UserCheck, Shield, MoreHorizontal } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useManagement } from '../../context/ManagementContext';
import { formatDate, formatRelativeTime, formatRole } from '../../utils/formatters';
import DataTable from '../common/DataTable';
import SearchInput from '../common/SearchInput';
import BulkActionBar from '../common/BulkActionBar';
import type { TableColumn, TableAction } from '../common/DataTable';
import type { ManagementUser, UserFilters } from '../../types/user';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserTableProps {
  onUserClick?: (user: ManagementUser) => void;
  onUserEdit?: (user: ManagementUser) => void;
  filters?: UserFilters;
  className?: string;
}

const UserTable: React.FC<UserTableProps> = ({
  onUserClick,
  onUserEdit,
  filters = {},
  className,
}) => {
  const management = useManagement();
  const { roleHierarchy } = useRoles();
  const {
    users,
    isLoading,
    error,
    selectedUserIds,
    selectedCount,
    isUserSelected,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    searchUsers,
    clearSearch,
    searchQuery,
    searchResults,
    isSearching,
    deactivateUser,
    activateUser,
    refresh,
  } = useUsers();

  // Determine if we should show search results or regular users
  const displayUsers = searchQuery ? searchResults : users;

  const handleSearch = (query: string) => {
    if (query.trim()) {
      searchUsers(query);
    } else {
      clearSearch();
    }
  };

  const handleUserActivate = async (user: ManagementUser) => {
    if (user.is_active) {
      await deactivateUser(user.id, 'Deactivated via user table');
    } else {
      await activateUser(user.id, 'Reactivated via user table');
    }
  };

  // Define table columns
  const columns: TableColumn<ManagementUser>[] = [
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback className="bg-slate-700 text-slate-200">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              {!user.is_active && (
                <Badge variant="secondary" className="bg-red-900/20 text-red-400 border-red-500/30">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      align: 'center',
      render: (_, user) => {
        const roleInfo = formatRole(user.role, roleHierarchy);
        return (
          <div className="flex items-center justify-center">
            <Badge 
              variant="secondary" 
              className={cn('px-3 py-1 border', roleInfo.className)}
            >
              <span className="mr-1">{roleInfo.icon}</span>
              {roleInfo.text}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'last_login',
      label: 'Last Login',
      sortable: true,
      render: (value, user) => (
        <div className="text-sm">
          {user.last_login ? (
            <>
              <div className="text-slate-200">
                {formatDate(user.last_login)}
              </div>
              <div className="text-slate-400">
                {user.last_login_ago || formatRelativeTime(user.last_login)}
              </div>
            </>
          ) : (
            <span className="text-slate-500">Never</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="text-slate-200">
            {formatDate(value)}
          </div>
          <div className="text-slate-400">
            {formatRelativeTime(value)}
          </div>
        </div>
      ),
    },
    {
      key: 'provider_count',
      label: 'Providers',
      align: 'center',
      render: (value, user) => (
        <div className="text-center">
          {management.currentUserRole === 'admin' || management.currentUserRole === 'owner' ? (
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {user.provider_count || 1}
            </Badge>
          ) : (
            <span className="text-slate-500">-</span>
          )}
        </div>
      ),
    },
  ];

  // Define table actions
  const actions: TableAction<ManagementUser>[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: (user) => onUserClick?.(user),
    },
    {
      key: 'edit',
      label: 'Edit User',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: (user) => onUserEdit?.(user),
      disabled: (user) => !management.canPerformOperation('edit_user'),
    },
    {
      key: 'toggle_status',
      label: (user) => user.is_active ? 'Deactivate' : 'Activate',
      icon: (user) => user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />,
      onClick: handleUserActivate,
      disabled: (user) => !management.canPerformOperation('delete_user'),
      variant: (user) => user.is_active ? 'destructive' : 'default',
      className: (user) => user.is_active 
        ? 'text-red-400 hover:text-red-300' 
        : 'text-green-400 hover:text-green-300',
    },
    {
      key: 'manage_role',
      label: 'Change Role',
      icon: <Shield className="w-4 h-4" />,
      onClick: (user) => {
        // This would open a role change dialog
        console.log('Change role for user:', user.id);
      },
      disabled: (user) => !management.canManageRole(user.role),
    },
  ];

  if (error) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="text-center py-12">
          <div className="text-red-400 mb-2">Failed to load users</div>
          <div className="text-slate-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          placeholder="Search users by name or email..."
          onSearch={handleSearch}
          isLoading={isSearching}
          className="max-w-md"
        />
        
        <div className="flex items-center gap-2 text-sm text-slate-400">
          {searchQuery ? (
            <>
              {searchResults.length} result{searchResults.length === 1 ? '' : 's'} for "{searchQuery}"
            </>
          ) : (
            <>
              {users.length} user{users.length === 1 ? '' : 's'} total
            </>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <BulkActionBar
          selectedCount={selectedCount}
          selectedUserIds={selectedUserIds}
          onClearSelection={clearSelection}
          onRefresh={refresh}
        />
      )}

      {/* Users Table */}
      <DataTable
        data={displayUsers}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        error={error}
        emptyMessage={
          searchQuery 
            ? `No users found matching "${searchQuery}"`
            : "No users found"
        }
        selectable={management.canPerformOperation('bulk_operations')}
        selectedIds={selectedUserIds}
        onSelectionChange={(ids) => {
          // Update selection through the useUsers hook
          ids.forEach(id => {
            if (!isUserSelected(id)) {
              toggleUserSelection(id);
            }
          });
          
          // Remove unselected items
          selectedUserIds.forEach(id => {
            if (!ids.includes(id)) {
              toggleUserSelection(id);
            }
          });
        }}
        getRowId={(user) => user.id}
        onRowClick={onUserClick}
        getRowClassName={(user) => 
          cn(!user.is_active && 'opacity-60')
        }
        sortConfig={null} // We'll implement sorting later
        onSort={() => {}} // Placeholder
        responsive={true}
        stickyHeader={true}
      />

      {/* No results state */}
      {!isLoading && displayUsers.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">
            {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
          </div>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserTable;