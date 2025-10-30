import api from './api';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string; // ISO string
  account?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionData {
  userId: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
  account?: string;
}

export interface UpdateTransactionData {
  description?: string;
  amount?: number;
  category?: string;
  type?: TransactionType;
  date?: string;
  account?: string;
}

export interface TransactionFilters {
  category?: string;
  type?: TransactionType | 'all';
  startDate?: string;
  endDate?: string;
  search?: string;
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
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface TransactionSummaryResponse {
  summary: TransactionSummary;
  categories: CategorySummary[];
}

class TransactionService {
  /**
   * Cria uma nova transação
   */
  async create(data: CreateTransactionData): Promise<Transaction> {
    const response = await api.post<{ transaction: Transaction }>('/transactions', data);
    return response.data.transaction;
  }

  /**
   * Lista transações do usuário com filtros e paginação
   */
  async list(userId: string, filters?: TransactionFilters): Promise<TransactionListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `/transactions/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<TransactionListResponse>(url);
    return response.data;
  }

  /**
   * Obtém uma transação específica
   */
  async getById(transactionId: string): Promise<Transaction> {
    const response = await api.get<{ transaction: Transaction }>(`/transactions/${transactionId}`);
    return response.data.transaction;
  }

  /**
   * Atualiza uma transação
   */
  async update(transactionId: string, data: UpdateTransactionData): Promise<Transaction> {
    const response = await api.put<{ transaction: Transaction }>(`/transactions/${transactionId}`, data);
    return response.data.transaction;
  }

  /**
   * Deleta uma transação
   */
  async delete(transactionId: string): Promise<void> {
    await api.delete(`/transactions/${transactionId}`);
  }

  /**
   * Obtém resumo de transações do usuário
   */
  async getSummary(userId: string, period?: string): Promise<TransactionSummaryResponse> {
    const params = period ? `?period=${period}` : '';
    const response = await api.get<TransactionSummaryResponse>(
      `/transactions/user/${userId}/summary${params}`
    );
    return response.data;
  }

  /**
   * Obtém lista de categorias usadas pelo usuário
   */
  async getCategories(userId: string): Promise<string[]> {
    const response = await api.get<{ categories: string[] }>(`/transactions/user/${userId}/categories`);
    return response.data.categories;
  }

  /**
   * Importa múltiplas transações (bulk)
   */
  async bulkImport(userId: string, transactions: CreateTransactionData[]): Promise<Transaction[]> {
    const response = await api.post<{ transactions: Transaction[] }>(
      `/transactions/bulk`,
      { userId, transactions }
    );
    return response.data.transactions;
  }

  /**
   * Exporta transações do usuário para CSV
   */
  async exportToCSV(userId: string, filters?: TransactionFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters?.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }

    const queryString = params.toString();
    const url = `/transactions/user/${userId}/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    return response.data;
  }
}

export const transactionService = new TransactionService();
