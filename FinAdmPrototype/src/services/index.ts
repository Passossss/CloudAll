/**
 * Barrel export para todos os serviços
 * Facilita importações em outros módulos
 */

// Core
export { default as api, apiOrMock, mockDelay } from './api';
export * from './config';
export * from './types';

// Services
export { authService } from './authService';
export type { LoginCredentials, RegisterData, LoginResponse } from './authService';

export { accountService } from './accountService';
export type { CreateAccountData, UpdateAccountData, AccountFilters } from './accountService';

export { categoryService } from './categoryService';
export type { CreateCategoryData, UpdateCategoryData, CategoryFilters } from './categoryService';

export { transactionService } from './transactionService';
export type {
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionListResponse,
  UserTransactionSummary,
  CategorySummary,
} from './transactionService';

export { reportService } from './reportService';
export type { ReportFilters, IncomeExpenseReport, MonthlyReport } from './reportService';

export { settingsService } from './settingsService';

export { adminService } from './adminService';
export type {
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UserListResponse,
} from './adminService';
