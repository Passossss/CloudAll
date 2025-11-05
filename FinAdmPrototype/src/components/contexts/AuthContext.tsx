import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../../services/authService';
import { STORAGE_KEYS } from '../../services/config';
import type { User } from '../../services/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        const hasToken = authService.isAuthenticated();
        
        if (storedUser && hasToken) {
          console.log('[AuthContext] Usuário encontrado no localStorage:', storedUser.email);
          setUser(storedUser);
          
          // Tentar atualizar os dados do servidor (apenas se tiver token válido)
          try {
            const freshUser = await authService.getCurrentUserProfile();
            console.log('[AuthContext] Perfil atualizado do servidor');
            setUser(freshUser);
          } catch (error) {
            console.warn('[AuthContext] Não foi possível atualizar perfil do servidor, usando localStorage');
            // Se falhar ao buscar do servidor, manter usuário do localStorage
            // Isso evita deslogar usuários desnecessariamente quando o backend está offline
          }
        } else {
          console.log('[AuthContext] Nenhum usuário autenticado encontrado');
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao carregar usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Iniciando login para:', email);
      const response = await authService.login({ email, password });
      console.log('[AuthContext] Login bem-sucedido. Role:', response.user.role);
      setUser(response.user);
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Iniciando logout');
      await authService.logout();
      console.log('[AuthContext] Logout concluído');
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = await authService.updateProfile(user.id, updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isAdmin: user?.role === 'admin',
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};