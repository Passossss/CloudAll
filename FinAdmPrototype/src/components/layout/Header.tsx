import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Sun, Moon, Bell, Search, Settings, LogIn, UserPlus, KeyRound, LogOut, Shield, Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import finLogo from 'figma:asset/ab96a01ccc3918ccf1ac13bd8ea1ce61846a04bc.png';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  onPageChange?: (page: string) => void;
}

export function Header({ onToggleSidebar, isSidebarCollapsed, onPageChange }: HeaderProps) {
  const { theme, setTheme, actualTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search logic here
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-primary/20 z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white p-1 shadow-sm border border-primary/20">
              <img src={finLogo} alt="Fin" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xl text-foreground">Fin</span>
              <span className="text-xs text-primary font-medium tracking-wide">ADMIN PANEL</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            {actualTheme === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 rounded-full relative hover:bg-primary/10"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
          </Button>

          {/* Admin Indicator */}
          {isAdmin && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/30">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">ADMIN</span>
            </div>
          )}

          {/* Expandable Search */}
          <div className="flex items-center">
            {isSearchExpanded ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar transações..."
                  className="w-64 border-primary/20 focus:border-primary"
                  autoFocus
                  onBlur={() => {
                    if (!searchQuery) {
                      setIsSearchExpanded(false);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSearchExpanded(false);
                    setSearchQuery('');
                  }}
                  className="text-muted-foreground"
                >
                  ✕
                </Button>
              </form>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsSearchExpanded(true)}
                className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90"
              >
                <Search className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* User Avatar & Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <div className="flex flex-col space-y-2 p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <p className="font-medium">{user?.name || 'Usuário'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                {isAdmin && (
                  <Badge className="w-fit bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 shadow-md">
                    <Shield className="w-3 h-3 mr-1" />
                    Administrador
                  </Badge>
                )}
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => onPageChange?.('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <LogIn className="mr-2 h-4 w-4" />
                <span>Login</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Criar Conta</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Esqueceu a Senha</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}