import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { CategoryRegistration } from "./components/CategoryRegistration";
import { TransactionRegistration } from "./components/TransactionRegistration";
import { Reports } from "./components/Reports";
import { Cards } from "./components/Cards";
import { Settings } from "./components/Settings";
import { Login } from "./components/Login";
import { CreateAccount } from "./components/CreateAccount";
import { ForgotPassword } from "./components/ForgotPassword";
import { Toaster } from "./components/ui/sonner";
import { UserProvider, useUser } from "./contexts/UserContext";

function AppContent() {
  const { isAuthenticated, isLoading } = useUser();
  const [currentPage, setCurrentPage] = useState("login"); // Começar na página de login
  const [isDark, setIsDark] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Redirect to login if not authenticated (unless already on auth pages)
  useEffect(() => {
    try {
      if (!isLoading && !isAuthenticated && !['login', 'create-account', 'forgot-password'].includes(currentPage)) {
        setCurrentPage('login');
      } else if (isAuthenticated && ['login', 'create-account', 'forgot-password'].includes(currentPage)) {
        setCurrentPage('dashboard');
      }
    } catch (err) {
      console.error('Erro no useEffect de redirecionamento:', err);
      setError('Erro ao carregar aplicação');
      setCurrentPage('login');
    }
  }, [isAuthenticated, isLoading, currentPage]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const renderPage = () => {
    try {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onPageChange={setCurrentPage} />;
      case "categories":
        return <CategoryRegistration />;
      case "transactions":
        return <TransactionRegistration />;
      case "reports":
        return <Reports />;
      case "cards":
        return <Cards />;
      case "config":
        return <Settings />;
      case "login":
        return <Login onPageChange={setCurrentPage} />;
      case "create-account":
        return <CreateAccount onPageChange={setCurrentPage} />;
      case "forgot-password":
        return <ForgotPassword onPageChange={setCurrentPage} />;
      default:
          return <Login onPageChange={setCurrentPage} />;
      }
    } catch (err) {
      console.error('Erro ao renderizar página:', err);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar</h1>
            <p className="text-gray-600 mb-4">Ocorreu um erro ao carregar a aplicação.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se for uma página de autenticação, renderiza em tela cheia
  if (['login', 'create-account', 'forgot-password'].includes(currentPage)) {
    return (
        <div className="min-h-screen">
          {renderPage()}
          <Toaster />
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-800 transition-colors">
        <Header 
          isDark={isDark}
          onThemeToggle={toggleTheme}
          isSidebarCollapsed={isSidebarCollapsed}
          onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onPageChange={setCurrentPage}
        />
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          isCollapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
        />
        
        <main className={`${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pt-16 transition-all duration-300`}>
          <div className="p-6 min-h-screen bg-white dark:bg-gray-900 rounded-tl-3xl border-t-4 border-l-4 border-primary/20">
            <div className="max-w-7xl mx-auto">
              {renderPage()}
            </div>
          </div>
        </main>
        
        <Toaster />
      </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}