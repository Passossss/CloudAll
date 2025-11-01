import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services';
import type { UserSettings } from '../services/types';
import { useAuth } from '../components/contexts/AuthContext';

// ============================================
// Types
// ============================================

export interface UseSettingsResult {
  settings: UserSettings | null;
  loading: boolean;
  error: Error | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<UserSettings>;
  updateTheme: (theme: 'light' | 'dark' | 'auto') => Promise<void>;
  updateNotifications: (notifications: UserSettings['notifications']) => Promise<void>;
  updatePrivacy: (privacy: UserSettings['privacy']) => Promise<void>;
  resetToDefaults: () => Promise<UserSettings>;
  exportUserData: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

export function useSettings(): UseSettingsResult {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const settingsData = await settingsService.getSettings();
      setSettings(settingsData);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar configurações:', err);
      
      // Tentar carregar do localStorage se falhar
      const localSettings = settingsService.getLocalSettings();
      if (localSettings) {
        setSettings(localSettings);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user) throw new Error('Usuário não autenticado');

    const updatedSettings = await settingsService.updateSettings(updates);
    setSettings(updatedSettings);

    return updatedSettings;
  }, [user]);

  const updateTheme = useCallback(async (theme: 'light' | 'dark' | 'auto') => {
    if (!user) throw new Error('Usuário não autenticado');

    await settingsService.updateTheme(theme);

    // Atualizar estado local
    if (settings) {
      setSettings({ ...settings, theme });
    }
  }, [user, settings]);

  const updateNotifications = useCallback(async (notifications: UserSettings['notifications']) => {
    if (!user) throw new Error('Usuário não autenticado');

    await settingsService.updateNotifications(notifications);

    // Atualizar estado local
    if (settings) {
      setSettings({ ...settings, notifications });
    }
  }, [user, settings]);

  const updatePrivacy = useCallback(async (privacy: UserSettings['privacy']) => {
    if (!user) throw new Error('Usuário não autenticado');

    await settingsService.updatePrivacy(privacy);

    // Atualizar estado local
    if (settings) {
      setSettings({ ...settings, privacy });
    }
  }, [user, settings]);

  const resetToDefaults = useCallback(async () => {
    if (!user) throw new Error('Usuário não autenticado');

    const defaultSettings = await settingsService.resetToDefaults();
    setSettings(defaultSettings);

    return defaultSettings;
  }, [user]);

  const exportUserData = useCallback(async () => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const blob = await settingsService.exportUserData();
      
      // Criar URL temporário e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meus_dados_${user.email}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar dados do usuário:', err);
      throw err;
    }
  }, [user]);

  const deleteAccount = useCallback(async (password: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    await settingsService.deleteAccount(password);

    // Limpar estado local
    setSettings(null);
  }, [user]);

  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    updateTheme,
    updateNotifications,
    updatePrivacy,
    resetToDefaults,
    exportUserData,
    deleteAccount,
    refreshSettings,
  };
}
