import { useState, useEffect, useCallback } from 'react';
import { transactionApi, Transaction, getErrorMessage } from '../services/api';
import { toast } from 'sonner';

interface UseTransactionsParams {
  userId: string;
  page?: number;
  limit?: number;
  category?: string;
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean;
}

export function useTransactions({
  userId,
  page = 1,
  limit = 20,
  category,
  type,
  startDate,
  endDate,
  autoFetch = true,
}: UseTransactionsParams) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await transactionApi.list(userId, {
        page,
        limit,
        category,
        type,
        startDate,
        endDate,
      });

      setTransactions(response.transactions || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, page, limit, category, type, startDate, endDate]);

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    }
  }, [autoFetch, fetchTransactions]);

  const createTransaction = async (data: {
    amount: number;
    description: string;
    category: string;
    type: 'income' | 'expense';
    date?: string;
    tags?: string[];
  }) => {
    try {
      const response = await transactionApi.create({
        userId,
        ...data,
      });
      
      toast.success('Transação criada com sucesso!');
      await fetchTransactions(); // Refresh list
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw err;
    }
  };

  const updateTransaction = async (transactionId: string, data: Partial<Transaction>) => {
    try {
      const response = await transactionApi.update(transactionId, data);
      toast.success('Transação atualizada com sucesso!');
      await fetchTransactions(); // Refresh list
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw err;
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      await transactionApi.delete(transactionId);
      toast.success('Transação excluída com sucesso!');
      await fetchTransactions(); // Refresh list
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw err;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    pagination,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
