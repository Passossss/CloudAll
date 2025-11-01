import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "./ui/dialog";
import { useUser } from "../contexts/UserContext";
import { useEffect } from 'react';
import { userApi, getErrorMessage, User } from "../services/api";

export function UserRegistration({ onSubmit }: { onSubmit: (user: User) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    income: "",
    occupation: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const ageNum = formData.age ? parseInt(formData.age, 10) : undefined;
        await register({
          email: formData.email,
          password: 'Passw0rd!', // default password for created users via UI
          name: formData.name,
          age: ageNum,
        });

        toast.success('Usuário cadastrado com sucesso!');
        setFormData({ name: '', email: '', phone: '', age: '', income: '', occupation: '' });
        onSubmit({
          ...formData,
          id: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          age: parseInt(formData.age, 10),
        });
      } catch (err) {
        // error handled by auth hook
      }
    })();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const { register } = useUser();

  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [editErrors, setEditErrors] = useState({} as any);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await userApi.listUsers();
        const list = resp.data?.users || resp.users || resp;
        if (mounted) setUsers(list || []);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false };
  }, []);

  const openEdit = (u: any) => {
    setEditingUser(u);
    setEditForm({ name: u.name || '', email: u.email || '' });
    setEditErrors({});
    setIsEditOpen(true);
  };

  const validateEdit = () => {
    const e: any = {};
    if (!editForm.name || editForm.name.trim().length < 2) e.name = 'Nome inválido';
    if (!editForm.email || !/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(editForm.email)) e.email = 'E-mail inválido';
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    if (!validateEdit()) return;
    try {
      await userApi.updateUser(editingUser.id, { name: editForm.name, email: editForm.email });
      const resp = await userApi.listUsers();
      const list = resp.data?.users || resp.users || resp;
      setUsers(list || []);
      setIsEditOpen(false);
      toast.success('Usuário atualizado');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteUser = async (u: any) => {
    try {
      await userApi.deleteUser(u.id);
      const resp = await userApi.listUsers();
      const list = resp.data?.users || resp.users || resp;
      setUsers(list || []);
      toast.success('Usuário removido');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Cadastro de Usuário</h2>
        <p className="text-gray-600 mt-1">Gerencie os usuários do sistema Fin</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Novo Usuário</CardTitle>
          <CardDescription>
            Cadastre um novo usuário para começar a usar o Fin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Select onValueChange={(value: string) => handleChange("age", value)}>
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

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Cadastrar Usuário
              </Button>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>Edite ou remova usuários</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-sm text-gray-500">Nenhum usuário encontrado</div>
          ) : (
            <div className="space-y-2">
              {users.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{u.name || u.email}</p>
                    <p className="text-xs text-gray-600">{u.email}</p>
                  </div>
                    <div className="flex items-center gap-3">
                      <button className="text-sm text-blue-600 hover:underline" onClick={() => openEdit(u)}>Edit</button>
                      <button className="text-sm text-red-600 hover:underline" onClick={() => { setEditingUser(u); setIsDeleteOpen(true); }}>Delete</button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        
        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>Atualize os dados do usuário</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <div>
                <label className="text-sm">Nome</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full border rounded px-2 py-1 mt-1"
                />
                {editErrors.name && <div className="text-xs text-red-600">{editErrors.name}</div>}
              </div>
              <div>
                <label className="text-sm">E-mail</label>
                <input
                  value={editForm.email}
                  onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))}
                  className="w-full border rounded px-2 py-1 mt-1"
                />
                {editErrors.email && <div className="text-xs text-red-600">{editErrors.email}</div>}
              </div>
            </div>
            <DialogFooter>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setIsEditOpen(false)}>Cancelar</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleSaveEdit}>Salvar</button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este usuário?</DialogDescription>
            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setIsDeleteOpen(false)}>Cancelar</button>
              <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={async () => { if (editingUser) await handleDeleteUser(editingUser); setIsDeleteOpen(false); }}>Excluir</button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}