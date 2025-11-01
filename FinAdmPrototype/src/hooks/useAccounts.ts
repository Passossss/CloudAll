import { useState, useEffect, useCallback } from 'react';
import {
  accountService,
  CreateAccountData,
  UpdateAccountData,
  AccountFilters,
} from '../services';
import type { Account } from '../services/types';
import { useAuth } from '../components/contexts/AuthContext';

// ============================================
// Types
// ============================================

export interface AccountStats {
  totalBalance: number;
  accountsCount: number;
}

export interface UseAccountsResult {
  accounts: Account[];
  loading: boolean;
  error: Error | null;
  stats: AccountStats | null;
  totalBalance: number;
  createAccount: (data: CreateAccountData) => Promise<Account>;
  updateAccount: (id: string, data: UpdateAccountData) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  loadStats: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

export function useAccounts(filters?: AccountFilters): UseAccountsResult {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);

  const loadAccounts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accountsData = await accountService.list(filters);
      setAccounts(accountsData);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar contas:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const loadStats = useCallback(async () => {
    if (!user) return;

    try {
      const [statsData, balance] = await Promise.all([
        accountService.getStats(),
        accountService.getTotalBalance(),
      ]);
      setStats(statsData);
      setTotalBalance(balance);
    } catch (err) {
      console.error('Erro ao carregar estatísticas de contas:', err);
    }
  }, [user]);

  const createAccount = useCallback(async (data: CreateAccountData) => {
    if (!user) throw new Error('Usuário não autenticado');

    const account = await accountService.create(data);

    // Recarregar lista após criar
    await loadAccounts();
    await loadStats();

    return account;
  }, [user, loadAccounts, loadStats]);

  const updateAccount = useCallback(async (id: string, data: UpdateAccountData) => {
    const account = await accountService.update(id, data);

    // Recarregar lista após atualizar
    await loadAccounts();
    await loadStats();

    return account;
  }, [loadAccounts, loadStats]);

  const deleteAccount = useCallback(async (id: string) => {
    await accountService.delete(id);

    // Recarregar lista após deletar
    await loadAccounts();
    await loadStats();
  }, [loadAccounts, loadStats]);

  const refreshAccounts = useCallback(async () => {
    await loadAccounts();
    await loadStats();
  }, [loadAccounts, loadStats]);

  useEffect(() => {
    loadAccounts();
    loadStats();
  }, [loadAccounts, loadStats]);

  return {
    accounts,
    loading,
    error,
    stats,
    totalBalance,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts,
    loadStats,
  };
}
