import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { UserRegistration } from "./components/UserRegistration";
import { UserManagement } from "./components/UserManagement";
import { MenuManagement } from "./components/MenuManagement";
import { CategoryRegistration } from "./components/CategoryRegistration";
import { TransactionRegistration } from "./components/TransactionRegistration";
import { Reports } from "./components/Reports";
import { Cards } from "./components/Cards";
import { Settings } from "./components/Settings";
import { Login } from "./components/Login";
import { CreateAccount } from "./components/CreateAccount";
import { ForgotPassword } from "./components/ForgotPassword";
import { Toaster } from "./components/ui/sonner";
import { UserProvider } from "./contexts/UserContext";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isDark, setIsDark] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

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
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <UserRegistration />;
      case "user-management":
        return <UserManagement />;
      case "menu-management":
        return <MenuManagement />;
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
        return <Dashboard />;
    }
  };

  // Se for uma página de autenticação, renderiza em tela cheia
  if (['login', 'create-account', 'forgot-password'].includes(currentPage)) {
    return (
      <UserProvider>
        <div className="min-h-screen">
          {renderPage()}
          <Toaster />
        </div>
      </UserProvider>
    );
  }

  return (
    <UserProvider>
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
    </UserProvider>
  );
}