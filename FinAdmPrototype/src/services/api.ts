import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, STORAGE_KEYS, USE_MOCKS, HTTP_STATUS } from './config';
import type { ApiErrorResponse } from './types';

// ============================================
// API Client Configuration
// ============================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Criar instância do axios
export const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Request Interceptor
// ============================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Adicionar token de acesso em todas as requisições
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log em desenvolvimento
    if (import.meta.env.DEV && !USE_MOCKS) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log em desenvolvimento
    if (import.meta.env.DEV && !USE_MOCKS) {
      console.log(`[API] Response from ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log de erro em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('[API] Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Tratamento de erro 401 - Token expirado
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está refreshing, adiciona à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        // Sem refresh token, redirecionar para login
        handleAuthFailure();
        return Promise.reject(error);
      }

      try {
        // Tentar renovar o token
        const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Salvar novos tokens
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        if (newRefreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        // Processar fila de requisições pendentes
        processQueue(null, accessToken);

        // Retentar requisição original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Falha ao renovar token, redirecionar para login
        processQueue(refreshError as Error, null);
        handleAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Tratamento de erro 403 - Sem permissão
    if (error.response?.status === HTTP_STATUS.FORBIDDEN) {
      // Você pode exibir uma mensagem de erro ou redirecionar
      console.error('Acesso negado: você não tem permissão para acessar este recurso');
    }

    // Retornar erro formatado
    return Promise.reject(formatError(error));
  }
);

// ============================================
// Helper Functions
// ============================================

/**
 * Formata erro da API para um formato consistente
 */
function formatError(error: AxiosError<ApiErrorResponse>): Error {
  if (error.response?.data?.error) {
    const apiError = error.response.data.error;
    const err = new Error(apiError.message);
    (err as any).code = apiError.code;
    (err as any).details = apiError.details;
    (err as any).fields = apiError.fields;
    (err as any).status = error.response.status;
    return err;
  }

  if (error.code === 'ECONNABORTED') {
    const err = new Error('Tempo de espera excedido. Verifique sua conexão.');
    (err as any).code = 'TIMEOUT';
    return err;
  }

  if (!error.response) {
    const err = new Error('Erro de rede. Verifique sua conexão com a internet.');
    (err as any).code = 'NETWORK_ERROR';
    return err;
  }

  return new Error(error.message || 'Erro desconhecido');
}

/**
 * Limpa dados de autenticação e redireciona para login
 */
function handleAuthFailure(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  
  // Redirecionar apenas se não estiver na página de login
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

// ============================================
// Mock Helper (para desenvolvimento)
// ============================================

/**
 * Simula delay de rede para mocks
 */
export const mockDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Wrapper para usar mock ou API real baseado na feature flag
 */
export async function apiOrMock<T>(
  apiCall: () => Promise<T>,
  mockCall: () => Promise<T>
): Promise<T> {
  if (USE_MOCKS) {
    console.log('[MOCK] Using mock data');
    return mockCall();
  }
  return apiCall();
}

export default api;
