import api from './api';
import type { Transaction, TransactionType, PaginatedResponse } from './types';

// ============================================
// Types
// ============================================

export interface CreateTransactionData {
  userId: string;
  category: string;
  amount: number;
  description: string;
  type: TransactionType;
  date?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringPeriod?: string;
}

export interface UpdateTransactionData {
  userId?: string;
  category?: string;
  amount?: number;
  description?: string;
  type?: TransactionType;
  date?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringPeriod?: string;
}

export interface TransactionFilters {
  userId?: string;
  category?: string;
  type?: TransactionType | 'all';
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
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
    
    if (filters?.userId) {
      params.append('userId', filters.userId);
    }
    if (filters?.category) {
      params.append('category', filters.category);
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
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
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
   * GET /transactions/user/:userId/summary
   */
  async getStats(filters?: Pick<TransactionFilters, 'from' | 'to'>, userId?: string): Promise<TransactionStats> {
    // Se não tiver userId, buscar do usuário autenticado
    const currentUserId = userId;
    if (!currentUserId) {
      throw new Error('UserId é obrigatório para buscar estatísticas');
    }
    
    const params = new URLSearchParams();
    
    // Se tiver from e to, converter para período aproximado ou usar diretamente
    if (filters?.from && filters?.to) {
      // O backend espera startDate/endDate ou period
      // Por enquanto, vamos usar period=30d como padrão e deixar o backend calcular
      // Ou podemos tentar calcular o período baseado nas datas
      const fromDate = new Date(filters.from);
      const toDate = new Date(filters.to);
      const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) {
        params.append('period', '7d');
      } else if (daysDiff <= 30) {
        params.append('period', '30d');
      } else if (daysDiff <= 90) {
        params.append('period', '90d');
      } else {
        params.append('period', '1y');
      }
    } else {
      // Padrão: últimos 30 dias
      params.append('period', '30d');
    }

    const queryString = params.toString();
    const url = `/transactions/user/${currentUserId}/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    // Formato de resposta: { period, summary: { income, expenses, balance, total_transactions }, categories }
    const summary = response.data.summary;
    
    // Adaptar categorias do formato do backend
    const categoriesList = response.data.categories || [];
    const adaptedCategories = categoriesList.map((cat: any) => ({
      categoryId: cat._id || cat.category || cat.categoryId || 'other',
      categoryName: cat.category || cat.categoryName || 'Outros',
      total: cat.total_amount || cat.total || 0,
      count: cat.count || 0,
      percentage: 0, // Pode ser calculado depois
    }));
    
    // Adaptar para formato esperado pelo TransactionStats
    return {
      summary: {
        income: summary.income || 0,
        expenses: Math.abs(summary.expenses || 0),
        balance: summary.balance || 0,
        count: summary.total_transactions || 0,
      },
      byCategory: adaptedCategories,
      byAccount: [],
    };
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
