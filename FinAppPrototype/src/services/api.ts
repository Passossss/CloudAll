import axios, { AxiosError } from 'axios';

const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  register: async (data: { email: string; password: string; name: string; age?: number }) => {
    const response = await api.post('/users/register', data);
    return response.data;
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

  listUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  createUser: async (data: any) => {
    // The user service exposes registration at /users/register
    const response = await api.post('/users/register', data);
    return response.data;
  },

  updateUser: async (userId: string, data: any) => {
    // user-service exposes profile update at /users/profile/:id
    const response = await api.put(`/users/profile/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    // user-service exposes delete (soft-delete) at /users/profile/:id
    const response = await api.delete(`/users/profile/${userId}`);
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

  // List ALL transactions (public endpoint proxied by BFF)
  listAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/transactions', { params });
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
  const user = apiResponse.user || apiResponse;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    age: user.age,
    isActive: user.isActive ?? true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: {
      monthlyIncome: user.profile?.monthly_income ?? user.profile?.monthlyIncome ?? 0,
      financialGoals: user.profile?.financial_goals ?? user.profile?.financialGoals ?? '',
      spendingLimit: user.profile?.spending_limit ?? user.profile?.spendingLimit ?? 0,
    },
  };
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Erro ao processar requisição';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erro desconhecido';
}
