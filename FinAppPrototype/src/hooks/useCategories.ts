import { useState, useEffect } from 'react';
import { transactionApi, getErrorMessage } from '../services/api';
import { toast } from 'sonner';

export function useCategories(userId: string) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await transactionApi.getCategories(userId);
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    isLoading,
    refetch: fetchCategories,
  };
}
