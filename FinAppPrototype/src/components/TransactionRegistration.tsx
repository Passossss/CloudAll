import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Calendar, DollarSign, ArrowUp, ArrowDown, Loader2, Edit, Trash2 } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useTransactions } from "../hooks/useTransactions";
import { Transaction } from "../services/api";
import { toast } from 'sonner';
import { Skeleton } from "./ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

export function TransactionRegistration({ onSubmit }: { onSubmit?: (transaction: Transaction) => void }) {
  const { user } = useUser();
  const { 
    transactions, 
    isLoading, 
    createTransaction, 
    updateTransaction,
    deleteTransaction,
    refetch 
  } = useTransactions({
    userId: user?.id || '',
    limit: 20,
    autoFetch: !!user?.id,
  });

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Validação de erros
  const [errors, setErrors] = useState({
    type: '',
    amount: '',
    category: '',
    description: '',
  });

  const categories = [
    { name: "food", label: "Alimentação", type: "expense", color: "#ef4444" },
    { name: "transport", label: "Transporte", type: "expense", color: "#3b82f6" },
    { name: "salary", label: "Salário", type: "income", color: "#10b981" },
    { name: "entertainment", label: "Entretenimento", type: "expense", color: "#8b5cf6" },
    { name: "shopping", label: "Compras", type: "expense", color: "#f59e0b" },
    { name: "freelance", label: "Freelance", type: "income", color: "#10b981" },
    { name: "health", label: "Saúde", type: "expense", color: "#ef4444" },
    { name: "education", label: "Educação", type: "expense", color: "#8b5cf6" },
    { name: "bills", label: "Contas", type: "expense", color: "#dc2626" },
    { name: "investment", label: "Investimentos", type: "income", color: "#059669" },
    { name: "gift", label: "Presentes", type: "expense", color: "#ec4899" },
    { name: "other", label: "Outros", type: "both", color: "#6b7280" },
  ];

  const validateForm = () => {
    const newErrors = {
      type: '',
      amount: '',
      category: '',
      description: '',
    };
    let isValid = true;

    // Validar tipo
    if (!formData.type) {
      newErrors.type = 'Selecione o tipo de transação';
      isValid = false;
    }

    // Validar valor
    const amount = parseFloat(String(formData.amount).replace(',', '.'));
    if (!formData.amount) {
      newErrors.amount = 'Informe o valor';
      isValid = false;
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Informe um valor válido maior que zero';
      isValid = false;
    } else if (amount > 999999999.99) {
      newErrors.amount = 'Valor muito alto (máximo: R$ 999.999.999,99)';
      isValid = false;
    }

    // Validar categoria
    if (!formData.category) {
      newErrors.category = 'Selecione uma categoria';
      isValid = false;
    }

    // Validar descrição (opcional mas com limite)
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Descrição deve ter no máximo 200 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    // Validar formulário
    if (!validateForm()) {
      const firstError = Object.values(errors).find(err => err !== '');
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionType = formData.type === "Receita" ? "income" : "expense";
      const amount = parseFloat(String(formData.amount).replace(',', '.'));
      
      // Arredondar para 2 casas decimais
      const roundedAmount = Math.round(amount * 100) / 100;

      const payload = {
        amount: roundedAmount,
        description: formData.description.trim() || `Transação de ${formData.type}`,
        category: formData.category,
        type: transactionType as 'income' | 'expense',
        date: formData.date,
      };

      console.log('[TransactionRegistration] Criando transação:', payload);
      await createTransaction(payload);

      // Limpar formulário
      setFormData({
        type: "",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
      });
      setErrors({
        type: '',
        amount: '',
        category: '',
        description: '',
      });

      if (onSubmit) {
        onSubmit(payload as Transaction);
      }
    } catch (error) {
      console.error('[TransactionRegistration] Erro ao criar transação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      type: tx.type === 'income' ? 'Receita' : 'Despesa',
      amount: Math.abs(tx.amount).toString().replace('.', ','),
      category: tx.category,
      description: tx.description,
      date: tx.date.split('T')[0],
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTx || !user) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionType = formData.type === "Receita" ? "income" : "expense";
      const amount = parseFloat(String(formData.amount).replace(',', '.'));
      const roundedAmount = Math.round(amount * 100) / 100;

      await updateTransaction(editingTx.id, {
        amount: roundedAmount,
        description: formData.description.trim() || `Transação de ${formData.type}`,
        category: formData.category,
        type: transactionType as 'income' | 'expense',
        date: formData.date,
      });

      setIsEditOpen(false);
      setEditingTx(null);
      setFormData({
        type: "",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('[TransactionRegistration] Erro ao atualizar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (txId: string) => {
    try {
      await deleteTransaction(txId);
    } catch (error) {
      console.error('[TransactionRegistration] Erro ao deletar:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao digitar
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const filteredCategories = categories.filter(cat => {
    if (!formData.type) return true;
    const typeMap = { "Receita": "income", "Despesa": "expense" };
    const selectedType = typeMap[formData.type as keyof typeof typeMap];
    return cat.type === selectedType || cat.type === 'both';
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

  const getCategoryLabel = (categoryName: string) => {
    return categories.find(c => c.name === categoryName)?.label || categoryName;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Minhas Transações</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {user ? `Bem-vindo, ${user.name}!` : 'Acompanhe suas receitas e despesas'}
        </p>
      </div>

      {/* Formulário de Nova Transação */}
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
              <Label>Tipo de Transação <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.type}
                onValueChange={(value: string) => handleChange("type", value)}
              >
                <SelectTrigger className={`w-full ${errors.type ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receita">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Receita
                    </div>
                  </SelectItem>
                  <SelectItem value="Despesa">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      Despesa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor <span className="text-red-500">*</span></Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <Input
                  id="amount"
                  type="text"
                  value={formData.amount}
                  onChange={(e) => {
                    // Permitir apenas números, vírgula e ponto
                    const value = e.target.value.replace(/[^0-9,.]/g, '');
                    handleChange("amount", value);
                  }}
                  placeholder="100,50"
                  className={`w-full ${errors.amount ? 'border-red-500' : ''}`}
                  style={{ 
                    paddingLeft: '2.5rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  inputMode="decimal"
                />
              </div>
              {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label>Categoria <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.category}
                onValueChange={(value: string) => handleChange("category", value)}
                disabled={!formData.type}
              >
                <SelectTrigger className={`w-full ${errors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={formData.type ? "Selecione uma categoria" : "Primeiro selecione o tipo"} />
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
              {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="w-full"
                  style={{ 
                    paddingLeft: '2.5rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  max={new Date().toISOString().split('T')[0]}
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
                maxLength={200}
                className={`w-full ${errors.description ? 'border-red-500' : ''}`}
              />
              <p className="text-xs text-gray-500">
                {formData.description.length}/200 caracteres
              </p>
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full font-bold"
              style={{ 
                backgroundColor: '#f97316', 
                color: 'white',
                border: 'none',
                cursor: isSubmitting || !user ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && user) {
                  e.currentTarget.style.backgroundColor = '#ea580c';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && user) {
                  e.currentTarget.style.backgroundColor = '#f97316';
                }
              }}
              disabled={isSubmitting || !user}
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

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            {transactions.length} transação(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm mt-2">Comece registrando sua primeira transação acima</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {tx.type === 'income' ? (
                        <ArrowUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{getCategoryLabel(tx.category)}</Badge>
                        <span className="text-sm text-gray-500">{formatDate(tx.date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-lg ${
                        tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tx)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(tx.id)}
                              style={{ backgroundColor: '#dc2626', color: 'white' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.type}
                onValueChange={(value: string) => handleChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receita">Receita</SelectItem>
                  <SelectItem value="Despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value.replace(/[^0-9,.]/g, ''))}
                placeholder="100,50"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.category}
                onValueChange={(value: string) => handleChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                maxLength={200}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: '#f97316', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
