import api from './api';
import { STORAGE_KEYS } from './config';
import type { UserSettings } from './types';

// ============================================
// Settings Service
// ============================================

class SettingsService {
  /**
   * Obtém configurações do usuário
   * GET /settings
   */
  async getSettings(): Promise<UserSettings> {
    const response = await api.get<{ settings: UserSettings }>('/settings');
    
    // Salvar no localStorage para acesso offline
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(response.data.settings));
    
    return response.data.settings;
  }

  /**
   * Atualiza configurações do usuário
   * PUT /settings
   */
  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const response = await api.put<{ settings: UserSettings }>('/settings', updates);
    
    // Atualizar localStorage
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(response.data.settings));
    
    return response.data.settings;
  }

  /**
   * Atualiza tema do usuário
   * PUT /settings/theme
   */
  async updateTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    await api.put('/settings/theme', { theme });
    
    // Atualizar localStorage
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  /**
   * Atualiza preferências de notificações
   * PUT /settings/notifications
   */
  async updateNotifications(notifications: UserSettings['notifications']): Promise<void> {
    await api.put('/settings/notifications', { notifications });
  }

  /**
   * Atualiza preferências de privacidade
   * PUT /settings/privacy
   */
  async updatePrivacy(privacy: UserSettings['privacy']): Promise<void> {
    await api.put('/settings/privacy', { privacy });
  }

  /**
   * Reseta configurações para padrão
   * POST /settings/reset
   */
  async resetToDefaults(): Promise<UserSettings> {
    const response = await api.post<{ settings: UserSettings }>('/settings/reset');
    
    // Atualizar localStorage
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(response.data.settings));
    
    return response.data.settings;
  }

  /**
   * Exporta dados do usuário (GDPR)
   * GET /settings/export-data
   */
  async exportUserData(): Promise<Blob> {
    const response = await api.get('/settings/export-data', {
      responseType: 'blob',
    });
    
    return response.data;
  }

  /**
   * Solicita exclusão de conta
   * POST /settings/delete-account
   */
  async deleteAccount(password: string): Promise<void> {
    await api.post('/settings/delete-account', { password });
    
    // Limpar dados locais
    localStorage.clear();
  }

  // ============================================
  // Local Storage Helpers
  // ============================================

  /**
   * Obtém configurações armazenadas localmente
   */
  getLocalSettings(): UserSettings | null {
    const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!settingsStr) return null;
    
    try {
      return JSON.parse(settingsStr) as UserSettings;
    } catch (error) {
      console.error('Erro ao fazer parse das configurações:', error);
      return null;
    }
  }

  /**
   * Obtém tema armazenado localmente
   */
  getLocalTheme(): 'light' | 'dark' | 'auto' | null {
    return localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | 'auto' | null;
  }
}

export const settingsService = new SettingsService();
