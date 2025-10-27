import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner@2.0.3";
import { Plus, Edit, Trash2, Pin, Home, Users, Tag, DollarSign, BarChart3, CreditCard, UserCog, Menu, Settings, FileText } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  isPinned: boolean;
  isVisible: boolean;
  order: number;
  adminOnly: boolean;
}

const availableIcons = [
  { value: "Home", label: "Home", icon: Home },
  { value: "Users", label: "Usuários", icon: Users },
  { value: "Tag", label: "Tag", icon: Tag },
  { value: "DollarSign", label: "Dinheiro", icon: DollarSign },
  { value: "BarChart3", label: "Gráfico", icon: BarChart3 },
  { value: "CreditCard", label: "Cartão", icon: CreditCard },
  { value: "UserCog", label: "Gerenciar Usuários", icon: UserCog },
  { value: "Menu", label: "Menu", icon: Menu },
  { value: "Settings", label: "Configurações", icon: Settings },
  { value: "FileText", label: "Relatório", icon: FileText },
];

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      label: "Dashboard",
      icon: "Home",
      route: "dashboard",
      isPinned: true,
      isVisible: true,
      order: 1,
      adminOnly: false
    },
    {
      id: "2",
      label: "Transações",
      icon: "DollarSign",
      route: "transactions",
      isPinned: true,
      isVisible: true,
      order: 2,
      adminOnly: false
    },
    {
      id: "3",
      label: "Categorias",
      icon: "Tag",
      route: "categories",
      isPinned: true,
      isVisible: true,
      order: 3,
      adminOnly: false
    },
    {
      id: "4",
      label: "Cadastro de Usuário",
      icon: "Users",
      route: "users",
      isPinned: false,
      isVisible: true,
      order: 4,
      adminOnly: true
    },
    {
      id: "5",
      label: "Gerenciar Usuários",
      icon: "UserCog",
      route: "user-management",
      isPinned: false,
      isVisible: true,
      order: 5,
      adminOnly: true
    },
    {
      id: "6",
      label: "Gerenciar Menus",
      icon: "Menu",
      route: "menu-management",
      isPinned: false,
      isVisible: true,
      order: 6,
      adminOnly: true
    },
    {
      id: "7",
      label: "Relatórios",
      icon: "BarChart3",
      route: "reports",
      isPinned: false,
      isVisible: true,
      order: 7,
      adminOnly: false
    },
    {
      id: "8",
      label: "Cartões",
      icon: "CreditCard",
      route: "cards",
      isPinned: false,
      isVisible: true,
      order: 8,
      adminOnly: false
    }
  ]);

  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    label: "",
    icon: "",
    route: "",
    isPinned: false,
    isVisible: true,
    adminOnly: false
  });

  const resetForm = () => {
    setFormData({
      label: "",
      icon: "",
      route: "",
      isPinned: false,
      isVisible: true,
      adminOnly: false
    });
  };

  const handleEdit = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setFormData({
      label: menuItem.label,
      icon: menuItem.icon,
      route: menuItem.route,
      isPinned: menuItem.isPinned,
      isVisible: menuItem.isVisible,
      adminOnly: menuItem.adminOnly
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveMenuItem = () => {
    if (selectedMenuItem) {
      // Editar item existente
      setMenuItems(prev => prev.map(item => 
        item.id === selectedMenuItem.id 
          ? { ...item, ...formData }
          : item
      ));
      toast.success("Menu atualizado com sucesso!");
    } else {
      // Criar novo item
      const newMenuItem: MenuItem = {
        id: String(menuItems.length + 1),
        ...formData,
        order: menuItems.length + 1
      };
      setMenuItems(prev => [...prev, newMenuItem]);
      toast.success("Menu criado com sucesso!");
    }
    
    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
    setSelectedMenuItem(null);
    resetForm();
  };

  const handleDelete = (menuId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== menuId));
    toast.success("Menu removido com sucesso!");
  };

  const togglePin = (menuId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === menuId 
        ? { ...item, isPinned: !item.isPinned }
        : item
    ));
    toast.success("Status do pin atualizado!");
  };

  const toggleVisibility = (menuId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === menuId 
        ? { ...item, isVisible: !item.isVisible }
        : item
    ));
    toast.success("Visibilidade atualizada!");
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getIconComponent = (iconName: string) => {
    const iconItem = availableIcons.find(item => item.value === iconName);
    return iconItem ? iconItem.icon : Menu;
  };

  const MenuForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="label">Nome do Menu</Label>
          <Input
            id="label"
            value={formData.label}
            onChange={(e) => handleChange("label", e.target.value)}
            placeholder="Digite o nome do menu"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="route">Rota</Label>
          <Input
            id="route"
            value={formData.route}
            onChange={(e) => handleChange("route", e.target.value)}
            placeholder="Ex: dashboard, users, etc."
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Ícone</Label>
        <Select value={formData.icon} onValueChange={(value) => handleChange("icon", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um ícone" />
          </SelectTrigger>
          <SelectContent>
            {availableIcons.map((iconItem) => {
              const IconComponent = iconItem.icon;
              return (
                <SelectItem key={iconItem.value} value={iconItem.value}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {iconItem.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isPinned"
            checked={formData.isPinned}
            onCheckedChange={(checked) => handleChange("isPinned", checked)}
          />
          <Label htmlFor="isPinned">Fixado</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isVisible"
            checked={formData.isVisible}
            onCheckedChange={(checked) => handleChange("isVisible", checked)}
          />
          <Label htmlFor="isVisible">Visível</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="adminOnly"
            checked={formData.adminOnly}
            onCheckedChange={(checked) => handleChange("adminOnly", checked)}
          />
          <Label htmlFor="adminOnly">Apenas Admin</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gerenciar Menus</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure os menus do sistema Fin</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Menu</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo item de menu
              </DialogDescription>
            </DialogHeader>
            <MenuForm />
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveMenuItem} className="bg-primary hover:bg-primary/90">
                Criar Menu
              </Button>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Menus</CardTitle>
          <CardDescription>
            {menuItems.length} itens de menu configurados
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.sort((a, b) => a.order - b.order).map((item) => {
                const IconComponent = getIconComponent(item.icon);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <IconComponent className="h-5 w-5" />
                    </TableCell>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell className="font-mono text-sm">{item.route}</TableCell>
                    <TableCell>
                      <Badge variant={item.isVisible ? "default" : "secondary"}>
                        {item.isVisible ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.isPinned ? (
                          <Pin className="h-4 w-4 text-primary" />
                        ) : (
                          <Pin className="h-4 w-4 text-gray-300" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePin(item.id)}
                          className="h-6 px-2"
                        >
                          {item.isPinned ? "Desafixar" : "Fixar"}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(item.id)}
                        className="h-6 px-2"
                      >
                        {item.isVisible ? "Ocultar" : "Mostrar"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.adminOnly ? "destructive" : "outline"}>
                        {item.adminOnly ? "Admin" : "Todos"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.order}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Menu</DialogTitle>
            <DialogDescription>
              Modifique os dados do item de menu
            </DialogDescription>
          </DialogHeader>
          <MenuForm />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveMenuItem} className="bg-primary hover:bg-primary/90">
              Salvar Alterações
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}