/**
 * Tipos centralizados para toda a aplicação
 * Alinhados com os contratos da API backend
 */

// ============================================
// Error Types
// ============================================

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  fields?: Record<string, string>;
}

export interface ApiErrorResponse {
  error: ApiError;
}

// ============================================
// Common Types
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'normal' | 'admin';
  age?: number;
  occupation?: string;
  monthlyIncome?: number;
  spendingLimit?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUser extends User {
  status: 'active' | 'inactive';
  lastLogin?: string;
  transactionCount?: number;
  totalBalance?: number;
}

// ============================================
// Account Types
// ============================================

export type AccountType = 'checking' | 'savings' | 'investment' | 'cash' | 'credit';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  initialBalance?: number;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// Category Types
// ============================================

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  parentId?: string;
  transactionCount?: number;
  totalAmount?: number;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// Transaction Types
// ============================================

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  category?: string;
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  isRecurring?: boolean;
  recurringPeriod?: string;
}

// ============================================
// Report Types
// ============================================

export type ReportGroupBy = 'category' | 'account' | 'day' | 'week' | 'month';

export interface ReportSummaryItem {
  key: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
  count: number;
}

export interface ReportSummary {
  groupBy: ReportGroupBy;
  period: {
    from: string;
    to: string;
  };
  items: ReportSummaryItem[];
  totals: {
    income: number;
    expense: number;
    balance: number;
    count: number;
  };
}

export interface CashFlow {
  date: string;
  income: number;
  expense: number;
  balance: number;
  cumulativeBalance: number;
}

export interface CashFlowReport {
  period: {
    from: string;
    to: string;
  };
  data: CashFlow[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    averageDaily: number;
  };
}

// ============================================
// Menu & Permissions Types
// ============================================

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  order: number;
  visible: boolean;
  roles: string[];
  children?: MenuItem[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  roles: string[];
  description?: string;
}

// ============================================
// Settings Types
// ============================================

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    transactionAlerts: boolean;
    weeklyReport: boolean;
  };
  privacy: {
    showBalance: boolean;
    shareData: boolean;
  };
  updatedAt?: string;
}

// ============================================
// Statistics Types
// ============================================

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  averageTransactionsPerUser: number;
}

export interface UserStats {
  memberSince: string;
  monthlyIncome: number;
  profileCompletion: number;
  transactionCount: number;
  categoriesUsed: number;
  accountsCount: number;
}
