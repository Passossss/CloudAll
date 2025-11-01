import { useState } from 'react';
import { ThemeProvider } from './components/contexts/ThemeContext';
import { AuthProvider, useAuth } from './components/contexts/AuthContext';
import { FinLayout } from './components/layout/FinLayout';
import { Login } from './components/pages/Login';
import { FinDashboard } from './components/pages/FinDashboard';
import { Transactions } from './components/pages/Transactions';
import { Categories } from './components/pages/Categories';
import { UserRegistration } from './components/pages/UserRegistration';
import { UserManagement } from './components/UserManagement';
import { MenuManagement } from './components/MenuManagement';
import { Settings } from './components/pages/Settings';
import { ComingSoon } from './components/pages/ComingSoon';
import { Toaster } from './components/ui/sonner';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';

function AppContent() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Mostrar login se não estiver autenticado
  if (!loading && !isAuthenticated) {
    return <Login onSuccess={() => {}} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se estiver autenticado mas não for admin, bloquear acesso
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground mb-4">
                Apenas administradores podem acessar o FinAdm.
              </p>
              <Button onClick={() => window.location.reload()}>
                Fazer Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <FinDashboard onPageChange={setCurrentPage} />;
      case 'transactions':
        return <Transactions />;
      case 'categories':
        return <Categories />;
      case 'users':
        return <UserRegistration />;
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
    <FinLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </FinLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="fin-theme">
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}