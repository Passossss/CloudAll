import { useState } from 'react';
import { ThemeProvider } from './components/contexts/ThemeContext';
import { AuthProvider } from './components/contexts/AuthContext';
import { FinLayout } from './components/layout/FinLayout';
import { FinDashboard } from './components/pages/FinDashboard';
import { Transactions } from './components/pages/Transactions';
import { Categories } from './components/pages/Categories';
import { UserManagement } from './components/UserManagement';
import { MenuManagement } from './components/MenuManagement';
import { Settings } from './components/pages/Settings';
import { ComingSoon } from './components/pages/ComingSoon';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <FinDashboard />;
      case 'transactions':
        return <Transactions />;
      case 'categories':
        return <Categories />;
      case 'users':
        return <ComingSoon title="Cadastro de Usuário" description="Em breve você poderá gerenciar o cadastro de novos usuários." onGoBack={() => setCurrentPage('dashboard')} />;
      case 'reports':
        return <ComingSoon title="Relatórios" description="Relatórios detalhados das suas finanças estarão disponíveis em breve." onGoBack={() => setCurrentPage('dashboard')} />;
      case 'cards':
        return <ComingSoon title="Cartões" description="Gerencie seus cartões de crédito e débito em breve." onGoBack={() => setCurrentPage('dashboard')} />;
      case 'user-management':
        return <UserManagement />;
      case 'menu-management':
        return <MenuManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <FinDashboard />;
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="fin-theme">
      <AuthProvider>
        <FinLayout currentPage={currentPage} onPageChange={setCurrentPage}>
          {renderPage()}
        </FinLayout>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}