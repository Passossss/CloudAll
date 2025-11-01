import { useState, useEffect, useCallback } from 'react';
import { 
  transactionService, 
  Transaction, 
  CreateTransactionData, 
  UpdateTransactionData,
  TransactionFilters,
  TransactionSummaryResponse
} from '../services/transactionService';
import { useAuth } from '../components/contexts/AuthContext';

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
  summary: TransactionSummaryResponse | null;
  createTransaction: (data: Omit<CreateTransactionData, 'userId'>) => Promise<Transaction>;
  updateTransaction: (id: string, data: UpdateTransactionData) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  loadSummary: (period?: string) => Promise<void>;
}

export function useTransactions(filters?: TransactionFilters): UseTransactionsResult {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [summary, setSummary] = useState<TransactionSummaryResponse | null>(null);
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
      const response = await transactionService.list(user.id, filters);
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const loadSummary = useCallback(async (period?: string) => {
    if (!user) return;

    try {
      const summaryData = await transactionService.getSummary(user.id, period);
      setSummary(summaryData);
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
    }
  }, [user]);

  const createTransaction = useCallback(async (data: Omit<CreateTransactionData, 'userId'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    const transaction = await transactionService.create({
      ...data,
      userId: user.id,
    });

    // Recarregar lista após criar
    await loadTransactions();
    await loadSummary();

    return transaction;
  }, [user, loadTransactions, loadSummary]);

  const updateTransaction = useCallback(async (id: string, data: UpdateTransactionData) => {
    const transaction = await transactionService.update(id, data);

    // Recarregar lista após atualizar
    await loadTransactions();
    await loadSummary();

    return transaction;
  }, [loadTransactions, loadSummary]);

  const deleteTransaction = useCallback(async (id: string) => {
    await transactionService.delete(id);

    // Recarregar lista após deletar
    await loadTransactions();
    await loadSummary();
  }, [loadTransactions, loadSummary]);

  const refreshTransactions = useCallback(async () => {
    await loadTransactions();
    await loadSummary();
  }, [loadTransactions, loadSummary]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    pagination,
    summary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions,
    loadSummary,
  };
}
