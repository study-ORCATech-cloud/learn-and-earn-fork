export interface DojoWallet {
  id: string;
  user_id: string;
  coin_balance: number;
  total_coins_earned: number;
  total_coins_spent: number;
  lifetime_purchases: number;
  created_at: string;
  updated_at: string;
}

export interface DojoTransaction {
  id: string;
  user_id?: string; // Added for admin transactions view
  transaction_type: 'LAB_PURCHASE' | 'ADMIN_GRANT' | 'WELCOME_BONUS' | 'REFUND';
  amount: number;
  description: string;
  balance_before: number;
  balance_after: number;
  reference_url?: string;
  created_at: string;
  performed_by?: string; // Admin user ID for admin grants
}

export interface LabPurchase {
  id: string;
  lab_url: string;
  lab_title: string;
  lab_difficulty: 'beginner' | 'intermediate' | 'professional' | 'expert';
  lab_category: string;
  lab_description?: string;
  lab_tags?: string[];
  coin_cost: number;
  status: 'active' | 'expired' | 'refunded';
  created_at: string;
  last_accessed_at?: string;
  total_access_count: number;
  completion_status?: 'not_started' | 'in_progress' | 'completed';
}

export interface WalletDetails {
  wallet: DojoWallet;
  recent_transactions: DojoTransaction[];
  purchased_labs_count: number;
  spending_stats: {
    total_earned: number;
    total_spent: number;
    lifetime_purchases: number;
  };
}

export interface PurchaseRequest {
  lab_url: string;
  lab_title: string;
  lab_description?: string;
  lab_difficulty: string;
  lab_category: string;
  lab_tags?: string[];
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data?: {
    purchase: LabPurchase;
    transaction: DojoTransaction;
    new_balance: number;
  };
  error?: string;
}

export interface LabAccessInfo {
  has_access: boolean;
  purchase_info?: {
    id: string;
    lab_title: string;
    purchased_at: string;
    last_accessed_at?: string;
    total_access_count: number;
  };
  wallet_balance: number;
  premium_cost?: number;
  can_afford?: boolean;
}

export interface LabAccessRequest {
  lab_url: string;
}

export interface GrantCoinsRequest {
  user_id: string;
  amount: number;
  reason: string;
}

export interface GrantCoinsResponse {
  success: boolean;
  message: string;
  data?: {
    transaction: DojoTransaction;
    new_balance: number;
  };
  error?: string;
}

export interface DojoApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BalanceResponse {
  success: boolean;
  balance: number;
}

export interface UserLibrary {
  purchased_labs: LabPurchase[];
  total_purchases: number;
}

// Enhanced lab file interface for premium features
export interface PremiumLabFile {
  path: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: PremiumLabFile[];
  size: number;
  language?: string;
  is_premium: boolean;
  preview_content?: string; // Limited content for non-premium users
}

export interface PremiumLabContent {
  labName: string;
  description: string;
  files: PremiumLabFile[];
  metadata: {
    lastUpdated: string;
    totalFiles: number;
    mainInstruction: string;
    premium_files_count: number;
    cost: number;
    difficulty: 'beginner' | 'intermediate' | 'professional' | 'expert';
  };
  has_premium_access: boolean;
}

export interface PremiumLabContentResponse {
  success: boolean;
  data: PremiumLabContent;
  error?: string;
}

// Admin API Types

export interface AdminTransactionsRequest {
  user_id?: string;
  transaction_type?: 'LAB_PURCHASE' | 'ADMIN_GRANT' | 'WELCOME_BONUS' | 'REFUND';
  limit?: number;
  offset?: number;
}

export interface AdminTransactionsResponse {
  success: boolean;
  data?: {
    transactions: DojoTransaction[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    };
  };
  error?: string;
  message?: string;
}

export interface TransactionBreakdown {
  type: 'LAB_PURCHASE' | 'ADMIN_GRANT' | 'WELCOME_BONUS' | 'REFUND';
  count: number;
  total_amount: number;
}

export interface PopularLab {
  title: string;
  category: string;
  purchases: number;
  avg_rating: number;
}

export interface WalletDistribution {
  range: string;
  user_count: number;
}

export interface EconomyOverview {
  total_coins_in_circulation: number;
  total_coins_earned: number;
  total_coins_spent: number;
  circulation_rate: number;
}

export interface AdminAnalyticsResponse {
  success: boolean;
  data?: {
    economy_overview: EconomyOverview;
    transaction_breakdown: TransactionBreakdown[];
    popular_labs: PopularLab[];
    user_wallet_distribution: WalletDistribution[];
  };
  error?: string;
  message?: string;
}