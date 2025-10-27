import { useState, ReactNode } from 'react';
import { Header } from './Header';
import { FinSidebar } from './FinSidebar';
import { cn } from '../ui/utils';

interface FinLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function FinLayout({ children, currentPage, onPageChange }: FinLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        onPageChange={onPageChange}
      />

      {/* Sidebar */}
      <FinSidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content */}
      <main 
        className={cn(
          "pt-16 transition-all duration-300",
          isSidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="bg-gradient-to-br from-background to-primary/2 border-t-4 border-l-4 border-primary/30 rounded-tl-3xl min-h-[calc(100vh-4rem)] shadow-sm">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}