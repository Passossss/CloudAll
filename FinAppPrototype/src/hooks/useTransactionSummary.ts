import { useState, useEffect, useCallback } from 'react';
import { transactionApi, TransactionSummary, getErrorMessage } from '../services/api';

export function useTransactionSummary(userId: string, period: string = '30d') {
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await transactionApi.getSummary(userId, period);
      setSummary(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { 
    summary, 
    isLoading, 
    error, 
    refetch: fetchSummary 
  };
}
