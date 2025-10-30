import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Badge } from "./ui/badge";
import { useUser } from "../contexts/UserContext";
import { useTransactionSummary } from "../hooks/useTransactionSummary";
import { useTransactions } from "../hooks/useTransactions";
import { Skeleton } from "./ui/skeleton";
import { authApi, userApi, transactionApi, getErrorMessage } from "../services/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogHeader,
} from './ui/dialog';
import { Button } from './ui/button';
import { TransactionRegistration } from './TransactionRegistration';
import { UserRegistration } from './UserRegistration';

export function Dashboard() {
  const { user, isLoading: userLoading } = useUser();
  const { summary, isLoading: summaryLoading } = useTransactionSummary(user?.id || '', '30d');
  const { transactions, isLoading: transactionsLoading } = useTransactions({
    userId: user?.id || '',
    limit: 5,
    autoFetch: !!user?.id,
  });

  const isLoading = userLoading || summaryLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const stats = [
    {
      title: "Receitas do Mês",
      value: isLoading ? "..." : formatCurrency(summary?.income || 0),
      change: "+0%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Despesas do Mês",
      value: isLoading ? "..." : formatCurrency(Math.abs(summary?.expenses || 0)),
      change: "-0%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "Saldo Atual",
      value: isLoading ? "..." : formatCurrency(summary?.balance || 0),
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Categorias",
      value: isLoading ? "..." : (summary?.categories?.length || 0).toString(),
      change: "+0",
      trend: "up",
      icon: Users,
      color: "text-purple-600"
    }
  ];

  const [allUsers, setAllUsers] = useState([] as any[]);
  const [allTransactions, setAllTransactions] = useState([] as any[]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null as any);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [formErrors, setFormErrors] = useState({} as any);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // On mount, fetch all users and transactions and display them
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const usersResp = await userApi.listUsers();
        const users = usersResp.data?.users || usersResp.users || usersResp;
        if (mounted) setAllUsers(users || []);
      } catch (err) {
        // ignore
      }

      try {
        const txResp = await transactionApi.listAll({ limit: 200 });
        const txs = txResp.data?.transactions || txResp.transactions || txResp;
        if (mounted) setAllTransactions(txs || []);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false };
  }, []);

  const refreshUsers = async () => {
    try {
      const usersResp = await userApi.listUsers();
      const users = usersResp.data?.users || usersResp.users || usersResp;
      setAllUsers(users || []);
    } catch (err) {
      // ignore
    }
  };

  const createSameUser = async () => {
    try {
      // create a predictable test user (timestamped to avoid conflicts)
      const email = `quick.user+${Date.now()}@finapp.com`;
      const user = await authApi.register({ email, password: 'Passw0rd!', name: 'Quick User', age: 20 });
      toast.success('Usuário criado: ' + (user.user?.email || email));
      // refresh list
      const usersResp = await userApi.listUsers();
      const users = usersResp.data?.users || usersResp.users || usersResp;
      setAllUsers(users || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const createSameTransaction = async () => {
    try {
      // pick a user to attach transaction
      const usersResp = await userApi.listUsers();
      const users = usersResp.data?.users || usersResp.users || usersResp;
      const target = users[0];
      if (!target) return toast.error('Nenhum usuário disponível para criar transação');

      await transactionApi.create({
        userId: target.id,
        amount: -10.0,
        description: 'Quick transaction',
        category: 'shopping',
        type: 'expense',
        date: new Date().toISOString(),
      });

      toast.success('Transação criada para ' + (target.email || target.id));
      const txResp = await transactionApi.listAll({ limit: 200 });
      const txs = txResp.data?.transactions || txResp.transactions || txResp;
      setAllTransactions(txs || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAddTransaction = async (transactionData: Partial<Transaction>) => {
    try {
      await transactionApi.createTransaction({
        ...transactionData,
        id: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: transactionData.userId || '',
        amount: transactionData.amount || 0,
        description: transactionData.description || '',
        category: transactionData.category || 'Outros',
        type: transactionData.type || 'expense',
        date: transactionData.date || new Date().toISOString(),
      });
      toast.success('Transação adicionada com sucesso!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAddUser = async (userData: User) => {
    try {
      await userApi.createUser(userData);
      toast.success('Usuário adicionado com sucesso!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    console.log('Resumo de transações (summary):', summary);
  }, [summary]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="mt-3 flex gap-3">
          <button
            className="px-3 py-1 bg-primary text-white rounded-md"
            onClick={() => { window.location.href = '/users'; }}
          >
            Ir para Usuários
          </button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded-md"
            onClick={() => { window.location.href = '/transactions'; }}
          >
            Ir para Transações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <Badge
                        variant={stat.trend === "up" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setIsAddTransactionOpen(true)}>Adicionar Transação</Button>
        <Button onClick={() => setIsAddUserOpen(true)}>Adicionar Usuário</Button>
      </div>

      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Transação</DialogTitle>
          </DialogHeader>
          <TransactionRegistration onSubmit={handleAddTransaction} />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Usuário</DialogTitle>
          </DialogHeader>
          <UserRegistration onSubmit={handleAddUser} />
        </DialogContent>
      </Dialog>

      <EditUserDialog open={isEditOpen} setOpen={setIsEditOpen} user={editingUser} onSaved={refreshUsers} />
    </div>
  );
}

// Edit User Dialog (modal markup rendered near export so JSX stays tidy)
export function EditUserDialog({
  open,
  setOpen,
  user,
  onSaved,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  user: any | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    setForm({ name: user?.name || '', email: user?.email || '' });
    setErrors({});
  }, [user]);

  const validate = () => {
    const e: any = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Nome é obrigatório (min 2 caracteres)';
    if (!form.email || !/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(form.email)) e.email = 'E-mail inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!validate()) return;
    try {
      await userApi.updateUser(user.id, { name: form.name, email: form.email });
      toast.success('Usuário atualizado');
      onSaved();
      setOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await userApi.deleteUser(user.id);
      toast.success('Usuário removido');
      onSaved();
      setOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>{user ? `Editar ${user.email || user.name}` : 'Editar Usuário'}</DialogTitle>
        <DialogDescription>Altere os dados do usuário e clique em salvar.</DialogDescription>

        <div className="space-y-3 mt-4">
          <div>
            <label className="text-sm">Nome</label>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="w-full border rounded px-2 py-1 mt-1"
            />
            {errors.name && <div className="text-xs text-red-600">{errors.name}</div>}
          </div>

          <div>
            <label className="text-sm">E-mail</label>
            <input
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="w-full border rounded px-2 py-1 mt-1"
            />
            {errors.email && <div className="text-xs text-red-600">{errors.email}</div>}
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={handleDelete}>Excluir</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleSave}>Salvar</button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Simple Delete-only dialog reusing EditUserDialog's delete action could be added if needed.

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}