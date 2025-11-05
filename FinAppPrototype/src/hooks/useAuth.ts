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
          // Se o backend não estiver disponível, usa os dados do localStorage
          try {
            const freshUser = await userApi.getProfile(userData.id);
            setAuthState({
              user: normalizeUserProfile(freshUser),
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (apiError) {
            // Se falhar a requisição (backend offline), usa dados do localStorage
            // Mas marca como não autenticado para forçar novo login quando backend voltar
            console.warn('Backend não disponível, usando dados locais temporariamente:', apiError);
            // userData já está normalizado (foi salvo após login bem-sucedido)
            // Mas vamos garantir que está no formato correto
            try {
              const normalizedUser = userData.id ? userData : normalizeUserProfile({ user: userData });
              setAuthState({
                user: normalizedUser,
                token,
                isAuthenticated: false, // Força login quando backend voltar
                isLoading: false,
              });
            } catch (normalizeError) {
              console.error('Erro ao normalizar dados do localStorage:', normalizeError);
              // Se mesmo assim der erro, limpa tudo e força login
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              setAuthState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          }
        } catch (error) {
          // Erro ao parsear ou normalizar dados
          console.error('Erro ao inicializar auth:', error);
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
      
      if (!user || !token) {
        throw new Error('Resposta inválida do servidor: usuário ou token não encontrado');
      }
      
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
    } catch (error: any) {
      const message = error.message || getErrorMessage(error);
      console.error('Erro no login:', error);
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
      
      if (!user || !token) {
        throw new Error('Resposta inválida do servidor: usuário ou token não encontrado');
      }
      
      const normalizedUser = normalizeUserProfile({ user });
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(normalizedUser));
      
      setAuthState({
        user: normalizedUser,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success(`Conta criada com sucesso! Bem-vindo, ${normalizedUser.name}!`);
      return normalizedUser;
    } catch (error: any) {
      const message = error.message || getErrorMessage(error);
      console.error('Erro no registro:', error);
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
