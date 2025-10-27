import { ReactNode } from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Home, Users, Shield, Menu, BarChart3, Settings, CreditCard, FileText } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Usuários', id: 'users' },
  { icon: Shield, label: 'Permissões', id: 'permissions' },
  { icon: Menu, label: 'Gerenciar Menus', id: 'menus' },
  { icon: BarChart3, label: 'Estatísticas', id: 'stats' },
  { icon: FileText, label: 'Relatórios', id: 'reports' },
  { icon: CreditCard, label: 'Cartões', id: 'cards' },
  { icon: Settings, label: 'Configurações', id: 'settings' },
];

export function AdminLayout({ children, currentPage, onPageChange }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <Sidebar className="border-r border-gray-200">
          <SidebarContent className="bg-white">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">🦊</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">FinAdmin</span>
              </div>
            </div>
            
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gray-100 ${currentPage === item.id ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500' : 'text-gray-700'}`}
                      >
                        <button 
                          className="flex items-center gap-3 px-4 py-3 w-full text-left"
                          onClick={() => onPageChange(item.id)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center gap-4 ml-auto">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  🌙
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  🔔
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">A</span>
                  </div>
                  <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm">Administrador</span>
                </div>
              </div>
            </div>
          </header>
          
          <div className="p-6">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}