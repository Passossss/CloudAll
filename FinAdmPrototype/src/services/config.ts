/**
 * Configurações centralizadas da aplicação
 */

// Feature Flags
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || false;

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'fin_access_token',
  REFRESH_TOKEN: 'fin_refresh_token',
  USER: 'fin_user',
  THEME: 'fin_theme',
  SETTINGS: 'fin_settings',
} as const;

// Error Codes
export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Date Formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
} as const;

// Currency
export const DEFAULT_CURRENCY = 'BRL';

// Mock Delay (para simular latência de rede)
export const MOCK_DELAY = 500;
