import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiService } from '../services/api';

export type UserType = 'normal' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserType;
}

interface UserContextType {
  user: User | null;
  userType: UserType;
  setUserType: (type: UserType) => void;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>('normal');
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Try to restore user object from localStorage (persisted at login)
      const stored = localStorage.getItem('authUser');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setUserType((parsed.role as UserType) || 'normal');
        } catch {
          setUser(null);
          setUserType('normal');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiService.loginUser(credentials);
      if (response.data) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
        setUser({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role as UserType || 'normal'
        });
        setUserType(response.data.user.role as UserType || 'normal');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setUserType('normal');
  };

  return (
    <UserContext.Provider value={{
      user,
      userType,
      setUserType,
      isAdmin: userType === 'admin',
      login,
      logout,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}