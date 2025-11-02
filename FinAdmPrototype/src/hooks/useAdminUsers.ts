import { useState, useEffect, useCallback } from 'react';
import {
  adminService,
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from '../services';
import type { AdminUser, SystemStats } from '../services/types';

// ============================================
// Types
// ============================================

export interface UseAdminUsersResult {
  users: AdminUser[];
  loading: boolean;
  error: Error | null;
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  stats: SystemStats | null;
  createUser: (data: CreateUserData) => Promise<AdminUser>;
  updateUser: (id: string, data: UpdateUserData) => Promise<AdminUser>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string, status: 'active' | 'inactive') => Promise<AdminUser>;
  resetPassword: (id: string, newPassword: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  loadStats: () => Promise<void>;
  exportUsers: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

export function useAdminUsers(filters?: UserFilters): UseAdminUsersResult {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.listUsers(filters);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.role, filters?.status, filters?.page, filters?.limit]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await adminService.getSystemStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserData) => {
    const user = await adminService.createUser(data);

    // Recarregar lista após criar
    await loadUsers();
    await loadStats();

    return user;
  }, [loadUsers, loadStats]);

  const updateUser = useCallback(async (id: string, data: UpdateUserData) => {
    const user = await adminService.updateUser(id, data);

    // Recarregar lista após atualizar
    await loadUsers();

    return user;
  }, [loadUsers]);

  const deleteUser = useCallback(async (id: string) => {
    await adminService.deleteUser(id);

    // Recarregar lista após deletar
    await loadUsers();
    await loadStats();
  }, [loadUsers, loadStats]);

  const toggleUserStatus = useCallback(async (id: string, status: 'active' | 'inactive') => {
    const user = await adminService.toggleUserStatus(id, status);

    // Recarregar lista após alterar status
    await loadUsers();

    return user;
  }, [loadUsers]);

  const resetPassword = useCallback(async (id: string, newPassword: string) => {
    await adminService.resetUserPassword(id, newPassword);
  }, []);

  const refreshUsers = useCallback(async () => {
    await loadUsers();
    await loadStats();
  }, [loadUsers, loadStats]);

  const exportUsers = useCallback(async () => {
    try {
      const blob = await adminService.exportUsers(filters);
      
      // Criar URL temporário e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar usuários:', err);
      throw err;
    }
  }, [filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    stats,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetPassword,
    refreshUsers,
    loadStats,
    exportUsers,
  };
}
