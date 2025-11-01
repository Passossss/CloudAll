import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Edit, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import type { AdminUser } from '../services/types';
import { toast } from 'sonner';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formRole, setFormRole] = useState<string>('normal');
  const [formStatus, setFormStatus] = useState<string>('active');
  
  const { 
    users, 
    loading, 
    error, 
    createUser, 
    updateUser, 
    deleteUser, 
    toggleUserStatus 
  } = useAdminUsers({ search: searchTerm });

  // Filtrar usuários localmente se necessário (o hook já faz filtro pelo search)
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser(id);
        toast.success('Usuário excluído com sucesso');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormRole(user.role);
    setFormStatus(user.status);
    setIsDialogOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormRole('normal');
    setFormStatus('active');
    setIsDialogOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const userData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: (formRole as 'normal' | 'admin') || 'normal',
      };

      if (editingUser) {
        await updateUser(editingUser.id, userData);
        // Se mudou o status, também atualizar
        if (formStatus !== (editingUser.status === 'active' ? 'active' : 'inactive')) {
          await toggleUserStatus(editingUser.id, formStatus as 'active' | 'inactive');
        }
        toast.success('Usuário atualizado com sucesso');
      } else {
        const password = formData.get('password') as string;
        if (!password || password.length < 6) {
          toast.error('Senha é obrigatória e deve ter no mínimo 6 caracteres');
          return;
        }
        await createUser({ ...userData, password });
        toast.success('Usuário criado com sucesso');
      }
      
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message || 'Erro ao salvar usuário');
    }
  };

  const UserForm = () => {
    return (
      <form onSubmit={handleSaveUser} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" placeholder="Nome completo" required defaultValue={editingUser?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="email@exemplo.com" required defaultValue={editingUser?.email} />
        </div>
        {!editingUser && (
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required minLength={6} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="role">Tipo</Label>
          <Select value={formRole} onValueChange={setFormRole}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="normal">Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {editingUser && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formStatus} onValueChange={setFormStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    );
  };

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
                {loading ? 'Carregando...' : `${users.length} usuário${users.length !== 1 ? 's' : ''} cadastrado${users.length !== 1 ? 's' : ''} no sistema`}
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
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              Erro ao carregar usuários: {error.message}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                        <TableCell className="text-gray-600">{user.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={user.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}
                          >
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={user.role === 'admin' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}
                          >
                            {user.role === 'admin' ? 'Admin' : 'Usuário'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
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
                              onClick={() => handleDeleteUser(String(user.id))}
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