import { useState, useEffect, useCallback } from 'react';
import { packageManagementService } from '../services/packageManagementService';
import { 
  Package, 
  PackageFilters, 
  CreatePackageData, 
  UpdatePackageData,
  PackagePagination
} from '../types/package';

interface UsePackagesState {
  packages: Package[];
  loading: boolean;
  error: string | null;
  pagination: PackagePagination | null;
  selectedPackages: Set<string>;
}

interface UsePackagesActions {
  fetchPackages: (filters?: PackageFilters) => Promise<void>;
  createPackage: (data: CreatePackageData) => Promise<Package>;
  updatePackage: (id: string, data: UpdatePackageData) => Promise<Package>;
  deletePackage: (id: string) => Promise<void>;
  retrySync: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkToggleActive: (ids: string[], isActive: boolean) => Promise<void>;
  selectPackage: (id: string) => void;
  unselectPackage: (id: string) => void;
  selectAllPackages: () => void;
  clearSelection: () => void;
  refreshPackages: () => Promise<void>;
}

export const usePackages = (initialFilters?: PackageFilters) => {
  const [state, setState] = useState<UsePackagesState>({
    packages: [],
    loading: false,
    error: null,
    pagination: null,
    selectedPackages: new Set(),
  });

  const [currentFilters, setCurrentFilters] = useState<PackageFilters>(initialFilters || {});

  const fetchPackages = useCallback(async (filters?: PackageFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const filtersToUse = filters || currentFilters;
      setCurrentFilters(filtersToUse);
      
      const response = await packageManagementService.listPackages(filtersToUse);
      
      setState(prev => ({
        ...prev,
        packages: response.packages,
        pagination: response.pagination,
        loading: false,
        selectedPackages: new Set(), // Clear selection on new fetch
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch packages',
      }));
    }
  }, [currentFilters]);

  const createPackage = useCallback(async (data: CreatePackageData): Promise<Package> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await packageManagementService.createPackage(data);
      const newPackage = response.package;
      
      setState(prev => ({
        ...prev,
        packages: [newPackage, ...prev.packages],
        loading: false,
      }));
      
      return newPackage;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create package',
      }));
      throw error;
    }
  }, []);

  const updatePackage = useCallback(async (id: string, data: UpdatePackageData): Promise<Package> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await packageManagementService.updatePackage(id, data);
      const updatedPackage = response.package;
      
      setState(prev => ({
        ...prev,
        packages: prev.packages.map(pkg => 
          pkg.id === id ? updatedPackage : pkg
        ),
        loading: false,
      }));
      
      return updatedPackage;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update package',
      }));
      throw error;
    }
  }, []);

  const deletePackage = useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await packageManagementService.deletePackage(id);
      
      setState(prev => ({
        ...prev,
        packages: prev.packages.map(pkg => 
          pkg.id === id ? { ...pkg, is_active: false } : pkg
        ),
        loading: false,
        selectedPackages: new Set([...prev.selectedPackages].filter(pkgId => pkgId !== id)),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete package',
      }));
      throw error;
    }
  }, []);

  const retrySync = useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await packageManagementService.retryPaddleSync(id);
      setState(prev => ({ ...prev, loading: false }));
      
      // Refresh the package to get updated sync status
      await fetchPackages();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sync package',
      }));
      throw error;
    }
  }, [fetchPackages]);

  const bulkDelete = useCallback(async (ids: string[]): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await packageManagementService.bulkDeletePackages(ids);
      
      setState(prev => ({
        ...prev,
        packages: prev.packages.map(pkg => 
          ids.includes(pkg.id) ? { ...pkg, is_active: false } : pkg
        ),
        loading: false,
        selectedPackages: new Set(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete packages',
      }));
      throw error;
    }
  }, []);

  const bulkToggleActive = useCallback(async (ids: string[], isActive: boolean): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await packageManagementService.bulkUpdatePackages(ids, { is_active: isActive });
      
      setState(prev => ({
        ...prev,
        packages: prev.packages.map(pkg => 
          ids.includes(pkg.id) ? { ...pkg, is_active: isActive } : pkg
        ),
        loading: false,
        selectedPackages: new Set(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update packages',
      }));
      throw error;
    }
  }, []);

  const selectPackage = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedPackages: new Set([...prev.selectedPackages, id]),
    }));
  }, []);

  const unselectPackage = useCallback((id: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedPackages);
      newSelected.delete(id);
      return {
        ...prev,
        selectedPackages: newSelected,
      };
    });
  }, []);

  const selectAllPackages = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedPackages: new Set(prev.packages.map(pkg => pkg.id)),
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedPackages: new Set(),
    }));
  }, []);

  const refreshPackages = useCallback(async () => {
    await fetchPackages(currentFilters);
  }, [fetchPackages, currentFilters]);

  // Initial fetch
  useEffect(() => {
    fetchPackages(initialFilters);
  }, []); // Only run on mount

  const actions: UsePackagesActions = {
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
  };

  return {
    ...state,
    ...actions,
    hasSelection: state.selectedPackages.size > 0,
    selectedCount: state.selectedPackages.size,
  };
};