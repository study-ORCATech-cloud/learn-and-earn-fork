// Users management page with table, filters, and bulk actions

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Filter, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useManagement } from '../context/ManagementContext';
import { useUsers } from '../hooks/useUsers';
import UserTable from '../components/users/UserTable';
import UserFilters from '../components/users/UserFilters';
import BulkUserActions from '../components/users/BulkUserActions';
import SearchInput from '../components/common/SearchInput';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { UserFilters as UserFiltersType } from '../types/user';

const UsersPage: React.FC = () => {
  const management = useManagement();
  const {
    users,
    pagination,
    filters,
    isLoading,
    error,
    selectedUsers,
    fetchUsers,
    searchUsers,
    setFilters,
    setSelectedUsers,
    exportUsers,
    isExporting,
  } = useUsers();

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load users on mount
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (query.trim().length >= 2) {
      await searchUsers(query);
    } else if (query.trim().length === 0) {
      await fetchUsers(filters);
    }
  };

  const handleFilterChange = async (newFilters: Partial<UserFiltersType>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    await fetchUsers(updatedFilters);
  };

  const handlePageChange = async (page: number) => {
    await fetchUsers({ ...filters, page });
  };

  const handlePageSizeChange = async (pageSize: number) => {
    await fetchUsers({ ...filters, limit: pageSize, page: 1 });
  };

  const handleRefresh = async () => {
    await fetchUsers(filters);
  };

  const handleExport = async () => {
    await exportUsers(filters);
  };

  const handleBulkActionComplete = async () => {
    setSelectedUsers([]);
    await fetchUsers(filters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
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
            {pagination && (
              <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                {pagination.total.toLocaleString()} users
              </Badge>
            )}
          </h1>
          <p className="text-slate-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {management.canPerformOperation('create_users') && (
            <Link to="/management/users/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <SearchInput
                placeholder="Search users by name or email..."
                onSearch={handleSearch}
                className="max-w-md"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <UserFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
          onClear={() => handleFilterChange({})}
        />
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <BulkUserActions
          selectedUserIds={selectedUsers}
          onClearSelection={() => setSelectedUsers([])}
          onComplete={handleBulkActionComplete}
        />
      )}

      {/* Users Table */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">
            {searchTerm ? (
              <span>Search Results for "{searchTerm}"</span>
            ) : getActiveFiltersCount() > 0 ? (
              <span>Filtered Users</span>
            ) : (
              <span>All Users</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-semibold">Failed to Load Users</p>
                <p className="text-sm text-slate-500 mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-slate-600 text-slate-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : isLoading && users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner text="Loading users..." />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {searchTerm || getActiveFiltersCount() > 0 ? 'No Users Found' : 'No Users Yet'}
              </h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || getActiveFiltersCount() > 0
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first user account.'
                }
              </p>
              {!searchTerm && getActiveFiltersCount() === 0 && management.canPerformOperation('create_users') && (
                <Link to="/management/users/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create First User
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <UserTable
                users={users}
                selectedUsers={selectedUsers}
                onSelectionChange={setSelectedUsers}
                onUserAction={handleRefresh}
                isLoading={isLoading}
              />
              
              {pagination && pagination.pages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={pagination.total}
                    pageSize={pagination.per_page}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {pagination && users.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center gap-4">
                <span>
                  Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
                  {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
                  {pagination.total.toLocaleString()} users
                </span>
                {selectedUsers.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{selectedUsers.length} selected</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {getActiveFiltersCount() > 0 && (
                  <span>{getActiveFiltersCount()} filter{getActiveFiltersCount() === 1 ? '' : 's'} active</span>
                )}
                {searchTerm && (
                  <>
                    <span>•</span>
                    <span>Search: "{searchTerm}"</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsersPage;