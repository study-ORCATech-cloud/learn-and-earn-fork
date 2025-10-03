import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Package as PackageIcon, 
  TrendingUp, 
  DollarSign, 
  Users, 
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  RotateCcw,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { usePackages } from '../hooks/usePackages';
import { usePackageAnalytics } from '../hooks/usePackageAnalytics';
import { packageManagementService } from '../services/packageManagementService';
import PackageForm from '../components/packages/PackageForm';
import PackageActionModal, { ActionType, ModalType, ResultType } from '../components/packages/PackageActionModal';
import { 
  Package, 
  PackageFilters, 
  CreatePackageData, 
  UpdatePackageData,
  PACKAGE_TYPE_OPTIONS,
  ANALYTICS_PERIOD_OPTIONS
} from '../types/package';

const PackagesPage: React.FC = () => {
  const [filters, setFilters] = useState<PackageFilters>({
    includeInactive: false,
    limit: 20,
    offset: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [selectedAnalyticsPeriod, setSelectedAnalyticsPeriod] = useState('30d');
  
  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: ModalType;
    actionType?: ActionType;
    resultType?: ResultType;
    title?: string;
    message?: string;
    packageName?: string;
    packageCount?: number;
    pendingAction?: () => Promise<void>;
    isLoading?: boolean;
  }>({
    isOpen: false,
    type: 'confirmation',
  });

  const {
    packages: allPackages,
    loading: packagesLoading,
    error: packagesError,
    pagination,
    selectedPackages,
    hasSelection,
    selectedCount,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    retrySync,
    bulkDelete,
    bulkToggleActive,
    selectPackage,
    unselectPackage,
    selectAllPackages,
    clearSelection,
    refreshPackages,
  } = usePackages(filters);

  // Frontend-only search filtering
  const packages = useMemo(() => {
    if (!searchTerm.trim()) {
      return allPackages;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return allPackages.filter(pkg => 
      pkg.name.toLowerCase().includes(searchLower) ||
      (pkg.description && pkg.description.toLowerCase().includes(searchLower))
    );
  }, [allPackages, searchTerm]);

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    fetchAnalytics,
  } = usePackageAnalytics(selectedAnalyticsPeriod);

  const handleCreatePackage = async (data: CreatePackageData): Promise<boolean> => {
    try {
      await createPackage(data);
      setShowCreateDialog(false);
      return true;
    } catch (error) {
      console.error('Failed to create package:', error);
      return false;
    }
  };

  const handleUpdatePackage = async (data: UpdatePackageData): Promise<boolean> => {
    if (!editingPackage) return false;
    
    try {
      await updatePackage(editingPackage.id, data);
      setEditingPackage(null);
      return true;
    } catch (error) {
      console.error('Failed to update package:', error);
      return false;
    }
  };

  const handleDeletePackage = (pkg: Package) => {
    setModal({
      isOpen: true,
      type: 'confirmation',
      actionType: 'delete',
      packageName: pkg.name,
      pendingAction: async () => {
        try {
          setModal(prev => ({ ...prev, isLoading: true }));
          
          // Call the service directly to avoid hook error state
          await packageManagementService.deletePackage(pkg.id);
          
          // Manually update the packages list to reflect the change
          refreshPackages();
          
          setModal({
            isOpen: true,
            type: 'result',
            resultType: 'success',
            title: 'Package Deleted',
            message: `Package "${pkg.name}" has been successfully deactivated.`,
          });
        } catch (error) {
          console.error('Failed to delete package:', error);
          
          let errorMessage = 'Failed to delete package. Please try again.';
          
          if (error instanceof Error) {
            if (error.message.includes('pending transactions')) {
              errorMessage = 'Cannot delete this package because it has pending transactions. Please wait for all transactions to complete.';
            } else if (error.message.includes('validation_error')) {
              errorMessage = 'This package cannot be deleted at this time. Please check if it has active subscriptions or recent transactions.';
            } else if (error.message.includes('unauthorized')) {
              errorMessage = 'You do not have permission to delete this package.';
            } else if (error.message.includes('not_found')) {
              errorMessage = 'Package not found. It may have already been deleted.';
            }
          }
          
          setModal({
            isOpen: true,
            type: 'result',
            resultType: 'error',
            title: 'Delete Failed',
            message: errorMessage,
          });
        }
      },
    });
  };

  const handleRetrySync = (pkg: Package) => {
    setModal({
      isOpen: true,
      type: 'confirmation',
      actionType: 'sync',
      packageName: pkg.name,
      pendingAction: async () => {
        try {
          setModal(prev => ({ ...prev, isLoading: true }));
          
          // Call the service directly to avoid hook error state
          await packageManagementService.retryPaddleSync(pkg.id);
          
          // Manually refresh the packages list
          refreshPackages();
          
          setModal({
            isOpen: true,
            type: 'result',
            resultType: 'success',
            title: 'Sync Successful',
            message: `Package "${pkg.name}" has been successfully synced with Paddle.`,
          });
        } catch (error) {
          console.error('Failed to sync package:', error);
          
          let errorMessage = 'Failed to sync package with Paddle. Please try again.';
          
          if (error instanceof Error) {
            if (error.message.includes('already exists')) {
              errorMessage = 'This package already exists in Paddle. No sync needed.';
            } else if (error.message.includes('invalid credentials')) {
              errorMessage = 'Paddle API credentials are invalid. Please check system configuration.';
            } else if (error.message.includes('network')) {
              errorMessage = 'Network error. Please check your connection and try again.';
            }
          }
          
          setModal({
            isOpen: true,
            type: 'result',
            resultType: 'error',
            title: 'Sync Failed',
            message: errorMessage,
          });
        }
      },
    });
  };

  // No need for handleSearch since we're doing frontend filtering
  // Search happens automatically via useMemo when searchTerm changes

  const handleFilterChange = (key: keyof PackageFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, offset: 0 };
    setFilters(newFilters);
    fetchPackages(newFilters);
  };

  const handleBulkAction = (action: 'delete' | 'activate' | 'deactivate') => {
    const selectedIds = Array.from(selectedPackages);
    
    if (selectedIds.length === 0) return;
    
    const actionType = `bulk-${action}` as ActionType;
    
    setModal({
      isOpen: true,
      type: 'confirmation',
      actionType,
      packageCount: selectedIds.length,
      pendingAction: async () => {
        try {
          setModal(prev => ({ ...prev, isLoading: true }));
          
          // Call the service directly to avoid hook error state
          switch (action) {
            case 'delete':
              await packageManagementService.bulkDeletePackages(selectedIds);
              break;
            case 'activate':
              await packageManagementService.bulkUpdatePackages(selectedIds, { is_active: true });
              break;
            case 'deactivate':
              await packageManagementService.bulkUpdatePackages(selectedIds, { is_active: false });
              break;
          }
          
          // Manually refresh the packages list and clear selection
          refreshPackages();
          clearSelection();
          
          const actionPast = action === 'delete' ? 'deactivated' : action === 'activate' ? 'activated' : 'deactivated';
          
          setModal({
            isOpen: true,
            type: 'result',
            resultType: 'success',
            title: 'Bulk Action Successful',
            message: `Successfully ${actionPast} ${selectedIds.length} package(s).`,
          });
        } catch (error) {
          console.error(`Failed to ${action} packages:`, error);
          
          let errorMessage = `Failed to ${action} packages. Please try again.`;
          
          if (error instanceof Error) {
            if (error.message.includes('pending transactions')) {
              errorMessage = `Some packages cannot be ${action === 'delete' ? 'deleted' : action + 'd'} because they have pending transactions.`;
            } else if (error.message.includes('unauthorized')) {
              errorMessage = `You do not have permission to ${action} these packages.`;
            }
          }
          
          setModal({
            isOpen: true,
            type: 'result',
            resultType: 'error',
            title: 'Bulk Action Failed',
            message: errorMessage,
          });
        }
      },
    });
  };

  const getStatusBadge = (pkg: Package) => {
    if (pkg.is_active) {
      return <Badge variant="default" className="bg-green-600 text-white hover:bg-green-600 hover:text-white cursor-default">Active</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-gray-600 text-white hover:bg-gray-600 hover:text-white cursor-default">Inactive</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      one_time: { label: 'One-Time', className: 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white cursor-default' },
      monthly_subscription: { label: 'Monthly', className: 'bg-purple-600 text-white hover:bg-purple-600 hover:text-white cursor-default' },
      yearly_subscription: { label: 'Annual', className: 'bg-orange-600 text-white hover:bg-orange-600 hover:text-white cursor-default' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, className: 'bg-gray-600 text-white hover:bg-gray-600 hover:text-white cursor-default' };
    
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: 'confirmation' });
  };

  const handleConfirmAction = async () => {
    if (modal.pendingAction) {
      await modal.pendingAction();
    }
  };

  return (
    <ProtectedRoute allowedRoles={['owner']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-200 flex items-center gap-2">
                <PackageIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="hidden sm:inline">Package Management</span>
                <span className="sm:hidden">Packages</span>
              </h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                Manage Dojo Coin packages and monitor payment analytics
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={refreshPackages}
                disabled={packagesLoading}
                className="border border-slate-500 bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-white w-full sm:w-auto"
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', packagesLoading && 'animate-spin')} />
                Refresh
              </Button>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Package
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                  <PackageForm
                    onSubmit={handleCreatePackage}
                    onCancel={() => setShowCreateDialog(false)}
                    isLoading={packagesLoading}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && !analyticsLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-400 flex items-center gap-1 sm:gap-2">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Total Revenue</span>
                  <span className="sm:hidden">Revenue</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-2xl font-bold text-slate-200">
                  {packageManagementService.formatCurrency(analytics.total_revenue)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Last {selectedAnalyticsPeriod}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-400 flex items-center gap-1 sm:gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Total Transactions</span>
                  <span className="sm:hidden">Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-2xl font-bold text-slate-200">
                  {analytics.total_transactions.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {analytics.successful_transactions} successful
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-400 flex items-center gap-1 sm:gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Conversion Rate</span>
                  <span className="sm:hidden">Conversion</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-2xl font-bold text-slate-200">
                  {analytics.conversion_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Success rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-400 flex items-center gap-1 sm:gap-2">
                  <PackageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Coins Granted</span>
                  <span className="sm:hidden">Coins</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-2xl font-bold text-slate-200">
                  {analytics.coins_granted.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="hidden sm:inline">Total coins delivered</span>
                  <span className="sm:hidden">Delivered</span>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2 text-lg">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Filters & Search</span>
              <span className="sm:hidden">Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Search packages</label>
                <div className="flex gap-2">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or description..."
                    className="bg-slate-800 border-slate-600 text-slate-200"
                  />
                  {searchTerm && (
                    <Button
                      onClick={() => setSearchTerm('')}
                      size="sm"
                      variant="ghost"
                      className="border border-slate-500 bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Package Type Filter */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Package Type</label>
                <Select
                  value={filters.packageType || 'all'}
                  onValueChange={(value) => handleFilterChange('packageType', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all" className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white">All types</SelectItem>
                    {PACKAGE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Include Inactive */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Status</label>
                <Select
                  value={filters.includeInactive ? 'all' : 'active'}
                  onValueChange={(value) => handleFilterChange('includeInactive', value === 'all')}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="active" className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white">Active only</SelectItem>
                    <SelectItem value="all" className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white">All packages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Analytics Period */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Analytics Period</label>
                <Select
                  value={selectedAnalyticsPeriod}
                  onValueChange={(value) => {
                    setSelectedAnalyticsPeriod(value);
                    fetchAnalytics(value);
                  }}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {ANALYTICS_PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {hasSelection && (
          <Card className="bg-orange-900/20 border-orange-500/30">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-orange-200 text-sm sm:text-base">
                  {selectedCount} package(s) selected
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white flex-1 sm:flex-none"
                  >
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('deactivate')}
                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white flex-1 sm:flex-none"
                  >
                    Deactivate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white flex-1 sm:flex-none"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="border border-slate-500 bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-white w-full sm:w-auto"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Packages Table/Cards */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-slate-200">
                Packages ({pagination?.total || 0})
              </CardTitle>
              {packages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={packages.every(pkg => selectedPackages.has(pkg.id)) ? clearSelection : selectAllPackages}
                  className="border border-slate-500 bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-white w-full sm:w-auto"
                >
                  {packages.every(pkg => selectedPackages.has(pkg.id)) ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {packagesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : packagesError ? (
              <Alert className="bg-red-900/20 border-red-500/30">
                <AlertDescription className="text-red-400">
                  {packagesError}
                </AlertDescription>
              </Alert>
            ) : packages.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No packages found. Create your first package to get started.
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={packages.length > 0 && packages.every(pkg => selectedPackages.has(pkg.id))}
                            onChange={packages.every(pkg => selectedPackages.has(pkg.id)) ? clearSelection : selectAllPackages}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead className="text-slate-300">Name</TableHead>
                        <TableHead className="text-slate-300">Type</TableHead>
                        <TableHead className="text-slate-300">Coins</TableHead>
                        <TableHead className="text-slate-300">Price</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Revenue</TableHead>
                        <TableHead className="text-slate-300">Sales</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.map((pkg) => (
                        <TableRow key={pkg.id} className="border-slate-700">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedPackages.has(pkg.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  selectPackage(pkg.id);
                                } else {
                                  unselectPackage(pkg.id);
                                }
                              }}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-200">{pkg.name}</div>
                              <div className="text-sm text-slate-400 max-w-xs truncate">
                                {pkg.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(pkg.package_type)}</TableCell>
                          <TableCell className="text-slate-200">{pkg.coin_amount.toLocaleString()}</TableCell>
                          <TableCell className="text-slate-200">
                            {packageManagementService.formatCurrency(pkg.price_usd)}
                          </TableCell>
                          <TableCell>{getStatusBadge(pkg)}</TableCell>
                          <TableCell className="text-slate-200">
                            {pkg.stats ? packageManagementService.formatCurrency(pkg.stats.total_revenue) : '-'}
                          </TableCell>
                          <TableCell className="text-slate-200">
                            {pkg.stats?.total_purchases.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-slate-800 border-slate-600">
                                <DropdownMenuItem
                                  onClick={() => setEditingPackage(pkg)}
                                  className="text-slate-200 focus:bg-slate-700"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRetrySync(pkg)}
                                  className="text-slate-200 focus:bg-slate-700"
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Retry Sync
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeletePackage(pkg)}
                                  className="text-red-400 focus:bg-red-600 focus:text-white"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {packages.map((pkg) => (
                    <Card key={pkg.id} className="bg-slate-800/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedPackages.has(pkg.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  selectPackage(pkg.id);
                                } else {
                                  unselectPackage(pkg.id);
                                }
                              }}
                              className="rounded"
                            />
                            <div>
                              <h3 className="font-medium text-slate-200">{pkg.name}</h3>
                              <p className="text-sm text-slate-400 mt-1">{pkg.description}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-600">
                              <DropdownMenuItem
                                onClick={() => setEditingPackage(pkg)}
                                className="text-slate-200 focus:bg-slate-700"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRetrySync(pkg)}
                                className="text-slate-200 focus:bg-slate-700"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Retry Sync
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePackage(pkg)}
                                className="text-red-400 focus:bg-red-600 focus:text-white"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Type:</span>
                            <div className="mt-1">{getTypeBadge(pkg.package_type)}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Status:</span>
                            <div className="mt-1">{getStatusBadge(pkg)}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Coins:</span>
                            <div className="text-slate-200 font-medium mt-1">{pkg.coin_amount.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Price:</span>
                            <div className="text-slate-200 font-medium mt-1">
                              {packageManagementService.formatCurrency(pkg.price_usd)}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Revenue:</span>
                            <div className="text-slate-200 font-medium mt-1">
                              {pkg.stats ? packageManagementService.formatCurrency(pkg.stats.total_revenue) : '-'}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Sales:</span>
                            <div className="text-slate-200 font-medium mt-1">
                              {pkg.stats?.total_purchases.toLocaleString() || '0'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        {editingPackage && (
          <Dialog open={true} onOpenChange={() => setEditingPackage(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <PackageForm
                package={editingPackage}
                onSubmit={handleUpdatePackage}
                onCancel={() => setEditingPackage(null)}
                isLoading={packagesLoading}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Action Modal */}
        <PackageActionModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          onConfirm={handleConfirmAction}
          type={modal.type}
          actionType={modal.actionType}
          resultType={modal.resultType}
          title={modal.title}
          message={modal.message}
          packageName={modal.packageName}
          packageCount={modal.packageCount}
          isLoading={modal.isLoading}
        />
      </div>
    </ProtectedRoute>
  );
};

export default PackagesPage;