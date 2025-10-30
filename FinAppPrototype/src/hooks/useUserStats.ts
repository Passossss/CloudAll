import { useState, useEffect } from 'react';
import { userApi, UserStats, getErrorMessage } from '../services/api';

export function useUserStats(userId: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await userApi.getStats(userId);
        setStats(data);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, isLoading, error };
}
