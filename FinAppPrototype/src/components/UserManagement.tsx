import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { toast } from "sonner@2.0.3";
import { UserPlus, Edit, Trash2, Shield, User } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  income: string;
  occupation: string;
  isAdmin: boolean;
  status: "ativo" | "inativo";
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao@exemplo.com",
      phone: "(11) 99999-9999",
      age: "25",
      income: "R$ 5.000,00",
      occupation: "Desenvolvedor",
      isAdmin: true,
      status: "ativo",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@exemplo.com",
      phone: "(11) 88888-8888",
      age: "22",
      income: "R$ 3.000,00",
      occupation: "Estudante",
      isAdmin: false,
      status: "ativo",
      createdAt: "2024-02-20"
    },
    {
      id: "3",
      name: "Pedro Oliveira",
      email: "pedro@exemplo.com",
      phone: "(11) 77777-7777",
      age: "28",
      income: "R$ 4.500,00",
      occupation: "Designer",
      isAdmin: false,
      status: "inativo",
      createdAt: "2024-01-30"
    }
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    income: "",
    occupation: "",
    isAdmin: false,
    status: "ativo" as "ativo" | "inativo"
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      age: "",
      income: "",
      occupation: "",
      isAdmin: false,
      status: "ativo"
    });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      age: user.age,
      income: user.income,
      occupation: user.occupation,
      isAdmin: user.isAdmin,
      status: user.status
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      // Editar usuário existente
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...formData }
          : user
      ));
      toast.success("Usuário atualizado com sucesso!");
    } else {
      // Criar novo usuário
      const newUser: User = {
        id: String(users.length + 1),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
      toast.success("Usuário criado com sucesso!");
    }
    
    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDelete = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast.success("Usuário removido com sucesso!");
  };

  const toggleAdmin = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isAdmin: !user.isAdmin }
        : user
    ));
    toast.success("Permissões atualizadas!");
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
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: "ativo" | "inativo") => handleChange("status", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
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
              <Button onClick={handleSaveUser} className="bg-primary hover:bg-primary/90">
                Criar Usuário
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
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {users.length} usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Ocupação</TableHead>
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
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.occupation}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "ativo" ? "default" : "secondary"}>
                      {user.status}
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
                  <TableCell>{user.createdAt}</TableCell>
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
            <Button onClick={handleSaveUser} className="bg-primary hover:bg-primary/90">
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