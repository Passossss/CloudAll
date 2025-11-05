import { useState } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ChevronLeft, ChevronRight, GripVertical, Pin, PinOff, Shield } from 'lucide-react';
import { Home, DollarSign, Tag, Users, BarChart3, CreditCard, UserCog, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../ui/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  adminOnly?: boolean;
  pinned: boolean;
}

interface FinSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function FinSidebar({ currentPage, onPageChange, isCollapsed, onToggleCollapse }: FinSidebarProps) {
  const { isAdmin } = useAuth();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard', pinned: true },
    { id: 'transactions', label: 'Transações', icon: DollarSign, href: '/transactions', pinned: true },
    { id: 'users', label: 'Cadastro de Usuário', icon: Users, href: '/users', pinned: false },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, href: '/reports', pinned: false },
    { id: 'cards', label: 'Cartões', icon: CreditCard, href: '/cards', pinned: false },
    { id: 'user-management', label: 'Gerenciar Usuários', icon: UserCog, href: '/user-management', adminOnly: true, pinned: false },
    { id: 'menu-management', label: 'Gerenciar Menus', icon: Menu, href: '/menu-management', adminOnly: true, pinned: false },
  ]);

  const togglePin = (itemId: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, pinned: !item.pinned } : item
      )
    );
  };

  const visibleItems = menuItems.filter(item => !item.adminOnly || isAdmin);
  const pinnedItems = visibleItems.filter(item => item.pinned);
  const unpinnedItems = visibleItems.filter(item => !item.pinned);

  const SidebarMenuItem = ({ item }: { item: MenuItem }) => {
    const Icon = item.icon;
    const isActive = currentPage === item.id;
    const isAdminItem = item.adminOnly;
    
    return (
      <div className={cn(
        "group relative flex items-center",
        isAdminItem && "bg-gradient-to-r from-primary/10 to-accent/5 rounded-lg mx-1 border border-primary/20"
      )}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10 px-3",
            isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
            !isActive && !isAdminItem && "hover:bg-accent",
            !isActive && isAdminItem && "hover:bg-primary/20 text-primary",
            isCollapsed && "px-2 justify-center"
          )}
          onClick={() => onPageChange(item.id)}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left flex items-center gap-2">
                {item.label}
                {isAdminItem && <Shield className="w-3 h-3 text-primary" />}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                  className={cn(
                    "h-6 w-6 p-0 cursor-pointer flex items-center justify-center rounded hover:bg-transparent",
                    isAdminItem && "text-primary hover:text-primary/80"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(item.id);
                  }}
                >
                  {item.pinned ? (
                    <PinOff className="w-3 h-3" />
                  ) : (
                    <Pin className="w-3 h-3" />
                  )}
                </div>
                <GripVertical className={cn(
                  "w-3 h-3",
                  isAdminItem ? "text-primary/60" : "text-muted-foreground"
                )} />
              </div>
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-primary/5 to-sidebar border-r border-primary/20 transition-all duration-300 z-40",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-end p-2 border-b border-primary/20 bg-primary/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-8 h-8 p-0 text-primary hover:text-primary/80 hover:bg-primary/20"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {/* Pinned Items */}
            {pinnedItems.length > 0 && (
              <>
                {!isCollapsed && (
                  <div className="px-3 py-2">
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                      <Pin className="w-3 h-3" />
                      PINNED
                    </h4>
                  </div>
                )}
                {pinnedItems.map((item) => (
                  <SidebarMenuItem key={item.id} item={item} />
                ))}
              </>
            )}

            {/* Separator */}
            {pinnedItems.length > 0 && unpinnedItems.length > 0 && (
              <div className="py-2">
                <Separator />
              </div>
            )}

            {/* Unpinned Items */}
            {unpinnedItems.length > 0 && (
              <>
                {!isCollapsed && (
                  <div className="px-3 py-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      NOT USED
                    </h4>
                  </div>
                )}
                {unpinnedItems.map((item) => (
                  <SidebarMenuItem key={item.id} item={item} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}