import axios, { AxiosError } from 'axios';

const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduzido para 5s para não travar muito quando backend estiver offline
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

export default api;

export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    monthlyIncome?: number;
    financialGoals?: string;
    spendingLimit?: number;
  };
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
  updatedAt: string;
}

export interface TransactionSummary {
  income: number;
  expenses: number;
  balance: number;
  categories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}

export interface UserStats {
  name: string;
  member_since: string;
  days_active: number;
  monthly_income: number;
  spending_limit: number;
  profile_completion: number;
}

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const data = response.data;
      
      // O backend pode retornar { user, token } ou { data: { user, token } }
      // Normalizar para sempre ter { user, token }
      if (data.data) {
        return {
          user: data.data.user || data.user,
          token: data.data.token || data.token,
        };
      }
      
      return {
        user: data.user,
        token: data.token,
      };
    } catch (error: any) {
      // Melhor tratamento de erro 401
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || 'Email ou senha incorretos';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  register: async (data: { email: string; password: string; name: string; age?: number }) => {
    try {
      const response = await api.post('/users/register', data);
      const responseData = response.data;
      
      // O backend retorna { user, token } diretamente ou dentro de { data }
      if (responseData.data) {
        return {
          user: responseData.data.user || responseData.user,
          token: responseData.data.token || responseData.token,
        };
      }
      
      return {
        user: responseData.user,
        token: responseData.token,
      };
    } catch (error: any) {
      // Melhor tratamento de erros de registro
      if (error.response?.status === 409) {
        throw new Error(error.response?.data?.message || 'Usuário já cadastrado com este email');
      }
      if (error.response?.status === 400) {
        const details = error.response?.data?.details;
        if (details && Array.isArray(details)) {
          const message = details.map((d: any) => d.message).join(', ');
          throw new Error(message || 'Dados inválidos');
        }
        throw new Error(error.response?.data?.message || 'Dados inválidos');
      }
      throw error;
    }
  },
};

export const userApi = {
  getProfile: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/profile/${userId}`);
    return response.data.user || response.data;
  },

  updateProfile: async (userId: string, data: Partial<User>) => {
    const response = await api.put(`/users/profile/${userId}`, data);
    return response.data;
  },

  getStats: async (userId: string): Promise<UserStats> => {
    const response = await api.get(`/users/stats/${userId}`);
    return response.data;
  },
};

export const transactionApi = {
  list: async (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      category?: string;
      type?: 'income' | 'expense';
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await api.get(`/transactions/user/${userId}`, { params });
    return response.data;
  },

  getById: async (transactionId: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data.transaction;
  },

  create: async (data: {
    userId: string;
    amount: number;
    description: string;
    category: string;
    type: 'income' | 'expense';
    date?: string;
    tags?: string[];
  }) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  update: async (transactionId: string, data: Partial<Transaction>) => {
    const response = await api.put(`/transactions/${transactionId}`, data);
    return response.data;
  },

  delete: async (transactionId: string) => {
    const response = await api.delete(`/transactions/${transactionId}`);
    return response.data;
  },

  getSummary: async (userId: string, period: string = '30d'): Promise<TransactionSummary> => {
    const response = await api.get(`/transactions/user/${userId}/summary`, {
      params: { period },
    });
    return response.data;
  },

  getCategories: async (userId: string) => {
    const response = await api.get(`/transactions/user/${userId}/categories`);
    return response.data;
  },

  createTransaction: async (transaction: Transaction) => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },
};

export const aggregationApi = {
  getUserData: async (userId: string) => {
    const response = await api.get(`/aggregation/user/${userId}`);
    return response.data;
  },

  getData: async (params: {
    mongoCollection?: string;
    sqlTable?: string;
    userId?: string;
  }) => {
    const response = await api.get('/aggregation/data', { params });
    return response.data;
  },
};

export function normalizeUserProfile(apiResponse: any): User {
  try {
    const user = apiResponse.user || apiResponse;
    
    // Garantir que todos os campos obrigatórios existam
    return {
      id: user.id || user._id || '',
      email: user.email || '',
      name: user.name || user.fullName || 'Usuário',
      age: user.age,
      isActive: user.isActive ?? user.is_active ?? true,
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
      updatedAt: user.updatedAt || user.updated_at || new Date().toISOString(),
      profile: {
        monthlyIncome: user.profile?.monthly_income ?? user.profile?.monthlyIncome ?? user.monthlyIncome ?? 0,
        financialGoals: user.profile?.financial_goals ?? user.profile?.financialGoals ?? user.financialGoals ?? '',
        spendingLimit: user.profile?.spending_limit ?? user.profile?.spendingLimit ?? user.spendingLimit ?? 0,
      },
    };
  } catch (error) {
    console.error('Erro ao normalizar perfil do usuário:', error);
    // Retornar um objeto padrão em caso de erro
    return {
      id: '',
      email: '',
      name: 'Usuário',
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        monthlyIncome: 0,
        financialGoals: '',
        spendingLimit: 0,
      },
    };
  }
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Verificar se é erro de conexão (backend offline)
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
    }
    
    // Verificar timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'O servidor demorou muito para responder. Tente novamente.';
    }
    
    // Mensagem do servidor
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    if (serverMessage) {
      return serverMessage;
    }
    
    // Status code específico
    if (error.response?.status === 401) {
      return 'Email ou senha incorretos';
    }
    if (error.response?.status === 409) {
      return 'Usuário já cadastrado com este email';
    }
    if (error.response?.status === 400) {
      return 'Dados inválidos. Verifique os campos preenchidos.';
    }
    if (error.response?.status === 503) {
      return 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';
    }
    
    return error.message || 'Erro ao processar requisição';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erro desconhecido';
}
