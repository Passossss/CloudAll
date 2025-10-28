import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Edit, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService, type User as ApiUser } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  occupation?: string;
  status?: 'ativo' | 'inativo';
  role: 'admin' | 'normal';
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    occupation: '',
    role: 'normal' as 'admin' | 'normal',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await apiService.getAllUsers();
      if (response.data) {
        setUsers(response.data as any);
      } else if (response.error) {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      console.error(error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    
    try {
      const response = await apiService.deleteUser(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Usuário deletado com sucesso!');
        setUsers(users.filter(user => user.id !== id));
      }
    } catch (error) {
      toast.error('Erro ao deletar usuário');
      console.error(error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      occupation: user.occupation || '',
      role: user.role || 'normal',
      status: user.status || 'ativo'
    });
    setIsDialogOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      occupation: '',
      role: 'normal',
      status: 'ativo'
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }

    setIsLoading(true);
    
    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          occupation: formData.occupation,
          role: formData.role
        };

        const response = await apiService.updateUser(editingUser.id, updateData);
        
        if (response.error) {
          toast.error(response.error);
        } else {
          toast.success('Usuário atualizado com sucesso!');
          setIsDialogOpen(false);
          loadUsers();
        }
      } else {
        // Create new user
        const response = await apiService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          occupation: formData.occupation,
          role: formData.role
        });
        
        if (response.error) {
          toast.error(response.error);
        } else {
          toast.success('Usuário criado com sucesso!');
          setIsDialogOpen(false);
          loadUsers();
        }
      }
    } catch (error) {
      toast.error('Erro ao salvar usuário');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const UserForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input 
          id="name" 
          placeholder="Nome completo" 
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="email@exemplo.com" 
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>
      {!editingUser && (
        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="Senha do usuário" 
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required={!editingUser}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input 
          id="phone" 
          placeholder="(11) 99999-9999" 
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="occupation">Ocupação</Label>
        <Input 
          id="occupation" 
          placeholder="Profissão" 
          value={formData.occupation}
          onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Tipo</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value: 'admin' | 'normal') => setFormData(prev => ({ ...prev, role: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="normal">Usuário</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-orange-500 hover:bg-orange-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>{editingUser ? 'Salvar Alterações' : 'Criar Usuário'}</>
          )}
        </Button>
        <Button 
          type="button"
          variant="outline" 
          onClick={() => setIsDialogOpen(false)} 
          className="flex-1"
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600">Administre todos os usuários do sistema Fin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddUser} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <UserForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Usuários</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {isLoadingUsers ? 'Carregando...' : `${users.length} usuários cadastrados no sistema`}
              </p>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Ocupação</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-gray-600">{user.email}</TableCell>
                        <TableCell className="text-gray-600">{user.phone || '-'}</TableCell>
                        <TableCell className="text-gray-600">{user.occupation || '-'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={user.role === 'admin' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}
                          >
                            {user.role === 'admin' ? 'Admin' : 'Usuário'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}