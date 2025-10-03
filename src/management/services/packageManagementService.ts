import { 
  Package, 
  CreatePackageData, 
  UpdatePackageData, 
  PackageFilters, 
  PackageListResponse, 
  PackageResponse, 
  PaddleSyncResult, 
  PaymentAnalyticsResponse 
} from '../types/package';

class PackageManagementService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_BASE_PATH || 'http://localhost:5000';
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Operation failed');
    }

    return result;
  }

  // List packages with filtering and pagination
  async listPackages(filters: PackageFilters = {}): Promise<PackageListResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.includeInactive) {
      queryParams.set('include_inactive', 'true');
    }
    if (filters.packageType) {
      queryParams.set('package_type', filters.packageType);
    }
    if (filters.limit) {
      queryParams.set('limit', filters.limit.toString());
    }
    if (filters.offset) {
      queryParams.set('offset', filters.offset.toString());
    }

    const endpoint = `/v1/admin/packages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<PackageListResponse>(endpoint);
  }

  // Get package details by ID
  async getPackage(packageId: string): Promise<Package> {
    const result = await this.makeRequest<{ package: Package }>(`/v1/admin/packages/${packageId}`);
    return result.package;
  }

  // Create new package
  async createPackage(packageData: CreatePackageData): Promise<PackageResponse> {
    return this.makeRequest<PackageResponse>('/v1/admin/packages', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  // Update existing package
  async updatePackage(packageId: string, updates: UpdatePackageData): Promise<PackageResponse> {
    return this.makeRequest<PackageResponse>(`/v1/admin/packages/${packageId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Soft delete package (deactivate)
  async deletePackage(packageId: string): Promise<PackageResponse> {
    return this.makeRequest<PackageResponse>(`/v1/admin/packages/${packageId}`, {
      method: 'DELETE',
    });
  }

  // Retry Paddle synchronization
  async retryPaddleSync(packageId: string): Promise<PaddleSyncResult> {
    const result = await this.makeRequest<{ sync_result: PaddleSyncResult }>(
      `/v1/admin/packages/${packageId}/sync`, 
      { method: 'POST' }
    );
    return result.sync_result;
  }

  // Get payment analytics
  async getPaymentAnalytics(period: string = '30d', packageType?: string): Promise<PaymentAnalyticsResponse> {
    const queryParams = new URLSearchParams({ period });
    if (packageType) {
      queryParams.set('package_type', packageType);
    }

    const endpoint = `/v1/admin/analytics/payments?${queryParams.toString()}`;
    return this.makeRequest<PaymentAnalyticsResponse>(endpoint);
  }

  // Bulk operations
  async bulkUpdatePackages(packageIds: string[], updates: UpdatePackageData): Promise<void> {
    const promises = packageIds.map(id => this.updatePackage(id, updates));
    await Promise.all(promises);
  }

  async bulkDeletePackages(packageIds: string[]): Promise<void> {
    const promises = packageIds.map(id => this.deletePackage(id));
    await Promise.all(promises);
  }

  // Validation helpers
  validatePackageData(data: CreatePackageData | UpdatePackageData): string[] {
    const errors: string[] = [];

    if ('name' in data && data.name) {
      if (data.name.length < 3) {
        errors.push('Package name must be at least 3 characters long');
      }
      if (data.name.length > 100) {
        errors.push('Package name must be less than 100 characters');
      }
    }

    if ('description' in data && data.description) {
      if (data.description.length < 10) {
        errors.push('Description must be at least 10 characters long');
      }
      if (data.description.length > 500) {
        errors.push('Description must be less than 500 characters');
      }
    }

    if ('coin_amount' in data && data.coin_amount !== undefined) {
      if (data.coin_amount < 1 || data.coin_amount > 100000) {
        errors.push('Coin amount must be between 1 and 100,000');
      }
    }

    if ('price_usd' in data && data.price_usd !== undefined) {
      if (data.price_usd < 5.00) {
        errors.push('Price must be at least $5.00');
      }
      if (data.price_usd > 10000) {
        errors.push('Price must be less than $10,000');
      }
    }

    // Features validation
    if ('features' in data && data.features) {
      if (!Array.isArray(data.features)) {
        errors.push('Features must be an array');
      } else {
        if (data.features.length > 20) {
          errors.push('Maximum 20 features allowed');
        }
        
        data.features.forEach((feature, index) => {
          if (typeof feature !== 'string') {
            errors.push(`Feature ${index + 1}: must be text`);
          } else {
            if (feature.trim().length === 0) {
              errors.push(`Feature ${index + 1}: cannot be empty`);
            }
            if (feature.length > 200) {
              errors.push(`Feature ${index + 1}: must be less than 200 characters`);
            }
          }
        });
      }
    }

    return errors;
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  // Helper method to format package type
  formatPackageType(type: string): string {
    const typeMap: Record<string, string> = {
      'one_time': 'One-Time Purchase',
      'monthly_subscription': 'Monthly Subscription',
      'yearly_subscription': 'Yearly Subscription',
    };
    return typeMap[type] || type;
  }
}

export const packageManagementService = new PackageManagementService();