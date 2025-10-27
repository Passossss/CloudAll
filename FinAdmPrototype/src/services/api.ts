const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = localStorage.getItem('authToken');

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro na requisição' };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Erro de conexão com o servidor' };
    }
  }

  // User Service Methods
  async getAllUsers() {
    return this.request('/users');
  }

  async getUserById(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async loginUser(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    age?: number;
    role?: 'normal' | 'admin';
  }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, updates: any) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Transaction Service Methods
  async getAllTransactions() {
    return this.request('/transactions');
  }

  async getTransactionsByUser(userId: string) {
    return this.request(`/transactions/user/${userId}`);
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
  }) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(transactionId: string, updates: any) {
    return this.request(`/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTransaction(transactionId: string) {
    return this.request(`/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  }

  async getTransactionSummary(userId: string) {
    return this.request(`/transactions/user/${userId}/summary`);
  }

  async getGlobalSummary() {
    return this.request('/transactions/summary/global');
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
