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
      const response = await transactionService.list(filters);
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
    if (!user) return;

    try {
      const statsData = await transactionService.getStats({ from, to });
      setStats(statsData.summary);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, [user]);

  const createTransaction = useCallback(async (data: CreateTransactionData) => {
    if (!user) throw new Error('Usuário não autenticado');

    const transaction = await transactionService.create(data);

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
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    pagination,
    stats,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    refreshTransactions,
    loadStats,
    exportToCSV,
  };
}
