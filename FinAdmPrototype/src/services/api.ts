import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  occupation?: string;
  age?: number;
  role: 'admin' | 'normal';
  status?: 'ativo' | 'inativo';
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringPeriod?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    category: string;
    total: number;
    count: number;
  }>;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Response error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

class ApiService {
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await apiClient.get('/users');
      return { data: response.data.users || response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return { data: response.data.user || response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    age?: number;
    phone?: string;
    occupation?: string;
    role?: 'admin' | 'normal';
  }): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post('/users', userData);
      return { data: response.data.user || response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put(`/users/${userId}`, updates);
      return { data: response.data.user || response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return { data: response.data, message: 'Usuário deletado com sucesso' };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async loginUser(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post('/users/login', credentials);
      const data = response.data;
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return { data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllTransactions(): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await apiClient.get('/transactions');
      return { data: response.data.transactions || response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTransactionsByUser(userId: string): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await apiClient.get(`/transactions/user/${userId}`);
      return { data: response.data.transactions || response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createTransaction(transactionData: {
    userId: string;
    amount: number;
    description: string;
    category: string;
    type: 'income' | 'expense';
    date: string;
    tags?: string[];
    isRecurring?: boolean;
    recurringPeriod?: string;
  }): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiClient.post('/transactions', transactionData);
      return { data: response.data.transaction || response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiClient.put(`/transactions/${transactionId}`, updates);
      return { data: response.data.transaction || response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteTransaction(transactionId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/transactions/${transactionId}`);
      return { data: response.data, message: 'Transação deletada com sucesso' };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTransactionSummary(userId: string): Promise<ApiResponse<TransactionSummary>> {
    try {
      const response = await apiClient.get(`/transactions/user/${userId}/summary`);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getGlobalSummary(): Promise<ApiResponse<TransactionSummary>> {
    try {
      const response = await apiClient.get('/transactions/summary/global');
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/health');
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }

  private handleError(error: any): ApiResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      if (axiosError.response) {
        return {
          error: axiosError.response.data?.error || 
                 axiosError.response.data?.message || 
                 'Erro na requisição',
        };
      } else if (axiosError.request) {
        return {
          error: 'Erro de conexão com o servidor. Verifique sua internet.',
        };
      }
    }
    
    return {
      error: error.message || 'Erro desconhecido',
    };
  }
}

export const apiService = new ApiService();
export default apiService;
