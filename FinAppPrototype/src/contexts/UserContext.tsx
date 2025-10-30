import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../services/api';

export type UserType = 'normal' | 'admin';

interface UserContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; name: string; age?: number }) => Promise<User>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<User | undefined>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  // Determine user type based on email or role (you can adjust this logic)
  // For now, we'll check if email contains 'admin' or has a specific role
  const userType: UserType = auth.user?.email?.includes('admin') ? 'admin' : 'normal';
  const isAdmin = userType === 'admin';

  return (
    <UserContext.Provider
      value={{
        ...auth,
        userType,
        isAdmin,
      }}
    >
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