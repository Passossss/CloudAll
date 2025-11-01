import api from './api';
import type { AdminUser, SystemStats, MenuItem, Permission } from './types';

// ============================================
// Types
// ============================================

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

export interface UserFilters {
  search?: string;
  role?: 'normal' | 'admin' | 'all';
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
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

export interface UpdateMenuData {
  items: MenuItem[];
}

export interface UpdatePermissionData {
  roles: string[];
}

// ============================================
// Admin Service
// ============================================

class AdminService {
  // ============================================
  // Helpers
  // ============================================
  
  private adaptUser(user: any): AdminUser {
    return {
      ...user,
      status: user.isActive ? 'active' : 'inactive',
      lastLogin: user.lastLogin,
      transactionCount: user.transactionCount,
      totalBalance: user.totalBalance,
    };
  }

  // ============================================
  // User Management
  // ============================================

  /**
   * Lista todos os usuários do sistema (admin only)
   * GET /users
   */
  async listUsers(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('q', filters.search);
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
    const url = `/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    
    // Adaptar formato de resposta do BFF/microserviço
    // Formato esperado: { data: { users: [...], pagination: {...} } } ou { users: [...], pagination: {...} }
    const responseData = response.data.data || response.data;
    const usersList = responseData.users || responseData.data || [];
    const paginationData = responseData.pagination || responseData.meta || { page: 1, limit: 20, total: 0 };
    
    // Adaptar isActive para status
    const adaptedUsers = usersList.map((user: any) => this.adaptUser(user));
    
    return {
      users: adaptedUsers,
      pagination: {
        current: paginationData.current || paginationData.page || 1,
        pages: paginationData.pages || Math.ceil((paginationData.total || 0) / (paginationData.limit || 20)),
        total: paginationData.total || 0,
        limit: paginationData.limit || 20,
      },
    };
  }

  /**
   * Obtém detalhes completos de um usuário (admin only)
   * GET /users/:id
   */
  async getUserDetails(userId: string): Promise<AdminUser> {
    const response = await api.get(`/users/${userId}`);
    // Adaptar formato de resposta
    const user = response.data.user || response.data.data?.user || response.data;
    return this.adaptUser(user);
  }

  /**
   * Cria um novo usuário (admin only)
   * POST /users
   */
  async createUser(data: CreateUserData): Promise<AdminUser> {
    const response = await api.post('/users', data);
    // Adaptar formato de resposta
    const user = response.data.user || response.data.data?.user || response.data;
    return this.adaptUser(user);
  }

  /**
   * Atualiza um usuário (admin only)
   * PUT /users/:id
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<AdminUser> {
    const response = await api.put(`/users/${userId}`, data);
    // Adaptar formato de resposta
    const user = response.data.user || response.data.data?.user || response.data;
    return this.adaptUser(user);
  }

  /**
   * Deleta um usuário (admin only)
   * DELETE /users/:id
   */
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  }

  /**
   * Altera status de um usuário (ativar/desativar)
   * PUT /users/:id/status
   */
  async toggleUserStatus(userId: string, status: 'active' | 'inactive'): Promise<AdminUser> {
    const response = await api.put(`/users/${userId}/status`, {
      status,
    });
    const user = response.data.user || response.data;
    return this.adaptUser(user);
  }

  /**
   * Reseta senha de um usuário (admin only)
   * POST /users/:id/reset-password
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    await api.post(`/users/${userId}/reset-password`, {
      password: newPassword,
    });
  }

  /**
   * Exporta lista de usuários para CSV (admin only)
   * GET /users/export
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
    const url = `/users/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  // ============================================
  // System Stats
  // ============================================

  /**
   * Obtém estatísticas gerais do sistema (admin only)
   * GET /admin/stats
   */
  async getSystemStats(): Promise<SystemStats> {
    const response = await api.get<{ stats: SystemStats }>('/admin/stats');
    return response.data.stats;
  }

  // ============================================
  // Menu Management
  // ============================================

  /**
   * Obtém configuração do menu
   * GET /menu
   */
  async getMenu(): Promise<MenuItem[]> {
    const response = await api.get<{ menu: MenuItem[] }>('/menu');
    return response.data.menu;
  }

  /**
   * Atualiza configuração do menu (admin only)
   * PUT /menu
   */
  async updateMenu(data: UpdateMenuData): Promise<MenuItem[]> {
    const response = await api.put<{ menu: MenuItem[] }>('/menu', data);
    return response.data.menu;
  }

  /**
   * Reordena itens do menu (admin only)
   * PUT /menu/reorder
   */
  async reorderMenu(itemIds: string[]): Promise<void> {
    await api.put('/menu/reorder', { itemIds });
  }

  // ============================================
  // Permission Management
  // ============================================

  /**
   * Lista todas as permissões
   * GET /permissions
   */
  async getPermissions(): Promise<Permission[]> {
    const response = await api.get<{ permissions: Permission[] }>('/permissions');
    return response.data.permissions;
  }

  /**
   * Atualiza permissões de um recurso (admin only)
   * PUT /permissions/:id
   */
  async updatePermission(permissionId: string, data: UpdatePermissionData): Promise<Permission> {
    const response = await api.put<{ permission: Permission }>(
      `/permissions/${permissionId}`,
      data
    );
    return response.data.permission;
  }

  /**
   * Obtém permissões de um usuário específico
   * GET /users/:id/permissions
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const response = await api.get<{ permissions: Permission[] }>(`/users/${userId}/permissions`);
    return response.data.permissions;
  }

  /**
   * Verifica se usuário tem permissão específica
   * GET /permissions/check
   */
  async checkPermission(resource: string, action: string): Promise<boolean> {
    const response = await api.get<{ hasPermission: boolean }>(
      `/permissions/check?resource=${resource}&action=${action}`
    );
    return response.data.hasPermission;
  }

  // ============================================
  // Activity Logs
  // ============================================

  /**
   * Obtém logs de atividade do sistema (admin only)
   * GET /admin/activity-logs
   */
  async getActivityLogs(filters?: {
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    logs: Array<{
      id: string;
      userId: string;
      userName: string;
      action: string;
      resource: string;
      details?: any;
      ipAddress?: string;
      userAgent?: string;
      createdAt: string;
    }>;
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }> {
    const params = new URLSearchParams();
    
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/admin/activity-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  }
}

export const adminService = new AdminService();
