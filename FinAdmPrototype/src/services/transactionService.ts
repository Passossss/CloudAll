import api from './api';
import type { Transaction, TransactionType, PaginatedResponse } from './types';

// ============================================
// Types
// ============================================

export interface CreateTransactionData {
  accountId: string;
  categoryId: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  type: TransactionType;
  tags?: string[];
}

export interface UpdateTransactionData {
  accountId?: string;
  categoryId?: string;
  amount?: number;
  currency?: string;
  date?: string;
  description?: string;
  type?: TransactionType;
  tags?: string[];
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType | 'all';
  from?: string;
  to?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface TransactionSummary {
  income: number;
  expenses: number;
  balance: number;
  count: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
  percentage: number;
}

export interface TransactionStats {
  summary: TransactionSummary;
  byCategory: CategorySummary[];
  byAccount: Array<{
    accountId: string;
    accountName: string;
    total: number;
    count: number;
  }>;
}

// ============================================
// Transaction Service
// ============================================

class TransactionService {
  /**
   * Lista transações com filtros e paginação
   * GET /transactions
   */
  async list(filters?: TransactionFilters): Promise<TransactionListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.accountId) {
      params.append('accountId', filters.accountId);
    }
    if (filters?.categoryId) {
      params.append('categoryId', filters.categoryId);
    }
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.from) {
      params.append('from', filters.from);
    }
    if (filters?.to) {
      params.append('to', filters.to);
    }
    if (filters?.search) {
      params.append('q', filters.search);
    }
    if (filters?.sort) {
      params.append('sort', filters.sort);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `/transactions${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    
    // Adaptar formato de resposta do BFF/microserviço
    // Formato esperado: { data: { transactions: [...], pagination: {...} } } ou { transactions: [...], pagination: {...} }
    const responseData = response.data.data || response.data;
    const transactionsList = responseData.transactions || [];
    const paginationData = responseData.pagination || { page: 1, limit: 20, total: 0 };
    
    return {
      transactions: transactionsList,
      pagination: {
        current: paginationData.current || paginationData.page || 1,
        pages: paginationData.pages || Math.ceil((paginationData.total || 0) / (paginationData.limit || 20)),
        total: paginationData.total || 0,
        limit: paginationData.limit || 20,
      },
    };
  }

  /**
   * Obtém uma transação específica
   * GET /transactions/:id
   */
  async getById(transactionId: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${transactionId}`);
    // Adaptar formato de resposta
    return response.data.transaction || response.data.data?.transaction || response.data;
  }

  /**
   * Cria uma nova transação
   * POST /transactions
   */
  async create(data: CreateTransactionData): Promise<Transaction> {
    const response = await api.post('/transactions', data);
    // Adaptar formato de resposta
    return response.data.transaction || response.data.data?.transaction || response.data;
  }

  /**
   * Atualiza uma transação
   * PUT /transactions/:id
   */
  async update(transactionId: string, data: UpdateTransactionData): Promise<Transaction> {
    const response = await api.put(`/transactions/${transactionId}`, data);
    // Adaptar formato de resposta
    return response.data.transaction || response.data.data?.transaction || response.data;
  }

  /**
   * Deleta uma transação
   * DELETE /transactions/:id
   */
  async delete(transactionId: string): Promise<void> {
    await api.delete(`/transactions/${transactionId}`);
  }

  /**
   * Obtém estatísticas de transações
   * GET /transactions/stats
   */
  async getStats(filters?: Pick<TransactionFilters, 'from' | 'to' | 'accountId'>): Promise<TransactionStats> {
    const params = new URLSearchParams();
    
    if (filters?.from) {
      params.append('from', filters.from);
    }
    if (filters?.to) {
      params.append('to', filters.to);
    }
    if (filters?.accountId) {
      params.append('accountId', filters.accountId);
    }

    const queryString = params.toString();
    const url = `/transactions/stats${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<{ stats: TransactionStats }>(url);
    return response.data.stats;
  }

  /**
   * Importa múltiplas transações (bulk)
   * POST /transactions/import
   */
  async bulkImport(transactions: CreateTransactionData[]): Promise<Transaction[]> {
    const response = await api.post<{ transactions: Transaction[] }>(
      '/transactions/bulk',
      { transactions }
    );
    return response.data.transactions;
  }

  /**
   * Importa transações via arquivo CSV
   * POST /transactions/import (multipart)
   */
  async importFromCSV(file: File): Promise<{ imported: number; failed: number; errors?: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ imported: number; failed: number; errors?: string[] }>(
      '/transactions/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Exporta transações para CSV
   * GET /transactions/export
   */
  async exportToCSV(filters?: TransactionFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters?.accountId) {
      params.append('accountId', filters.accountId);
    }
    if (filters?.categoryId) {
      params.append('categoryId', filters.categoryId);
    }
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.from) {
      params.append('from', filters.from);
    }
    if (filters?.to) {
      params.append('to', filters.to);
    }

    const queryString = params.toString();
    const url = `/transactions/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  /**
   * Duplica uma transação
   * POST /transactions/:id/duplicate
   */
  async duplicate(transactionId: string): Promise<Transaction> {
    const response = await api.post<{ transaction: Transaction }>(
      `/transactions/${transactionId}/duplicate`
    );
    return response.data.transaction;
  }
}

export const transactionService = new TransactionService();
