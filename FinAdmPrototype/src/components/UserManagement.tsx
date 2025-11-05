import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
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
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  
  // Estados de erro do formulário
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    general?: string;
  }>({});
  
  const { 
    users, 
    loading, 
    error, 
    createUser, 
    updateUser, 
    deleteUser, 
    toggleUserStatus 
  } = useAdminUsers({ search: searchTerm });

  // O hook já faz filtro pelo search, então não precisamos filtrar novamente
  const filteredUsers = users;

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      toast.success('Usuário excluído com sucesso');
      setDeletingUserId(null);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
      setDeletingUserId(null);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormRole('normal');
    setFormStatus('active');
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});

    try {
      const formData = new FormData(e.currentTarget);
      const errors: typeof formErrors = {};

      // Validar nome
      const name = (formData.get('name') as string)?.trim();
      if (!name || name.length === 0) {
        errors.name = 'Nome é obrigatório';
      } else if (name.length < 2) {
        errors.name = 'Nome deve ter no mínimo 2 caracteres';
      } else if (name.length > 100) {
        errors.name = 'Nome deve ter no máximo 100 caracteres';
      }

      // Validar email
      const email = (formData.get('email') as string)?.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || email.length === 0) {
        errors.email = 'E-mail é obrigatório';
      } else if (!emailRegex.test(email)) {
        errors.email = 'E-mail inválido. Exemplo: usuario@exemplo.com';
      } else if (email.length > 255) {
        errors.email = 'E-mail muito longo (máximo: 255 caracteres)';
      }

      // Validar senha apenas na criação
      if (!editingUser) {
        const password = (formData.get('password') as string);
        if (!password || password.length === 0) {
          errors.password = 'Senha é obrigatória';
        } else if (password.length < 6) {
          errors.password = 'Senha deve ter no mínimo 6 caracteres';
        } else if (password.length > 100) {
          errors.password = 'Senha muito longa (máximo: 100 caracteres)';
        }
      }

      // Validar role
      if (!formRole || (formRole !== 'admin' && formRole !== 'normal')) {
        errors.role = 'Tipo de usuário inválido';
      }

      // Se houver erros, mostrar e parar
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        const firstError = Object.values(errors)[0];
        toast.error(firstError || 'Corrija os erros no formulário');
        return;
      }

      const userData = {
        name: name!,
        email: email!,
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
        await createUser({ ...userData, password });
        toast.success('Usuário criado com sucesso');
      }
      
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormErrors({});
      setFormRole('normal');
      setFormStatus('active');
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      
      // Extrair mensagem de erro mais específica
      let errorMessage = 'Erro ao salvar usuário';
      
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        if (apiError.message) {
          errorMessage = apiError.message;
        }
        if (apiError.details) {
          errorMessage += `: ${JSON.stringify(apiError.details)}`;
        }
        if (apiError.fields) {
          const fieldErrors: typeof formErrors = {};
          Object.keys(apiError.fields).forEach((field) => {
            fieldErrors[field as keyof typeof fieldErrors] = apiError.fields[field];
          });
          setFormErrors({ ...formErrors, ...fieldErrors });
        }
      } else if (error.message) {
        errorMessage = error.message;
        // Verificar se é erro de email duplicado
        if (error.message.toLowerCase().includes('email') && 
            (error.message.toLowerCase().includes('já existe') || 
             error.message.toLowerCase().includes('already exists') ||
             error.message.toLowerCase().includes('duplicate'))) {
          errors.email = 'Este e-mail já está cadastrado';
          setFormErrors(errors);
          errorMessage = 'Este e-mail já está cadastrado no sistema';
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.code === 'TIMEOUT') {
        errorMessage = 'Tempo de espera excedido. Tente novamente.';
      }
      
      setFormErrors({ ...formErrors, general: errorMessage });
      toast.error(errorMessage);
    }
  };

  const UserForm = () => {
    return (
      <form onSubmit={handleSaveUser} className="space-y-4">
        {formErrors.general && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
            {formErrors.general}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name">Nome <span className="text-red-500">*</span></Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="Nome completo" 
            required 
            defaultValue={editingUser?.name}
            className={formErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
            onChange={() => setFormErrors({ ...formErrors, name: undefined })}
          />
          {formErrors.name && (
            <p className="text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail <span className="text-red-500">*</span></Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="email@exemplo.com" 
            required 
            defaultValue={editingUser?.email}
            className={formErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
            onChange={() => setFormErrors({ ...formErrors, email: undefined })}
          />
          {formErrors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
          )}
        </div>
        {!editingUser && (
          <div className="space-y-2">
            <Label htmlFor="password">Senha <span className="text-red-500">*</span></Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              required 
              minLength={6}
              className={formErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
              onChange={() => setFormErrors({ ...formErrors, password: undefined })}
            />
            {formErrors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="role">Tipo <span className="text-red-500">*</span></Label>
          <Select 
            value={formRole} 
            onValueChange={(v) => {
              setFormRole(v);
              setFormErrors({ ...formErrors, role: undefined });
            }}
          >
            <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="normal">Usuário</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.role && (
            <p className="text-sm text-red-600 dark:text-red-400">{formErrors.role}</p>
          )}
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
          <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
          <Button 
            type="button" 
            onClick={() => {
              setIsDialogOpen(false);
              setEditingUser(null);
              setFormErrors({});
            }} 
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold"
          >
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
          <h1 className="text-2xl font-semibold text-foreground">Gerenciar Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">Administre todos os usuários do sistema Fin</p>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Usuários</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {loading ? 'Carregando...' : `${users.length} usuário${users.length !== 1 ? 's' : ''} cadastrado${users.length !== 1 ? 's' : ''} no sistema`}
              </p>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
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
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-foreground">{user.name || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={user.status === 'active' 
                              ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/40' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}
                          >
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={user.role === 'admin' 
                              ? 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/40'}
                          >
                            {user.role === 'admin' ? 'Admin' : 'Usuário'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
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
                            <AlertDialog open={deletingUserId === String(user.id)} onOpenChange={(open) => setDeletingUserId(open ? String(user.id) : null)}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="!bg-gray-500 hover:!bg-gray-600 !text-white font-bold !border-0">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(String(user.id))}
                                    className="!bg-red-600 hover:!bg-red-700 !text-white font-bold shadow-lg"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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