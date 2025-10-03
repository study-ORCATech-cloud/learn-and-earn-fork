export type PackageType = 'one_time' | 'monthly_subscription' | 'yearly_subscription';

export interface Package {
  id: string;
  name: string;
  description: string;
  package_type: PackageType;
  coin_amount: number;
  price_usd: number;
  features: string[];
  is_active: boolean;
  paddle_product_id?: string;
  paddle_price_id?: string;
  created_at: string;
  updated_at: string;
  stats?: PackageStats;
}

export interface PackageStats {
  total_purchases: number;
  total_revenue: number;
  active_subscriptions: number;
  avg_rating?: number;
  recent_purchases?: number;
  conversion_rate?: number;
}

export interface CreatePackageData {
  name: string;
  description: string;
  package_type: PackageType;
  coin_amount: number;
  price_usd: number;
  features?: string[];
  auto_sync?: boolean;
}

export interface UpdatePackageData {
  name?: string;
  description?: string;
  coin_amount?: number;
  price_usd?: number;
  features?: string[];
  is_active?: boolean;
  auto_sync?: boolean;
}

export interface PackageFilters {
  includeInactive?: boolean;
  packageType?: PackageType;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface PackagePagination {
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PackageListResponse {
  success: boolean;
  packages: Package[];
  pagination: PackagePagination;
}

export interface PackageResponse {
  success: boolean;
  package: Package;
  paddle_sync?: PaddleSyncResult;
  message?: string;
}

export interface PaddleSyncResult {
  status: 'success' | 'failed';
  product_id?: string;
  price_id?: string;
  message: string;
  error?: string;
  retry_available?: boolean;
}

export interface PaymentAnalytics {
  total_revenue: number;
  total_transactions: number;
  successful_transactions: number;
  refunded_transactions: number;
  coins_granted: number;
  conversion_rate: number;
  top_packages: TopPackage[];
}

export interface TopPackage {
  package_name: string;
  purchases: number;
  revenue: number;
}

export interface PaymentAnalyticsResponse {
  success: boolean;
  period: string;
  analytics: PaymentAnalytics;
}

export interface PackageFormData {
  name: string;
  description: string;
  package_type: PackageType;
  coin_amount: number;
  price_usd: number;
  features: string[];
  auto_sync: boolean;
}

export interface PackageValidationErrors {
  name?: string;
  description?: string;
  package_type?: string;
  coin_amount?: string;
  price_usd?: string;
  features?: string;
}

export const PACKAGE_TYPE_OPTIONS = [
  { value: 'one_time', label: 'One-Time Purchase' },
  { value: 'monthly_subscription', label: 'Monthly Subscription' },
  { value: 'yearly_subscription', label: 'Yearly Subscription' }
] as const;

export const ANALYTICS_PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' }
] as const;