import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Home, DollarSign, Tags, Users, BarChart3, CreditCard, Settings, Menu, Edit, Trash2, Plus } from 'lucide-react';

interface MenuItem {
  id: number;
  icon: string;
  name: string;
  route: string;
  status: 'ativo' | 'fixado' | 'ocultar';
  order: number;
  permissions: {
    admin: boolean;
    user: boolean;
    guest: boolean;
  };
  visibleTo: 'Todos' | 'Admin' | 'Usuário';
  access: 'Todos' | 'Admin';
}

const iconMap = {
  Home,
  DollarSign,
  Tags,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  Menu
};

const initialMenuItems: MenuItem[] = [
  {
    id: 1,
    icon: 'Home',
    name: 'Dashboard',
    route: 'dashboard',
    status: 'ativo',
    order: 1,
    permissions: { admin: true, user: true, guest: true },
    visibleTo: 'Todos',
    access: 'Todos'
  },
  {
    id: 2,
    icon: 'DollarSign',
    name: 'Transações',
    route: 'transactions',
    status: 'ativo',
    order: 2,
    permissions: { admin: true, user: true, guest: false },
    visibleTo: 'Todos',
    access: 'Todos'
  },
  {
    id: 3,
    icon: 'Tags',
    name: 'Categorias',
    route: 'categories',
    status: 'ativo',
    order: 3,
    permissions: { admin: true, user: true, guest: false },
    visibleTo: 'Todos',
    access: 'Todos'
  },
  {
    id: 4,
    icon: 'Users',
    name: 'Cadastro de Usuário',
    route: 'users',
    status: 'fixado',
    order: 4,
    permissions: { admin: true, user: false, guest: false },
    visibleTo: 'Admin',
    access: 'Admin'
  },
  {
    id: 5,
    icon: 'Users',
    name: 'Gerenciar Usuários',
    route: 'user-management',
    status: 'ativo',
    order: 5,
    permissions: { admin: true, user: false, guest: false },
    visibleTo: 'Admin',
    access: 'Admin'
  },
  {
    id: 6,
    icon: 'Menu',
    name: 'Gerenciar Menus',
    route: 'menu-management',
    status: 'ativo',
    order: 6,
    permissions: { admin: true, user: false, guest: false },
    visibleTo: 'Admin',
    access: 'Admin'
  },
  {
    id: 7,
    icon: 'BarChart3',
    name: 'Relatórios',
    route: 'reports',
    status: 'fixado',
    order: 7,
    permissions: { admin: true, user: true, guest: false },
    visibleTo: 'Todos',
    access: 'Todos'
  },
  {
    id: 8,
    icon: 'CreditCard',
    name: 'Cartões',
    route: 'cards',
    status: 'fixado',
    order: 8,
    permissions: { admin: true, user: true, guest: false },
    visibleTo: 'Todos',
    access: 'Todos'
  }
];

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { color: 'bg-green-100 text-green-700', label: 'Ativo' },
      fixado: { color: 'bg-blue-100 text-blue-700', label: 'Fixado' },
      ocultar: { color: 'bg-gray-100 text-gray-700', label: 'Ocultar' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} hover:${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  const getAccessBadge = (access: string) => {
    return access === 'Admin' ? (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Admin</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Todos</Badge>
    );
  };

  const MenuForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Menu</Label>
        <Input id="name" placeholder="Nome do menu" defaultValue={editingItem?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="route">Rota</Label>
        <Input id="route" placeholder="Ex: dashboard" defaultValue={editingItem?.route} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">Ícone</Label>
        <Select defaultValue={editingItem?.icon || 'Home'}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um ícone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="DollarSign">DollarSign</SelectItem>
            <SelectItem value="Tags">Tags</SelectItem>
            <SelectItem value="Users">Users</SelectItem>
            <SelectItem value="BarChart3">BarChart3</SelectItem>
            <SelectItem value="CreditCard">CreditCard</SelectItem>
            <SelectItem value="Settings">Settings</SelectItem>
            <SelectItem value="Menu">Menu</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select defaultValue={editingItem?.status || 'ativo'}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="fixado">Fixado</SelectItem>
            <SelectItem value="ocultar">Ocultar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="access">Acesso</Label>
        <Select defaultValue={editingItem?.access || 'Todos'}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o nível de acesso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-4">
        <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
          {editingItem ? 'Salvar Alterações' : 'Criar Menu'}
        </Button>
        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
          Cancelar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Menus</h1>
          <p className="text-gray-600">Configure os menus do sistema Fin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddItem} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Menu' : 'Novo Menu'}
              </DialogTitle>
            </DialogHeader>
            <MenuForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Lista de Menus</CardTitle>
          <p className="text-sm text-gray-600 mt-1">{menuItems.length} itens de menu configurados</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ícone</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fixado</TableHead>
                  <TableHead>Visível</TableHead>
                  <TableHead>Acesso</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => {
                  const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-gray-600" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-gray-600">{item.route}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Switch checked={item.status === 'fixado'} disabled />
                      </TableCell>
                      <TableCell className="text-gray-600">{item.visibleTo}</TableCell>
                      <TableCell>{getAccessBadge(item.access)}</TableCell>
                      <TableCell className="text-gray-600">{item.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix for Menus */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Permissões por Perfil</CardTitle>
          <p className="text-sm text-gray-600">Configure quais menus cada perfil pode acessar</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Menu</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Admin</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Usuário</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Convidado</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-center">
                      <Switch checked={item.permissions.admin} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Switch checked={item.permissions.user} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Switch checked={item.permissions.guest} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}