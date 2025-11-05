import { useState } from 'react';
import { ThemeProvider } from './components/contexts/ThemeContext';
import { AuthProvider, useAuth } from './components/contexts/AuthContext';
import { FinLayout } from './components/layout/FinLayout';
import { Login } from './components/pages/Login';
import { FinDashboard } from './components/pages/FinDashboard';
import { Transactions } from './components/pages/Transactions';
import { UserRegistration } from './components/pages/UserRegistration';
import { UserManagement } from './components/UserManagement';
import { MenuManagement } from './components/MenuManagement';
import { Settings } from './components/pages/Settings';
import { ComingSoon } from './components/pages/ComingSoon';
import { Toaster } from './components/ui/sonner';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';

function AppContent() {
  const { isAuthenticated, isAdmin, loading, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  console.log('[App] Estado:', { 
    isAuthenticated, 
    isAdmin, 
    loading, 
    userRole: user?.role,
    userEmail: user?.email 
  });

  // Mostrar login se não estiver autenticado
  if (!loading && !isAuthenticated) {
    console.log('[App] Mostrando tela de login');
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
    console.log('[App] Usuário autenticado mas não é admin - bloqueando acesso');
    
    const handleLogout = async () => {
      try {
        console.log('[App] Usuário solicitou trocar de conta');
        await logout();
        // Não fazer reload - o AuthProvider já vai redirecionar para login
      } catch (error) {
        console.error('[App] Erro ao fazer logout:', error);
      }
    };

    const handleGoToFinApp = () => {
      console.log('[App] Redirecionando para FinApp');
      // Redirecionar para o FinApp (usuário comum) na porta 5173
      window.location.href = 'http://localhost:5173';
    };

    const handleLogin = async () => {
      try {
        console.log('[App] Redirecionando para login');
        await logout();
        // Após logout, o componente vai renderizar a tela de login automaticamente
      } catch (error) {
        console.error('[App] Erro ao fazer logout:', error);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-10 h-10 text-red-600 dark:text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-foreground">Área Administrativa</h2>
              
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Esta área é exclusiva para <span className="font-semibold text-foreground">administradores</span>.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Você é um <strong>usuário comum</strong>. Acesse o <strong>FinApp</strong> para gerenciar suas finanças pessoais!
                  </p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  onClick={handleGoToFinApp} 
                  className="w-full font-bold text-base"
                  style={{ backgroundColor: '#f97316', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
                >
                  Ir para FinApp
                </Button>

                <Button 
                  onClick={handleLogin} 
                  className="w-full font-bold text-base"
                  style={{ backgroundColor: '#3b82f6', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  Entrar como Admin
                </Button>

                <Button 
                  onClick={handleLogout} 
                  variant="outline"
                  className="w-full font-bold text-base"
                >
                  Trocar de Conta
                </Button>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Entre em contato com um administrador caso precise de privilégios administrativos.
                </p>
              </div>
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