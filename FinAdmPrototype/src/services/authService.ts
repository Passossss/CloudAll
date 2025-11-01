import api from './api';
import { STORAGE_KEYS } from './config';
import type { User, UserStats } from './types';

// ============================================
// Types
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================
// Auth Service
// ============================================

class AuthService {
  /**
   * Realiza login do usuário
   * POST /users/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/users/login', credentials);
    
    // Adaptar resposta do BFF para formato esperado
    const bffResponse = response.data;
    const loginResponse: LoginResponse = {
      accessToken: bffResponse.token || bffResponse.accessToken,
      refreshToken: bffResponse.refreshToken || bffResponse.token,
      expiresIn: 86400, // 24h em segundos
      user: {
        id: bffResponse.user?.id || bffResponse.user?.userId,
        name: bffResponse.user?.name,
        email: bffResponse.user?.email,
        phone: bffResponse.user?.phone,
        role: bffResponse.user?.role || 'normal',
        avatar: bffResponse.user?.avatar,
      } as any
    };
    
    // Salvar tokens e usuário no localStorage
    this.saveAuthData(loginResponse);
    
    return loginResponse;
  }

  /**
   * Realiza registro de novo usuário
   * POST /users/register
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post('/users/register', data);
    
    // Adaptar resposta do BFF para formato esperado
    const bffResponse = response.data;
    const loginResponse: LoginResponse = {
      accessToken: bffResponse.token || bffResponse.accessToken,
      refreshToken: bffResponse.refreshToken || bffResponse.token,
      expiresIn: 86400, // 24h em segundos
      user: {
        id: bffResponse.user?.id || bffResponse.user?.userId,
        name: bffResponse.user?.name,
        email: bffResponse.user?.email,
        phone: bffResponse.user?.phone,
        role: bffResponse.user?.role || 'normal',
        avatar: bffResponse.user?.avatar,
      } as any
    };
    
    // Salvar tokens e usuário no localStorage após registro
    this.saveAuthData(loginResponse);
    
    return loginResponse;
  }

  /**
   * Renova o token de acesso usando refresh token
   * POST /users/refresh (se implementado, caso contrário manter login)
   */
  async refresh(): Promise<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('Refresh token não encontrado');
    }

    // Se o endpoint de refresh não existir, retornar erro ou fazer novo login
    // Por enquanto, apenas retornar erro se não houver refresh endpoint
    throw new Error('Refresh token endpoint não implementado. Faça login novamente.');
  }

  /**
   * Realiza logout do usuário
   * (Endpoint de logout não implementado no BFF ainda)
   */
  async logout(): Promise<void> {
    // Limpar dados locais
    this.clearAuthData();
  }

  /**
   * Obtém o perfil do usuário atual
   * GET /users/profile/:id (precisa do ID do usuário)
   */
  async getCurrentUserProfile(): Promise<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    return this.getUser(currentUser.id);
  }

  /**
   * Obtém um usuário específico por ID
   * GET /users/profile/:id
   */
  async getUser(userId: string): Promise<User> {
    const response = await api.get(`/users/profile/${userId}`);
    
    // Adaptar resposta do BFF
    const userData = response.data.user || response.data;
    const user: User = {
      id: userData.id || userData.userId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role || 'normal',
      avatar: userData.avatar,
    } as any;
    
    // Atualizar dados do usuário no localStorage se for o usuário atual
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    
    return user;
  }

  /**
   * Atualiza o perfil do usuário
   * PUT /users/profile/:id
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const response = await api.put(`/users/profile/${userId}`, updates);
    
    // Adaptar resposta do BFF
    const userData = response.data.user || response.data;
    const user: User = {
      id: userData.id || userData.userId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role || 'normal',
      avatar: userData.avatar,
    } as any;
    
    // Atualizar dados do usuário no localStorage se for o usuário atual
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    
    return user;
  }

  /**
   * Obtém estatísticas do perfil do usuário
   * GET /users/stats/:id
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const response = await api.get(`/users/stats/${userId}`);
    
    // Adaptar resposta do BFF
    return response.data.stats || response.data;
  }

  /**
   * Altera a senha do usuário
   * POST /users/:id/change-password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    await api.post(`/users/${userId}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  /**
   * Solicita redefinição de senha
   * (Endpoint não implementado no BFF ainda)
   */
  async forgotPassword(email: string): Promise<void> {
    throw new Error('Endpoint de redefinição de senha não implementado');
  }

  /**
   * Redefine a senha usando token
   * (Endpoint não implementado no BFF ainda)
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    throw new Error('Endpoint de reset de senha não implementado');
  }

  // ============================================
  // Local Storage Helpers
  // ============================================

  /**
   * Salva dados de autenticação no localStorage
   */
  private saveAuthData(data: LoginResponse): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
  }

  /**
   * Limpa dados de autenticação do localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Obtém o usuário armazenado localmente
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Erro ao fazer parse do usuário:', error);
      return null;
    }
  }

  /**
   * Obtém o token de acesso armazenado localmente
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Obtém o refresh token armazenado localmente
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  }

  /**
   * Verifica se o usuário é administrador
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}

export const authService = new AuthService();
