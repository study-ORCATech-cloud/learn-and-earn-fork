import { useState, useEffect, useCallback } from 'react';
import { packageManagementService } from '../services/packageManagementService';
import { PaymentAnalytics } from '../types/package';

interface UsePackageAnalyticsState {
  analytics: PaymentAnalytics | null;
  loading: boolean;
  error: string | null;
}

interface UsePackageAnalyticsActions {
  fetchAnalytics: (period?: string, packageType?: string) => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}

export const usePackageAnalytics = (
  initialPeriod: string = '30d',
  initialPackageType?: string
) => {
  const [state, setState] = useState<UsePackageAnalyticsState>({
    analytics: null,
    loading: false,
    error: null,
  });

  const [currentPeriod, setCurrentPeriod] = useState(initialPeriod);
  const [currentPackageType, setCurrentPackageType] = useState(initialPackageType);

  const fetchAnalytics = useCallback(async (period?: string, packageType?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const periodToUse = period || currentPeriod;
      const packageTypeToUse = packageType || currentPackageType;
      
      setCurrentPeriod(periodToUse);
      setCurrentPackageType(packageTypeToUse);
      
      const response = await packageManagementService.getPaymentAnalytics(
        periodToUse,
        packageTypeToUse
      );
      
      setState(prev => ({
        ...prev,
        analytics: response.analytics,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      }));
    }
  }, [currentPeriod, currentPackageType]);

  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics(currentPeriod, currentPackageType);
  }, [fetchAnalytics, currentPeriod, currentPackageType]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics(initialPeriod, initialPackageType);
  }, []); // Only run on mount

  const actions: UsePackageAnalyticsActions = {
    fetchAnalytics,
    refreshAnalytics,
  };

  return {
    ...state,
    ...actions,
    currentPeriod,
    currentPackageType,
  };
};