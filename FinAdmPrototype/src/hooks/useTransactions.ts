import { useState, useEffect, useCallback } from 'react';
import { 
  transactionService, 
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
} from '../services';
import type { Transaction } from '../services/types';
import { useAuth } from '../components/contexts/AuthContext';

// ============================================
// Types
// ============================================

export interface TransactionStats {
  income: number;
  expenses: number;
  balance: number;
  count: number;
}

export interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  stats: TransactionStats | null;
  categories: Array<{
    category: string;
    type: 'income' | 'expense';
    total: number;
    count: number;
  }>;
  createTransaction: (data: CreateTransactionData) => Promise<Transaction>;
  updateTransaction: (id: string, data: UpdateTransactionData) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  duplicateTransaction: (id: string) => Promise<Transaction>;
  refreshTransactions: () => Promise<void>;
  loadStats: (from?: string, to?: string) => Promise<void>;
  exportToCSV: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

export function useTransactions(filters?: TransactionFilters): UseTransactionsResult {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [categories, setCategories] = useState<Array<{
    category: string;
    type: 'income' | 'expense';
    total: number;
    count: number;
  }>>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });

  const loadTransactions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Se filters tiver a propriedade userId (mesmo que seja undefined), usar os filtros como estão
      // Caso contrário, adicionar userId do usuário logado
      const effectiveFilters = filters && 'userId' in filters
        ? filters 
        : { ...filters, userId: user.id };
      
      console.log('[useTransactions] Carregando com filtros:', effectiveFilters);
      const response = await transactionService.list(effectiveFilters);
      console.log('[useTransactions] Transações carregadas:', response.transactions.length);
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const loadStats = useCallback(async (from?: string, to?: string) => {
    if (!user) {
      setStats(null);
      setCategories([]);
      return;
    }

    try {
      // Se userId for undefined (admin vendo todas), calcular estatísticas do lado do cliente
      if (filters && 'userId' in filters && !filters.userId) {
        console.log('[useTransactions] Calculando stats do lado do cliente para', transactions.length, 'transações');
        // Calcular estatísticas das transações carregadas
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        setStats({
          income,
          expenses: -expenses,
          balance: income - expenses,
          count: transactions.length,
        });

        // Agrupar por categoria
        const categoriesMap = new Map<string, { type: 'income' | 'expense', total: number, count: number }>();
        transactions.forEach(t => {
          const key = `${t.category}_${t.type}`;
          const existing = categoriesMap.get(key) || { type: t.type, total: 0, count: 0 };
          categoriesMap.set(key, {
            type: t.type,
            total: existing.total + Math.abs(t.amount),
            count: existing.count + 1,
          });
        });

        const categoriesList = Array.from(categoriesMap.entries()).map(([key, data]) => ({
          category: key.split('_')[0],
          type: data.type,
          total: data.total,
          count: data.count,
        }));
        
        setCategories(categoriesList);
        return;
      }

      // Para usuários normais ou admin filtrando por usuário específico, buscar do backend
      const userId = filters?.userId || user.id;
      const statsData = await transactionService.getStats({ from, to }, userId);
      setStats(statsData.summary);
      
      // Adaptar categorias do formato byCategory
      if (statsData.byCategory && Array.isArray(statsData.byCategory)) {
        const adaptedCategories = statsData.byCategory.map((cat: any) => ({
          category: cat.categoryId || cat.category || cat._id || cat.categoryName || 'other',
          type: (cat.type || 'expense') as 'income' | 'expense',
          total: cat.total || cat.total_amount || 0,
          count: cat.count || 0,
        }));
        setCategories(adaptedCategories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setStats(null);
      setCategories([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

  const createTransaction = useCallback(async (data: CreateTransactionData) => {
    if (!user) throw new Error('Usuário não autenticado');

    // Usar userId dos dados se fornecido, senão usar do usuário logado
    const transactionData = { ...data, userId: data.userId || user.id };

    const transaction = await transactionService.create(transactionData);

    // Recarregar lista após criar
    await loadTransactions();
    await loadStats();

    return transaction;
  }, [user, loadTransactions, loadStats]);

  const updateTransaction = useCallback(async (id: string, data: UpdateTransactionData) => {
    const transaction = await transactionService.update(id, data);

    // Recarregar lista após atualizar
    await loadTransactions();
    await loadStats();

    return transaction;
  }, [loadTransactions, loadStats]);

  const deleteTransaction = useCallback(async (id: string) => {
    await transactionService.delete(id);

    // Recarregar lista após deletar
    await loadTransactions();
    await loadStats();
  }, [loadTransactions, loadStats]);

  const duplicateTransaction = useCallback(async (id: string) => {
    const transaction = await transactionService.duplicate(id);

    // Recarregar lista após duplicar
    await loadTransactions();
    await loadStats();

    return transaction;
  }, [loadTransactions, loadStats]);

  const refreshTransactions = useCallback(async () => {
    await loadTransactions();
    await loadStats();
  }, [loadTransactions, loadStats]);

  const exportToCSV = useCallback(async () => {
    try {
      const blob = await transactionService.exportToCSV(filters);
      
      // Criar URL temporário e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar transações:', err);
      throw err;
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [loadTransactions, loadStats]);

  return {
    transactions,
    loading,
    error,
    pagination,
    stats,
    categories,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    refreshTransactions,
    loadStats,
    exportToCSV,
  };
}
