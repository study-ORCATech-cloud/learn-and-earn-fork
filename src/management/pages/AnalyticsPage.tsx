// Analytics page for Dojo Coins economy and platform metrics

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Coins,
  Users,
  ShoppingCart,
  Gift,
  Activity,
  AlertCircle,
  RefreshCw,
  PieChart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { dojoCoinsService } from '../../services/dojoCoinsService';
import {
  AdminAnalyticsResponse,
  EconomyOverview,
  TransactionBreakdown,
  PopularLab,
  WalletDistribution
} from '../../types/dojoCoins';

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await dojoCoinsService.getAdminAnalytics();
      
      if (response.success && response.data) {
        setAnalytics(response.data);
        setLastRefresh(new Date());
      } else {
        setError(response.error || response.message || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'LAB_PURCHASE':
        return <ShoppingCart className="w-4 h-4" />;
      case 'ADMIN_GRANT':
        return <Gift className="w-4 h-4" />;
      case 'WELCOME_BONUS':
        return <Users className="w-4 h-4" />;
      case 'REFUND':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'LAB_PURCHASE':
        return 'text-red-400';
      case 'ADMIN_GRANT':
        return 'text-purple-400';
      case 'WELCOME_BONUS':
        return 'text-green-400';
      case 'REFUND':
        return 'text-blue-400';
      default:
        return 'text-slate-400';
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'LAB_PURCHASE':
        return 'Lab Purchases';
      case 'ADMIN_GRANT':
        return 'Admin Grants';
      case 'WELCOME_BONUS':
        return 'Welcome Bonuses';
      case 'REFUND':
        return 'Refunds';
      default:
        return type.replace('_', ' ');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-slate-400">Dojo Coins economy and platform metrics</p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-slate-400">Dojo Coins economy and platform metrics</p>
          </div>
          <Button onClick={loadAnalytics} variant="outline" size="sm" className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>

        <Alert className="bg-red-900/20 border-red-500/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-300">
            Failed to load analytics data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-slate-400">Dojo Coins economy and platform metrics</p>
          </div>
        </div>
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Analytics Data</h3>
          <p className="text-slate-400">Analytics data is not available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics - Management Dashboard</title>
        <meta name="description" content="Dojo Coins economy and platform analytics" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs text-slate-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button onClick={loadAnalytics} variant="outline" size="sm" disabled={isLoading} className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Economy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Total in Circulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400 flex items-center gap-1">
                <Coins className="w-6 h-6" />
                {analytics.economy_overview.total_coins_in_circulation.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Active Dojo Coins in user wallets
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 flex items-center gap-1">
                <Coins className="w-6 h-6" />
                {analytics.economy_overview.total_coins_earned.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total coins distributed to users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400 flex items-center gap-1">
                <Coins className="w-6 h-6" />
                {analytics.economy_overview.total_coins_spent.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total coins spent on purchases
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Circulation Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {analytics.economy_overview.circulation_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Percentage of earned coins spent
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Breakdown */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PieChart className="w-5 h-5" />
                Transaction Breakdown
              </CardTitle>
              <CardDescription className="text-slate-400">
                Distribution of transaction types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.transaction_breakdown.map((breakdown) => (
                  <div
                    key={breakdown.type}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-slate-700 ${getTransactionTypeColor(breakdown.type)}`}>
                        {getTransactionTypeIcon(breakdown.type)}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {formatTransactionType(breakdown.type)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {breakdown.count} transaction{breakdown.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${breakdown.total_amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {breakdown.total_amount >= 0 ? '+' : ''}{breakdown.total_amount}
                        <Coins className="w-4 h-4 inline ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Wallet Distribution */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                Wallet Distribution
              </CardTitle>
              <CardDescription className="text-slate-400">
                Users by coin balance ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.user_wallet_distribution.map((distribution) => (
                  <div
                    key={distribution.range}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-slate-300 font-medium">{distribution.range}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{distribution.user_count}</span>
                      <span className="text-slate-400 text-sm">users</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Labs */}
        {analytics.popular_labs.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                Popular Labs
              </CardTitle>
              <CardDescription className="text-slate-400">
                Most purchased labs by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.popular_labs.map((lab, index) => (
                  <div
                    key={`${lab.title}-${index}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{lab.title}</h3>
                        <Badge className="bg-blue-900/30 text-blue-300 border-blue-500/30">
                          {lab.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{lab.purchases} purchases</span>
                        <span>★ {lab.avg_rating ? lab.avg_rating.toFixed(1) : 'N/A'} rating</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default AnalyticsPage;