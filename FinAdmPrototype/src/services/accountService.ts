import api from './api';
import type { Account, AccountType, PaginatedResponse } from './types';

// ============================================
// Types
// ============================================

export interface CreateAccountData {
  name: string;
  type: AccountType;
  currency: string;
  initialBalance?: number;
}

export interface UpdateAccountData {
  name?: string;
  type?: AccountType;
  currency?: string;
}

export interface AccountFilters {
  type?: AccountType | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export interface AccountStats {
  totalBalance: number;
  accountsCount: number;
  byType: Array<{
    type: AccountType;
    count: number;
    totalBalance: number;
  }>;
}

// ============================================
// Account Service
// ============================================

class AccountService {
  /**
   * Lista contas do usuário
   * GET /accounts
   */
  async list(filters?: AccountFilters): Promise<Account[]> {
    const params = new URLSearchParams();
    
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.search) {
      params.append('q', filters.search);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `/accounts${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<{ data: Account[] }>(url);
    return response.data.data;
  }

  /**
   * Obtém uma conta específica
   * GET /accounts/:id
   */
  async getById(accountId: string): Promise<Account> {
    const response = await api.get<{ account: Account }>(`/accounts/${accountId}`);
    return response.data.account;
  }

  /**
   * Cria uma nova conta
   * POST /accounts
   */
  async create(data: CreateAccountData): Promise<Account> {
    const response = await api.post<{ account: Account }>('/accounts', data);
    return response.data.account;
  }

  /**
   * Atualiza uma conta
   * PUT /accounts/:id
   */
  async update(accountId: string, data: UpdateAccountData): Promise<Account> {
    const response = await api.put<{ account: Account }>(`/accounts/${accountId}`, data);
    return response.data.account;
  }

  /**
   * Deleta uma conta
   * DELETE /accounts/:id
   */
  async delete(accountId: string): Promise<void> {
    await api.delete(`/accounts/${accountId}`);
  }

  /**
   * Obtém estatísticas de contas do usuário
   * GET /accounts/stats
   */
  async getStats(): Promise<AccountStats> {
    const response = await api.get<{ stats: AccountStats }>('/accounts/stats');
    return response.data.stats;
  }

  /**
   * Obtém saldo total de todas as contas
   * GET /accounts/total-balance
   */
  async getTotalBalance(): Promise<number> {
    const response = await api.get<{ totalBalance: number }>('/accounts/total-balance');
    return response.data.totalBalance;
  }
}

export const accountService = new AccountService();
