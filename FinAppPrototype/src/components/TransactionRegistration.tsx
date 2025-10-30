import { SetStateAction, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Calendar, DollarSign, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useTransactions } from "../hooks/useTransactions";
import { userApi, transactionApi, Transaction } from "../services/api";
import { useEffect } from "react";
import { toast } from 'sonner';
import { Skeleton } from "./ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

export function TransactionRegistration({ onSubmit }: { onSubmit: (transaction: Transaction) => void }) {
  const { user } = useUser();
  const { transactions, isLoading, createTransaction, refetch } = useTransactions({
    userId: user?.id || '',
    limit: 10,
    autoFetch: !!user?.id,
  });

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const [availableUsers, setAvailableUsers] = useState<Array<any>>([]);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [txForm, setTxForm] = useState({ description: '', amount: '', category: '', type: '', date: '' });
  const [txErrors, setTxErrors] = useState({} as any);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const categories = [
    { name: "food", label: "Alimentação", type: "expense", color: "#ef4444" },
    { name: "transport", label: "Transporte", type: "expense", color: "#3b82f6" },
    { name: "salary", label: "Salário", type: "income", color: "#10b981" },
    { name: "entertainment", label: "Entretenimento", type: "expense", color: "#8b5cf6" },
    { name: "shopping", label: "Compras", type: "expense", color: "#f59e0b" },
    { name: "freelance", label: "Freelance", type: "income", color: "#10b981" },
    { name: "health", label: "Saúde", type: "expense", color: "#ef4444" },
    { name: "education", label: "Educação", type: "expense", color: "#8b5cf6" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      // allow creating for a selected target user even if not logged in
      if (!targetUserId) return;
    }

    // validation
    if (!formData.type) { toast.error('Selecione o tipo (Receita ou Despesa)'); return; }
    const amount = parseFloat(String(formData.amount).replace(',', '.'));
    if (!amount || isNaN(amount)) { toast.error('Informe um valor válido'); return; }
    if (!formData.category) { toast.error('Selecione uma categoria'); return; }
    setIsSubmitting(true);
    try {
      const transactionType = formData.type === "Receita" ? "income" : "expense";

      // ensure sign: expenses stored as negative
      const signedAmount = transactionType === 'expense' ? -Math.abs(amount) : Math.abs(amount);

      const payload = {
        amount: signedAmount,
        description: formData.description,
        category: formData.category,
        type: transactionType as 'income' | 'expense',
        date: formData.date,
      };

      // If a targetUserId is selected (manual), call API directly to create for that user
      if (targetUserId && (!user || targetUserId !== user.id)) {
        await transactionApi.create({ userId: targetUserId, ...payload });
      } else {
        await createTransaction(payload);
      }

      // refresh full list panel
      try {
        const resp = await transactionApi.listAll({ limit: 1000 });
        const txs = resp.data?.transactions || resp.transactions || resp;
        setAllTransactions(txs || []);
      } catch (e) {
        // ignore
      }

      setFormData({
        type: "",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      // Error already handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredCategories = categories.filter(cat => {
    if (!formData.type) return true;
    const typeMap = { "Receita": "income", "Despesa": "expense" };
    return cat.type === typeMap[formData.type as keyof typeof typeMap];
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await userApi.listUsers();
        const users = resp.data?.users || resp.users || resp;
        if (mounted) setAvailableUsers(users || []);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
      }
    })();
    // also load ALL transactions for the right-side panel
    (async () => {
      try {
        const resp = await transactionApi.listAll({ limit: 1000 });
        const txs = resp.data?.transactions || resp.transactions || resp;
        console.log('Transações carregadas:', txs); // Log para depuração
        if (mounted) setAllTransactions(txs || []);
      } catch (err) {
        console.error('Erro ao carregar transações:', err);
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Registro de Transações</h2>
        <p className="text-gray-600 mt-1">Acompanhe suas receitas e despesas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova Transação</CardTitle>
          <CardDescription>
            Registre uma nova receita ou despesa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Transação</Label>
              <Select onValueChange={(value: string) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receita">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-green-600" />
                      Receita
                    </div>
                  </SelectItem>
                  <SelectItem value="Despesa">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-red-600" />
                      Despesa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select 
                onValueChange={(value: string) => handleChange("category", value)}
                disabled={!formData.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descreva a transação (opcional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Criar para usuário</Label>
              <Select onValueChange={(v: string) => setTargetUserId(v)} value={targetUserId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder={user ? 'Usar usuário atual' : 'Selecione um usuário'} />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{(u.name ? u.name + ' · ' : '') + (u.email || '')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSubmitting || (!user && !targetUserId)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar Transação'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}