// Dojo Coins management page for viewing transactions and admin controls

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Coins,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  ExternalLink,
  AlertCircle,
  Gift,
  ShoppingCart,
  TrendingUp,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { dojoCoinsService } from '../../services/dojoCoinsService';
import {
  AdminTransactionsRequest,
  AdminTransactionsResponse,
  DojoTransaction
} from '../../types/dojoCoins';
import { userManagementService } from '../services/userManagementService';

const ITEMS_PER_PAGE = 50;

const DojoCoinsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<DojoTransaction[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: ITEMS_PER_PAGE,
    offset: 0,
    has_more: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [userCache, setUserCache] = useState<Record<string, { name: string; email: string }>>({});

  // Filters
  const [filters, setFilters] = useState<AdminTransactionsRequest>({
    limit: ITEMS_PER_PAGE,
    offset: 0,
    transaction_type: 'LAB_PURCHASE' // Default filter to avoid 400 error
  });
  const [tempFilters, setTempFilters] = useState<{
    user_email: string;
    transaction_type: string;
  }>({
    user_email: '',
    transaction_type: 'LAB_PURCHASE' // Default to LAB_PURCHASE
  });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadUserDetails = async (userIds: string[]) => {
    try {
      // Only fetch users we don't already have cached
      const uncachedUserIds = userIds.filter(id => !userCache[id]);
      
      if (uncachedUserIds.length === 0) return;
      
      const userPromises = uncachedUserIds.map(async (userId) => {
        try {
          const response = await userManagementService.getUserById(userId);
          if (response.success && response.data) {
            return {
              id: userId,
              name: response.data.name,
              email: response.data.email
            };
          }
        } catch (error) {
          console.warn(`Failed to load user ${userId}:`, error);
        }
        return null;
      });
      
      const users = (await Promise.all(userPromises)).filter(Boolean);
      
      const newUserCache = { ...userCache };
      users.forEach(user => {
        if (user) {
          newUserCache[user.id] = { name: user.name, email: user.email };
        }
      });
      
      setUserCache(newUserCache);
    } catch (error) {
      console.warn('Failed to load user details:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await dojoCoinsService.getAdminTransactions(filters);
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
        setLastRefresh(new Date());
        
        // Load user details for transactions that have user_id
        const userIds = [...new Set(response.data.transactions
          .map(t => t.user_id)
          .filter(Boolean))] as string[];
        
        await loadUserDetails(userIds);
      } else {
        setError(response.error || response.message || 'Failed to load transactions');
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async () => {
    const newFilters: AdminTransactionsRequest = {
      limit: ITEMS_PER_PAGE,
      offset: 0
    };

    // If user email is provided, we need to find the user ID first
    if (tempFilters.user_email.trim()) {
      try {
        const searchResponse = await userManagementService.searchUsers(tempFilters.user_email.trim());
        
        if (searchResponse.success && searchResponse.data && Object.keys(searchResponse.data).length > 0 && Object.keys(searchResponse.data.results).length > 0) {
          const user = searchResponse.data.results.find((u: any) =>
            u.email.toLowerCase() === tempFilters.user_email.trim().toLowerCase()
          );
          
          if (user) {
            newFilters.user_id = user.id;
            // Cache the user info
            setUserCache(prev => ({
              ...prev,
              [user.id]: { name: user.name, email: user.email }
            }));
          } else {
            setError(`No user found with email: ${tempFilters.user_email}`);
            return;
          }
        } else {
          setError(`No user found with email: ${tempFilters.user_email}`);
          return;
        }
      } catch (error) {
        setError(`Failed to search for user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }
    
    if (tempFilters.transaction_type) {
      newFilters.transaction_type = tempFilters.transaction_type as any;
    }

    // If no filters are set, default to LAB_PURCHASE to avoid 400 error
    if (!newFilters.user_id && !newFilters.transaction_type) {
      newFilters.transaction_type = 'LAB_PURCHASE';
    }

    setFilters(newFilters);
  };

  const clearFilters = () => {
    setTempFilters({ user_email: '', transaction_type: 'LAB_PURCHASE' });
    setFilters({ limit: ITEMS_PER_PAGE, offset: 0, transaction_type: 'LAB_PURCHASE' });
  };

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'LAB_PURCHASE':
        return <BookOpen className="w-4 h-4" />;
      case 'ADMIN_GRANT':
        return <Gift className="w-4 h-4" />;
      case 'WELCOME_BONUS':
        return <Gift className="w-4 h-4" />;
      case 'REFUND':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Coins className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'LAB_PURCHASE':
        return 'Lab Purchase';
      case 'ADMIN_GRANT':
        return 'Admin Grant';
      case 'WELCOME_BONUS':
        return 'Welcome Bonus';
      case 'REFUND':
        return 'Refund';
      default:
        return type.replace('_', ' ');
    }
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <>
      <Helmet>
        <title>Dojo Coins Management - Management Dashboard</title>
        <meta name="description" content="Manage Dojo Coins transactions and admin controls" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs text-slate-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button onClick={loadTransactions} variant="outline" size="sm" disabled={isLoading} className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            <CardDescription className="text-slate-400">
              Filter transactions by user or type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">User Email</label>
                <Input
                  placeholder="Enter user email..."
                  value={tempFilters.user_email}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, user_email: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Transaction Type</label>
                <Select
                  value={tempFilters.transaction_type}
                  onValueChange={(value) => setTempFilters(prev => ({ ...prev, transaction_type: value }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="LAB_PURCHASE" className="text-white hover:bg-slate-700">Lab Purchase</SelectItem>
                    <SelectItem value="ADMIN_GRANT" className="text-white hover:bg-slate-700">Admin Grant</SelectItem>
                    <SelectItem value="WELCOME_BONUS" className="text-white hover:bg-slate-700">Welcome Bonus</SelectItem>
                    <SelectItem value="REFUND" className="text-white hover:bg-slate-700">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 flex items-end">
                <div className="flex gap-2 w-full">
                  <Button onClick={applyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Search className="w-4 h-4 mr-2" />
                    Apply
                  </Button>
                  <Button onClick={clearFilters} variant="outline" className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert className="bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              Failed to load transactions: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Transactions */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Coins className="w-5 h-5 text-amber-400" />
                  All Transactions
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {pagination.total > 0 ? (
                    <>Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} transactions</>
                  ) : (
                    'No transactions found'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Transactions Found</h3>
                <p className="text-slate-400">
                  {Object.keys(filters).some(key => key !== 'limit' && key !== 'offset' && filters[key as keyof AdminTransactionsRequest])
                    ? 'Try adjusting your filters to see more results.'
                    : 'No transactions have been recorded yet.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-full bg-slate-700">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">
                            {formatTransactionType(transaction.transaction_type)}
                          </span>
                          <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                            {transaction.id.slice(0, 8)}...
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                          {transaction.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {transaction.user_id && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {userCache[transaction.user_id] ? (
                                <span className="text-slate-300">
                                  {userCache[transaction.user_id].email}
                                </span>
                              ) : (
                                <span>{transaction.user_id.slice(0, 8)}...</span>
                              )}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(transaction.created_at).toLocaleDateString()} {new Date(transaction.created_at).toLocaleTimeString()}
                          </span>
                          {transaction.reference_url && (
                            <button 
                              onClick={() => window.open(transaction.reference_url, '_blank')}
                              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Lab
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold text-lg ${getTransactionColor(transaction.amount)}`}>
                        {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                        <Coins className="w-4 h-4 inline ml-1" />
                      </div>
                      <div className="text-xs text-slate-400">
                        Balance: {transaction.balance_after}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="text-sm text-slate-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                        disabled={pagination.offset === 0}
                        className="bg-slate-800 border-slate-600 hover:bg-slate-700"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                        disabled={!pagination.has_more}
                        className="bg-slate-800 border-slate-600 hover:bg-slate-700"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DojoCoinsPage;