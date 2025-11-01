import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'normal' | 'admin';
  age?: number;
  occupation?: string;
  monthlyIncome?: number;
  spendingLimit?: number;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  age?: number;
  phone?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ProfileStats {
  memberSince: string;
  monthlyIncome: number;
  profileCompletion: number;
}

class AuthService {
  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/users/login', credentials);
    
    // Salvar token e usuário no localStorage
    if (response.data.token) {
      localStorage.setItem('fin_auth_token', response.data.token);
      localStorage.setItem('fin_user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Realiza registro de novo usuário
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/users/register', data);
    
    // Salvar token e usuário no localStorage após registro
    if (response.data.token) {
      localStorage.setItem('fin_auth_token', response.data.token);
      localStorage.setItem('fin_user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    // Limpar dados locais
    localStorage.removeItem('fin_auth_token');
    localStorage.removeItem('fin_user');
    
    // Opcional: chamar endpoint de logout no backend
    try {
      await api.post('/users/logout');
    } catch (error) {
      // Ignorar erro de logout do backend
      console.error('Erro ao fazer logout no backend:', error);
    }
  }

  /**
   * Obtém o perfil do usuário logado
   */
  async getProfile(userId: string): Promise<User> {
    const response = await api.get<{ user: User }>(`/users/profile/${userId}`);
    
    // Atualizar dados do usuário no localStorage
    localStorage.setItem('fin_user', JSON.stringify(response.data.user));
    
    return response.data.user;
  }

  /**
   * Atualiza o perfil do usuário
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const response = await api.put<{ user: User }>(`/users/profile/${userId}`, updates);
    
    // Atualizar dados do usuário no localStorage
    localStorage.setItem('fin_user', JSON.stringify(response.data.user));
    
    return response.data.user;
  }

  /**
   * Obtém estatísticas do perfil do usuário
   */
  async getProfileStats(userId: string): Promise<ProfileStats> {
    const response = await api.get<{ stats: ProfileStats }>(`/users/stats/${userId}`);
    return response.data.stats;
  }

  /**
   * Obtém o usuário armazenado localmente
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('fin_user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erro ao fazer parse do usuário:', error);
      return null;
    }
  }

  /**
   * Obtém o token armazenado localmente
   */
  getToken(): string | null {
    return localStorage.getItem('fin_auth_token');
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
