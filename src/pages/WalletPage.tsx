import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Coins,
  CreditCard,
  History,
  TrendingUp,
  TrendingDown,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  BookOpen,
  Gift
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { useOrcaWallet } from '../context/OrcaWalletContext';
import { useBackendData } from '../context/BackendDataContext';
import { OrcaTransaction, LabPurchase } from '../types/orcaCoins';

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: backendData } = useBackendData();
  const {
    balance,
    walletDetails,
    userLibrary,
    isLoadingWallet,
    isLoadingLibrary,
    error,
    refreshWalletDetails,
    refreshUserLibrary,
    formatCoins
  } = useOrcaWallet();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load wallet data on mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      refreshWalletDetails();
      refreshUserLibrary();
    }
  }, [isAuthenticated, authLoading]); // Remove function dependencies to prevent infinite loop

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
        return <History className="w-4 h-4" />;
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-900/30 border-green-500/30 text-green-300';
      case 'intermediate':
        return 'bg-blue-900/30 border-blue-500/30 text-blue-300';
      case 'professional':
        return 'bg-purple-900/30 border-purple-500/30 text-purple-300';
      case 'expert':
        return 'bg-red-900/30 border-red-500/30 text-red-300';
      default:
        return 'bg-gray-900/30 border-gray-500/30 text-gray-300';
    }
  };

  const handleLabClick = (labUrl: string) => {
    // Find the course and lab that matches this URL
    for (const course of Object.values(backendData.courses)) {
      // Check direct resources
      if (course.resources) {
        const directLab = Object.values(course.resources).find(resource => 
          resource.type === 'lab' && resource.url === labUrl
        );
        
        if (directLab) {
          window.open(`/course/${course.id}/lab/${directLab.id}`, '_blank');
          return;
        }
      }
    }
    
    // If we can't find the lab, show an error
    alert(`Error: Could not find lab with URL "${labUrl}" in course data. Please check the backend configuration.`);
  };

  return (
    <>
      <Helmet>
        <title>My Wallet - Orca Coins</title>
        <meta name="description" content="Manage your Orca Coins, view transaction history, and access purchased labs" />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
            <p className="text-slate-300">Manage your Orca Coins and view your learning journey</p>
          </div>

          {error && (
            <Card className="mb-6 bg-red-900/20 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Unable to load wallet data</p>
                    <p className="text-sm text-red-400">{error}</p>
                    <p className="text-xs text-red-400 mt-1">
                      Please ensure the backend API is running and accessible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Balance Overview - Only show if we have data */}
          {(balance !== null || walletDetails) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    Current Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-400 flex items-center gap-1">
                    <Coins className="w-6 h-6" />
                    {balance ?? '-'}
                  </div>
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
                    {walletDetails?.wallet.total_orca_earned ?? '-'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-blue-400" />
                    Total Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-300 flex items-center gap-1">
                    <Coins className="w-6 h-6" />
                    {walletDetails?.wallet.total_orca_spent ?? '-'}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Get Orca Coins CTA */}
          <div className="mb-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-white mb-2">Need More Orca Coins?</h3>
                    <p className="text-slate-300 text-sm">
                      Get access to premium solutions, advanced tutorials, and exclusive content
                    </p>
                  </div>
                  <Link to="/coins">
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 transition-all duration-300">
                      <Coins className="w-4 h-4 mr-2" />
                      Get Orca Coins
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border-slate-800">
              <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-800 text-slate-300 data-[state=active]:text-white text-xs sm:text-sm">
                <History className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Transaction History</span>
                <span className="sm:hidden">Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="purchases" className="data-[state=active]:bg-slate-800 text-slate-300 data-[state=active]:text-white text-xs sm:text-sm">
                <BookOpen className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">My Labs</span>
                <span className="sm:hidden">Labs</span>
              </TabsTrigger>
            </TabsList>

            {/* Transaction History Tab */}
            <TabsContent value="transactions" className="mt-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <History className="w-5 h-5" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your recent Orca Coins transactions and activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingWallet ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {walletDetails?.recent_transactions.length === 0 ? (
                        <div className="text-center py-8">
                          <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-white mb-2">No Transactions Yet</h3>
                          <p className="text-slate-400">Your transaction history will appear here</p>
                        </div>
                      ) : (
                        walletDetails?.recent_transactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="p-2 rounded-full bg-slate-700 flex-shrink-0">
                                {getTransactionIcon(transaction.transaction_type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-white text-sm sm:text-base">
                                    {formatTransactionType(transaction.transaction_type)}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-400 break-words">
                                  {transaction.description}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs text-slate-500">
                                  <span className="flex items-center gap-1 whitespace-nowrap">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    {new Date(transaction.created_at).toLocaleDateString()}
                                  </span>
                                  {transaction.reference_url && (
                                    <button
                                      onClick={() => handleLabClick(transaction.reference_url)}
                                      className="flex items-center gap-1 hover:text-blue-400 transition-colors whitespace-nowrap"
                                    >
                                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                      View Lab
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right sm:text-left flex-shrink-0">
                              <div className={`font-bold text-sm sm:text-base ${getTransactionColor(transaction.amount)}`}>
                                {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                                <Coins className="w-4 h-4 inline ml-1" />
                              </div>
                              <div className="text-xs text-slate-400 whitespace-nowrap">
                                Balance: {transaction.balance_after}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Purchased Labs Tab */}
            <TabsContent value="purchases" className="mt-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BookOpen className="w-5 h-5" />
                    My Purchased Labs
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Labs you've purchased with premium access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingLibrary ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userLibrary?.purchased_labs.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-white mb-2">No Labs Purchased</h3>
                          <p className="text-slate-400 mb-4">
                            Browse our courses and purchase premium lab access to enhance your learning
                          </p>
                          <Button onClick={() => navigate('/courses')} className="bg-blue-600 hover:bg-blue-700">
                            Browse Courses
                          </Button>
                        </div>
                      ) : (
                        userLibrary?.purchased_labs.map((purchase) => (
                          <div
                            key={purchase.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="font-semibold text-white text-sm sm:text-base break-words">{purchase.lab_title}</h3>
                                <Badge className={`text-xs whitespace-nowrap ${getDifficultyColor(purchase.lab_difficulty)}`}>
                                  {purchase.lab_difficulty.charAt(0).toUpperCase() + purchase.lab_difficulty.slice(1)}
                                </Badge>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-slate-400 mb-2">
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  Purchased: {new Date(purchase.created_at).toLocaleDateString()}
                                </span>
                                <span className="whitespace-nowrap">Access Count: {purchase.total_access_count}</span>
                                {purchase.last_accessed_at && (
                                  <span className="whitespace-nowrap">
                                    Last Accessed: {new Date(purchase.last_accessed_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-slate-500">
                                <span className="whitespace-nowrap">Category: {purchase.lab_category}</span>
                                {purchase.lab_tags && purchase.lab_tags.length > 0 && (
                                  <>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="break-words">Tags: {purchase.lab_tags.join(', ')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-amber-400 font-semibold text-sm">
                                  <Coins className="w-4 h-4" />
                                  {purchase.orca_cost}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleLabClick(purchase.lab_url)}
                                className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm whitespace-nowrap"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Lab
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Summary Stats */}
          {walletDetails && (
            <Card className="mt-6 bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Wallet Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {walletDetails.purchased_labs_count}
                    </div>
                    <div className="text-sm text-slate-400">Labs Purchased</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {walletDetails.wallet.lifetime_purchases}
                    </div>
                    <div className="text-sm text-slate-400">Total Purchases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-300 mb-1">
                      {new Date(walletDetails.wallet.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-400">Member Since</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default WalletPage;