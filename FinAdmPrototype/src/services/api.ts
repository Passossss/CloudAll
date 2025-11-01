import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Base URL da API - configurável via variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Instância do axios configurada
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação em todas as requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('fin_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401, limpar token e redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('fin_auth_token');
      localStorage.removeItem('fin_user');
      window.location.href = '/login';
    }
    
    // Log de erro para debugging (remover em produção)
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
