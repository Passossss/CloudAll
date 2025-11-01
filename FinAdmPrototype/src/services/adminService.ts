import api from './api';
import { User } from './authService';

export interface AdminUser extends User {
  status: 'active' | 'inactive';
  lastLogin?: string;
  transactionCount?: number;
  totalBalance?: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'normal' | 'admin';
  age?: number;
  occupation?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'normal' | 'admin';
  age?: number;
  occupation?: string;
  status?: 'active' | 'inactive';
}

export interface UserListResponse {
  users: AdminUser[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  averageTransactionsPerUser: number;
}

export interface UserFilters {
  search?: string;
  role?: 'normal' | 'admin' | 'all';
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
}

class AdminService {
  /**
   * Lista todos os usuários do sistema (admin only)
   */
  async listUsers(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.role && filters.role !== 'all') {
      params.append('role', filters.role);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<UserListResponse>(url);
    return response.data;
  }

  /**
   * Cria um novo usuário (admin only)
   */
  async createUser(data: CreateUserData): Promise<AdminUser> {
    const response = await api.post<{ user: AdminUser }>('/admin/users', data);
    return response.data.user;
  }

  /**
   * Atualiza um usuário (admin only)
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<AdminUser> {
    const response = await api.put<{ user: AdminUser }>(`/admin/users/${userId}`, data);
    return response.data.user;
  }

  /**
   * Deleta um usuário (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  }

  /**
   * Obtém estatísticas gerais do sistema (admin only)
   */
  async getSystemStats(): Promise<SystemStats> {
    const response = await api.get<{ stats: SystemStats }>('/admin/stats');
    return response.data.stats;
  }

  /**
   * Obtém detalhes completos de um usuário (admin only)
   */
  async getUserDetails(userId: string): Promise<AdminUser> {
    const response = await api.get<{ user: AdminUser }>(`/admin/users/${userId}`);
    return response.data.user;
  }

  /**
   * Exporta lista de usuários para CSV (admin only)
   */
  async exportUsers(filters?: UserFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters?.role && filters.role !== 'all') {
      params.append('role', filters.role);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }

    const queryString = params.toString();
    const url = `/admin/users/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  /**
   * Altera status de um usuário (ativar/desativar)
   */
  async toggleUserStatus(userId: string, status: 'active' | 'inactive'): Promise<AdminUser> {
    const response = await api.patch<{ user: AdminUser }>(`/admin/users/${userId}/status`, {
      status,
    });
    return response.data.user;
  }

  /**
   * Reseta senha de um usuário (admin only)
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    await api.post(`/admin/users/${userId}/reset-password`, {
      password: newPassword,
    });
  }
}

export const adminService = new AdminService();
