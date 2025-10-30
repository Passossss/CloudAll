import { useState, useEffect } from 'react';
import { authApi, userApi, normalizeUserProfile, getErrorMessage, User } from '../services/api';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userDataStr = localStorage.getItem('userData');

      if (token && userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          // Verify token is still valid by fetching fresh user data
          const freshUser = await userApi.getProfile(userData.id);
          setAuthState({
            user: normalizeUserProfile(freshUser),
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();

    // Listen for logout events
    const handleLogout = () => {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const { user, token } = response;
      
      const normalizedUser = normalizeUserProfile({ user });
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(normalizedUser));
      
      setAuthState({
        user: normalizedUser,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success(`Bem-vindo, ${normalizedUser.name}!`);
      return normalizedUser;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    age?: number;
  }) => {
    try {
      const response = await authApi.register(data);
      const { user, token } = response;
      
      const normalizedUser = normalizeUserProfile({ user });
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(normalizedUser));
      
      setAuthState({
        user: normalizedUser,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Conta criada com sucesso!');
      return normalizedUser;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.info('Você saiu da sua conta');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!authState.user) return;

    try {
      const response = await userApi.updateProfile(authState.user.id, updates);
      const updatedUser = normalizeUserProfile(response);
      
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      toast.success('Perfil atualizado com sucesso!');
      return updatedUser;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
  };
}
