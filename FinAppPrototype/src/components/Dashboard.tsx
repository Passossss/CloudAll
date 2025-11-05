import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, TrendingUp, TrendingDown, Tag, ArrowUpRight, ArrowDownRight, Plus, X, Calendar } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useUser } from "../contexts/UserContext";
import { useTransactions } from "../hooks/useTransactions";
import { Skeleton } from "./ui/skeleton";
import { toast } from 'sonner';

interface DashboardProps {
  onPageChange?: (page: string) => void;
}

export function Dashboard({ onPageChange }: DashboardProps = {}) {
  const { user, isLoading: userLoading } = useUser();
  const { transactions, isLoading: transactionsLoading, createTransaction, refetch } = useTransactions({
    userId: user?.id || '',
    limit: 100,
    autoFetch: !!user?.id,
  });

  // Estado do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | ''>('');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    amount: '',
    description: '',
    category: '',
  });

  // Calcular estatísticas das transações
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = income - expenses;

    // Contar categorias únicas
    const uniqueCategories = new Set(transactions.map(t => t.category));

    return {
      income,
      expenses,
      balance,
      categoriesCount: uniqueCategories.size,
      transactionsCount: transactions.length,
    };
  }, [transactions]);

  // Pegar últimas 5 transações
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const isLoading = userLoading || transactionsLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const categoryLabels: Record<string, string> = {
    food: 'Alimentação',
    transport: 'Transporte',
    salary: 'Salário',
    entertainment: 'Entretenimento',
    shopping: 'Compras',
    freelance: 'Freelance',
    health: 'Saúde',
    education: 'Educação',
    bills: 'Contas',
    investment: 'Investimentos',
    gift: 'Presentes',
    other: 'Outros',
  };

  const categories = [
    { value: 'food', label: 'Alimentação', type: 'expense', icon: '🍽️' },
    { value: 'transport', label: 'Transporte', type: 'expense', icon: '🚗' },
    { value: 'entertainment', label: 'Entretenimento', type: 'expense', icon: '🎬' },
    { value: 'shopping', label: 'Compras', type: 'expense', icon: '🛍️' },
    { value: 'bills', label: 'Contas', type: 'expense', icon: '📄' },
    { value: 'health', label: 'Saúde', type: 'expense', icon: '🏥' },
    { value: 'education', label: 'Educação', type: 'expense', icon: '📚' },
    { value: 'salary', label: 'Salário', type: 'income', icon: '💰' },
    { value: 'freelance', label: 'Freelance', type: 'income', icon: '💼' },
    { value: 'investment', label: 'Investimentos', type: 'income', icon: '📈' },
    { value: 'gift', label: 'Presentes', type: 'both', icon: '🎁' },
    { value: 'other', label: 'Outros', type: 'both', icon: '📌' },
  ];

  const filteredCategories = categories.filter(cat => {
    if (!transactionType) return true;
    return cat.type === transactionType || cat.type === 'both';
  });

  const openModal = (type?: 'income' | 'expense') => {
    setTransactionType(type || '');
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionType('');
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
    setFieldErrors({ amount: '', description: '', category: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar erros anteriores
    setFieldErrors({ amount: '', description: '', category: '' });

    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    if (!transactionType) {
      toast.error('Selecione o tipo de transação');
      return;
    }

    let hasErrors = false;

    // Validar valor
    if (!formData.amount || formData.amount.trim() === '') {
      setFieldErrors(prev => ({ ...prev, amount: 'Valor é obrigatório' }));
      hasErrors = true;
    } else {
      const normalizedAmount = formData.amount.replace(/\./g, '').replace(',', '.');
      const amountValue = parseFloat(normalizedAmount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setFieldErrors(prev => ({ ...prev, amount: 'Valor deve ser maior que zero' }));
        hasErrors = true;
      } else if (amountValue > 999999999.99) {
        setFieldErrors(prev => ({ ...prev, amount: 'Valor muito alto (máximo: R$ 999.999.999,99)' }));
        hasErrors = true;
      }
    }

    // Validar descrição
    if (!formData.description.trim()) {
      setFieldErrors(prev => ({ ...prev, description: 'Descrição é obrigatória' }));
      hasErrors = true;
    } else if (formData.description.trim().length > 200) {
      setFieldErrors(prev => ({ ...prev, description: 'Descrição deve ter no máximo 200 caracteres' }));
      hasErrors = true;
    }

    // Validar categoria
    if (!formData.category) {
      setFieldErrors(prev => ({ ...prev, category: 'Selecione uma categoria' }));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedAmount = formData.amount.replace(/\./g, '').replace(',', '.');
      const amountValue = parseFloat(normalizedAmount);
      const roundedAmount = Math.round(amountValue * 100) / 100;

      await createTransaction({
        amount: roundedAmount,
        description: formData.description.trim(),
        category: formData.category,
        type: transactionType,
        date: formData.date,
      });

      toast.success('Transação criada com sucesso!');
      closeModal();
      await refetch();
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast.error('Erro ao criar transação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statCards = [
    {
      title: "Receitas",
      value: isLoading ? "..." : formatCurrency(stats.income),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Despesas",
      value: isLoading ? "..." : formatCurrency(stats.expenses),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Saldo Atual",
      value: isLoading ? "..." : formatCurrency(stats.balance),
      icon: DollarSign,
      color: stats.balance >= 0 ? "text-blue-600" : "text-orange-600",
      bgColor: stats.balance >= 0 ? "bg-blue-100" : "bg-orange-100",
    },
    {
      title: "Categorias",
      value: isLoading ? "..." : stats.categoriesCount.toString(),
      icon: Tag,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Olá, {user?.name || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Aqui está um resumo das suas finanças
          </p>
        </div>
         <Button 
           className="bg-orange-500 hover:bg-orange-600 text-white"
           onClick={() => openModal()}
         >
           <Plus className="w-4 h-4 mr-2" />
           Nova Transação
         </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`border-l-4 border-l-${stat.color.replace('text-', '')}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-semibold text-foreground mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transações Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transações Recentes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Últimas {recentTransactions.length} movimentações
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (onPageChange) {
                  onPageChange('transactions');
                } else {
                  console.warn('onPageChange não está disponível');
                }
              }}
              className="font-medium"
            >
              Ver Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">Nenhuma transação encontrada</p>
              <p className="text-sm mt-2">Comece registrando sua primeira transação!</p>
              <Button 
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  if (onPageChange) {
                    onPageChange('transactions');
                  } else {
                    console.warn('onPageChange não está disponível');
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Transação
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {categoryLabels[tx.category] || tx.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-lg ${
                      tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

       {/* Quick Actions */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card 
           className="cursor-pointer hover:shadow-md transition-shadow border-green-200 hover:border-green-300"
           onClick={() => openModal('income')}
         >
           <CardContent className="p-6 text-center">
             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <ArrowUpRight className="w-6 h-6 text-green-600" />
             </div>
             <h3 className="font-medium">Nova Receita</h3>
             <p className="text-sm text-muted-foreground mt-1">Adicionar entrada de dinheiro</p>
           </CardContent>
         </Card>

         <Card 
           className="cursor-pointer hover:shadow-md transition-shadow border-red-200 hover:border-red-300"
           onClick={() => openModal('expense')}
         >
           <CardContent className="p-6 text-center">
             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <ArrowDownRight className="w-6 h-6 text-red-600" />
             </div>
             <h3 className="font-medium">Nova Despesa</h3>
             <p className="text-sm text-muted-foreground mt-1">Registrar um gasto</p>
           </CardContent>
         </Card>

         <Card 
           className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 hover:border-blue-300"
           onClick={() => window.location.href = '/transactions'}
         >
           <CardContent className="p-6 text-center">
             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <Tag className="w-6 h-6 text-blue-600" />
             </div>
             <h3 className="font-medium">Ver Todas</h3>
             <p className="text-sm text-muted-foreground mt-1">Histórico completo</p>
           </CardContent>
         </Card>
       </div>

       {/* Modal de Nova Transação */}
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent className="sm:max-w-[500px]">
           <DialogHeader>
             <DialogTitle className="text-2xl font-bold">
               {transactionType === 'income' ? '💰 Nova Receita' : 
                transactionType === 'expense' ? '💸 Nova Despesa' : 
                '💳 Nova Transação'}
             </DialogTitle>
           </DialogHeader>
           
           <form onSubmit={handleSubmit} className="space-y-4 mt-4">
             {/* Tipo de Transação */}
             {!transactionType && (
               <div className="space-y-2">
                 <Label>Tipo de Transação</Label>
                 <div className="grid grid-cols-2 gap-3">
                   <Button
                     type="button"
                     variant="outline"
                     className={`h-20 flex flex-col items-center justify-center gap-2 ${
                       transactionType === 'income' ? 'border-green-500 bg-green-50' : ''
                     }`}
                     onClick={() => setTransactionType('income')}
                   >
                     <ArrowUpRight className="w-6 h-6 text-green-600" />
                     <span className="font-medium">Receita</span>
                   </Button>
                   <Button
                     type="button"
                     variant="outline"
                     className={`h-20 flex flex-col items-center justify-center gap-2 ${
                       transactionType === 'expense' ? 'border-red-500 bg-red-50' : ''
                     }`}
                     onClick={() => setTransactionType('expense')}
                   >
                     <ArrowDownRight className="w-6 h-6 text-red-600" />
                     <span className="font-medium">Despesa</span>
                   </Button>
                 </div>
               </div>
             )}

             {transactionType && (
               <>
                 {/* Valor */}
                 <div className="space-y-2">
                   <Label htmlFor="amount" className="text-base">
                     Valor <span className="text-red-500">*</span>
                   </Label>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10 font-medium">R$</span>
                     <Input
                       id="amount"
                       type="text"
                       value={formData.amount}
                       onChange={(e) => {
                         const value = e.target.value.replace(/[^0-9,.]/g, '');
                         setFormData({ ...formData, amount: value });
                         if (fieldErrors.amount) {
                           setFieldErrors(prev => ({ ...prev, amount: '' }));
                         }
                       }}
                       placeholder="0,00"
                       className={`pl-12 text-base h-12 w-full bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 placeholder:text-gray-400 ${
                         fieldErrors.amount 
                           ? 'border border-red-500 focus:ring-red-200' 
                           : 'focus:ring-primary/20'
                       }`}
                       inputMode="decimal"
                       autoFocus
                     />
                   </div>
                   {fieldErrors.amount && (
                     <p className="text-sm text-red-600 mt-1">{fieldErrors.amount}</p>
                   )}
                 </div>

                 {/* Descrição */}
                 <div className="space-y-2">
                   <Label htmlFor="description" className="text-base">
                     Descrição <span className="text-red-500">*</span>
                   </Label>
                   <Input
                     id="description"
                     value={formData.description}
                     onChange={(e) => {
                       setFormData({ ...formData, description: e.target.value });
                       if (fieldErrors.description) {
                         setFieldErrors(prev => ({ ...prev, description: '' }));
                       }
                     }}
                     placeholder="Ex: Supermercado, Salário, Freelance..."
                     maxLength={200}
                     className={`h-12 w-full bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 placeholder:text-gray-400 ${
                       fieldErrors.description 
                         ? 'border border-red-500 focus:ring-red-200' 
                         : 'focus:ring-primary/20'
                     }`}
                   />
                   {fieldErrors.description && (
                     <p className="text-sm text-red-600 mt-1">{fieldErrors.description}</p>
                   )}
                 </div>

                 {/* Categoria */}
                 <div className="space-y-2">
                   <Label className="text-base">
                     Categoria <span className="text-red-500">*</span>
                   </Label>
                   <Select 
                     value={formData.category} 
                     onValueChange={(value) => {
                       setFormData({ ...formData, category: value });
                       if (fieldErrors.category) {
                         setFieldErrors(prev => ({ ...prev, category: '' }));
                       }
                     }}
                   >
                     <SelectTrigger className={`h-12 w-full bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 ${
                       fieldErrors.category 
                         ? 'border border-red-500 focus:ring-red-200' 
                         : 'focus:ring-primary/20'
                     }`}>
                       <SelectValue placeholder="Selecione uma categoria" />
                     </SelectTrigger>
                     <SelectContent>
                       {filteredCategories.map((cat) => (
                         <SelectItem key={cat.value} value={cat.value}>
                           <div className="flex items-center gap-2">
                             <span>{cat.icon}</span>
                             <span>{cat.label}</span>
                           </div>
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   {fieldErrors.category && (
                     <p className="text-sm text-red-600 mt-1">{fieldErrors.category}</p>
                   )}
                 </div>

                 {/* Data */}
                 <div className="space-y-2">
                   <Label htmlFor="date" className="text-base">Data</Label>
                   <div className="relative">
                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                     <Input
                       id="date"
                       type="date"
                       value={formData.date}
                       onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                       max={new Date().toISOString().split('T')[0]}
                       className="pl-10 h-12 w-full bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20"
                     />
                   </div>
                 </div>

                 {/* Botões */}
                 <div className="flex gap-3 pt-4">
                   <Button
                     type="button"
                     variant="outline"
                     onClick={closeModal}
                     className="flex-1 h-12 font-medium"
                     disabled={isSubmitting}
                   >
                     Cancelar
                   </Button>
                   <Button
                     type="submit"
                     className="flex-1 h-12 font-bold text-white"
                     style={{
                       backgroundColor: transactionType === 'income' ? '#16a34a' : '#dc2626',
                       color: 'white'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.backgroundColor = transactionType === 'income' ? '#15803d' : '#b91c1c';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.backgroundColor = transactionType === 'income' ? '#16a34a' : '#dc2626';
                     }}
                     disabled={isSubmitting}
                   >
                     {isSubmitting ? 'Salvando...' : 'Salvar'}
                   </Button>
                 </div>
               </>
             )}
           </form>
         </DialogContent>
       </Dialog>
    </div>
  );
}
