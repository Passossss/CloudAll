import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  currentPage: string;
  navigateTo: (page: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  initialPage?: string;
}

export function NavigationProvider({ children, initialPage = 'dashboard' }: NavigationProviderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };

  const value = {
    currentPage,
    navigateTo,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

