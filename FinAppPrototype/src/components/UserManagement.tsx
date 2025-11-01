import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { toast } from "sonner";
import { UserPlus, Edit, Trash2, Shield, User, Loader2 } from "lucide-react";
import { userApi, getErrorMessage } from "../services/api";
import { Skeleton } from "./ui/skeleton";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  income?: number;
  occupation?: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    income: "",
    occupation: "",
    isAdmin: false,
    isActive: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userApi.listUsers();
      setUsers(response.users || response || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      age: "",
      income: "",
      occupation: "",
      isAdmin: false,
      isActive: true
    });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone || "",
      age: user.age?.toString() || "",
      income: user.income?.toString() || "",
      occupation: user.occupation || "",
      isAdmin: user.isAdmin,
      isActive: user.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        // Editar usuário existente
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          isActive: formData.isActive,
        };
        
        if (formData.age) updateData.age = parseInt(formData.age);
        if (formData.phone) updateData.phone = formData.phone;
        if (formData.income) updateData.monthlyIncome = parseFloat(formData.income);
        if (formData.occupation) updateData.occupation = formData.occupation;
        
        await userApi.updateUser(selectedUser.id, updateData);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Criar novo usuário
        const createData: any = {
          name: formData.name,
          email: formData.email,
          password: formData.password || "senha123",
        };
        
        if (formData.age) createData.age = parseInt(formData.age);
        
        await userApi.createUser(createData);
        toast.success("Usuário criado com sucesso!");
      }
      
      await loadUsers();
      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
      setSelectedUser(null);
      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await userApi.deleteUser(userId);
      toast.success("Usuário removido com sucesso!");
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleAdmin = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        await userApi.updateUser(userId, { isAdmin: !user.isAdmin });
        toast.success("Permissões atualizadas!");
        await loadUsers();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const UserForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Digite o nome completo"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="usuario@exemplo.com"
            required
          />
        </div>
      </div>

      {!selectedUser && (
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Senha para novo usuário"
            required={!selectedUser}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="(11) 99999-9999"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Idade</Label>
          <Select value={formData.age} onValueChange={(value) => handleChange("age", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a idade" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 13 }, (_, i) => 16 + i).map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {age} anos
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="income">Renda Mensal</Label>
          <Input
            id="income"
            value={formData.income}
            onChange={(e) => handleChange("income", e.target.value)}
            placeholder="R$ 0,00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="occupation">Ocupação</Label>
          <Input
            id="occupation"
            value={formData.occupation}
            onChange={(e) => handleChange("occupation", e.target.value)}
            placeholder="Ex: Estudante, Estagiário, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isAdmin"
            checked={formData.isAdmin}
            onCheckedChange={(checked) => handleChange("isAdmin", checked)}
          />
          <Label htmlFor="isAdmin">Administrador</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange("isActive", checked)}
          />
          <Label htmlFor="isActive">Ativo</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gerenciar Usuários</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administre todos os usuários do sistema Fin</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" onClick={resetForm}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo usuário
              </DialogDescription>
            </DialogHeader>
            <UserForm />
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveUser} 
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Usuário'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {users.length} usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum usuário encontrado</p>
              <p className="text-sm mt-2">Crie o primeiro usuário usando o botão acima</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.age || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isAdmin ? (
                        <Badge className="bg-primary">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <User className="h-3 w-3 mr-1" />
                          Usuário
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAdmin(user.id)}
                        className="h-6 px-2"
                      >
                        {user.isAdmin ? "Remover Admin" : "Tornar Admin"}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Modifique os dados do usuário
            </DialogDescription>
          </DialogHeader>
          <UserForm />
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSaveUser} 
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}