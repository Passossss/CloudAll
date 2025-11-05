import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Search, ArrowUpRight, ArrowDownRight, Edit, Trash2, Calendar, Loader2 } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const categories = ['food', 'transport', 'entertainment', 'shopping', 'bills', 'health', 'education', 'salary', 'freelance', 'investment', 'gift', 'other'];
const categoryLabels: Record<string, string> = {
  'food': 'Alimentação',
  'transport': 'Transporte',
  'entertainment': 'Lazer',
  'shopping': 'Compras',
  'bills': 'Contas',
  'health': 'Saúde',
  'education': 'Educação',
  'salary': 'Salário',
  'freelance': 'Freelance',
  'investment': 'Investimentos',
  'gift': 'Presente',
  'other': 'Outros'
};

export function Transactions() {
  console.log('[Transactions] Iniciando componente');
  
  // Hooks - SEMPRE devem ser chamados na mesma ordem
  const auth = useAuth();
  const user = auth?.user;
  const isAdmin = auth?.isAdmin || false;
  
  console.log('[Transactions] Auth carregado:', { user, isAdmin });

  const transactionFilters = useMemo(() => {
    // Para admins, passar userId: undefined explicitamente para buscar todas as transações
    // Para usuários normais, filtrar apenas suas transações
    return isAdmin ? { userId: undefined } : (user ? { userId: user.id } : {});
  }, [isAdmin, user]);

  const transactionHook = useTransactions(transactionFilters);
  const transactions = transactionHook?.transactions || [];
  const loading = transactionHook?.loading || false;
  const createTransaction = transactionHook?.createTransaction;
  const updateTransaction = transactionHook?.updateTransaction;
  const deleteTransaction = transactionHook?.deleteTransaction;
  const stats = transactionHook?.stats;
  const refreshTransactions = transactionHook?.refreshTransactions;
  
  console.log('[Transactions] useTransactions carregado:', { transactions: transactions.length, loading });

  const adminHook = useAdminUsers();
  const allUsers = adminHook?.users || [];
  
  console.log('[Transactions] useAdminUsers carregado:', { allUsers: allUsers.length });
  
  // Estados
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('all');
  
  // Form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState('');
  const [userId, setUserId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Validações
  const [errors, setErrors] = useState({
    description: '',
    amount: '',
    category: '',
    userId: '',
    general: ''
  });

  useEffect(() => {
    console.log('[Transactions] Dialog state:', isDialogOpen);
  }, [isDialogOpen]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tx.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;
      const matchesType = filterType === 'all' || tx.type === filterType;
      const matchesUser = !selectedUserId || selectedUserId === 'all' || tx.userId === selectedUserId;
      return matchesSearch && matchesCategory && matchesType && matchesUser;
    });
  }, [transactions, searchTerm, filterCategory, filterType, selectedUserId]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setType('expense');
    setDate(new Date().toISOString().split('T')[0]);
    setUserId(user?.id || '');
    setEditingId(null);
    setErrors({
      description: '',
      amount: '',
      category: '',
      userId: '',
      general: ''
    });
  };

  const openDialog = () => {
    console.log('[Transactions] Abrindo dialog');
    try {
      resetForm();
      setIsDialogOpen(true);
    } catch (error) {
      console.error('[Transactions] Erro ao abrir dialog:', error);
      toast.error('Erro ao abrir formulário');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Transactions] Salvando transação');
    
    // Limpar erros anteriores
    setErrors({
      description: '',
      amount: '',
      category: '',
      userId: '',
      general: ''
    });
    
    try {
      let hasErrors = false;
      const newErrors = {
        description: '',
        amount: '',
        category: '',
        userId: '',
        general: ''
      };

      // Validar descrição
      if (!description || !description.trim()) {
        newErrors.description = 'Descrição é obrigatória';
        hasErrors = true;
      } else if (description.trim().length < 3) {
        newErrors.description = 'Descrição deve ter no mínimo 3 caracteres';
        hasErrors = true;
      } else if (description.trim().length > 200) {
        newErrors.description = 'Descrição deve ter no máximo 200 caracteres';
        hasErrors = true;
      }

      // Validar valor
      if (!amount || !amount.trim()) {
        newErrors.amount = 'Valor é obrigatório';
        hasErrors = true;
      } else {
        // Remover pontos de milhar e substituir vírgula por ponto
        const normalizedAmount = amount.replace(/\./g, '').replace(',', '.');
        const amountValue = parseFloat(normalizedAmount);
        
        if (isNaN(amountValue)) {
          newErrors.amount = 'Valor deve ser um número válido';
          hasErrors = true;
        } else if (amountValue <= 0) {
          newErrors.amount = 'Valor deve ser maior que zero';
          hasErrors = true;
        } else if (amountValue > 999999999.99) {
          newErrors.amount = 'Valor muito alto (máximo: R$ 999.999.999,99)';
          hasErrors = true;
        } else {
          // Validar máximo de 2 casas decimais
          const decimalParts = normalizedAmount.split('.');
          if (decimalParts.length > 1 && decimalParts[1].length > 2) {
            newErrors.amount = 'Valor deve ter no máximo 2 casas decimais';
            hasErrors = true;
          }
        }
      }

      // Validar categoria
      if (!category || !category.trim()) {
        newErrors.category = 'Selecione uma categoria';
        hasErrors = true;
      } else if (!categories.includes(category)) {
        newErrors.category = 'Categoria inválida';
        hasErrors = true;
      }

      // Validar userId para admin
      if (isAdmin) {
        if (!userId || !userId.trim()) {
          newErrors.userId = 'Selecione um usuário';
          hasErrors = true;
        }
      }

      // Se houver erros, mostrar e parar
      if (hasErrors) {
        setErrors(newErrors);
        const firstError = Object.values(newErrors).find(err => err !== '');
        if (firstError) {
          toast.error(firstError);
        }
        return;
      }

      // Converter e normalizar valor (arredondar para 2 casas decimais)
      const normalizedAmount = amount.replace(/\./g, '').replace(',', '.');
      const amountValue = Math.round(parseFloat(normalizedAmount) * 100) / 100;

      const targetUserId = isAdmin ? userId : (user?.id || '');
      if (!targetUserId) {
        newErrors.general = 'Usuário não identificado';
        setErrors(newErrors);
        toast.error('Usuário não identificado');
        return;
      }

      // Validar e normalizar data
      let finalDate: string;
      if (!date || date.trim() === '') {
        // Se não forneceu data, usar data atual
        finalDate = new Date().toISOString();
      } else {
        // Validar data fornecida
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          newErrors.general = 'Data inválida';
          setErrors(newErrors);
          toast.error('Data inválida');
          return;
        }
        
        // Validar que a data não é muito antiga (mais de 10 anos no passado)
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        if (dateObj < tenYearsAgo) {
          newErrors.general = 'Data não pode ser anterior a 10 anos';
          setErrors(newErrors);
          toast.error('Data não pode ser anterior a 10 anos');
          return;
        }
        
        // Validar que a data não é muito no futuro (mais de 1 ano)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        if (dateObj > oneYearFromNow) {
          newErrors.general = 'Data não pode ser superior a 1 ano no futuro';
          setErrors(newErrors);
          toast.error('Data não pode ser superior a 1 ano no futuro');
          return;
        }
        
        // Converter para ISO string completo para evitar problemas de timezone
        finalDate = dateObj.toISOString();
      }

      const data = {
        userId: targetUserId,
        category: category.trim(),
        amount: amountValue,
        description: description.trim(),
        type,
        date: finalDate,
      };

      console.log('[Transactions] Dados validados:', data);

      if (editingId) {
        await updateTransaction(editingId, data);
        toast.success('Transação atualizada com sucesso');
      } else {
        await createTransaction(data);
        toast.success('Transação criada com sucesso');
      }
      
      await refreshTransactions();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('[Transactions] Erro ao salvar:', error);
      const errorMsg = error.response?.data?.error?.message || error.message || 'Erro ao salvar transação';
      setErrors(prev => ({ ...prev, general: errorMsg }));
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast.success('Transação excluída');
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const totalIncome = stats?.income || 0;
  const totalExpenses = Math.abs(stats?.expenses || 0);
  const balance = totalIncome - totalExpenses;

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  console.log('[Transactions] Renderizando componente');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Transações</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie suas movimentações financeiras</p>
        </div>
        <Button 
          onClick={openDialog} 
          className="font-bold"
          style={{ backgroundColor: '#f97316', color: 'white' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        console.log('[Transactions] Dialog mudou:', open);
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar' : 'Nova'} Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {errors.general && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
                {errors.general}
              </div>
            )}

            {isAdmin && allUsers.length > 0 && (
              <div>
                <Label>Usuário <span className="text-red-500">*</span></Label>
                <Select value={userId} onValueChange={(v) => {
                  setUserId(v);
                  setErrors(prev => ({ ...prev, userId: '' }));
                }}>
                  <SelectTrigger className={errors.userId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.userId && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.userId}</p>
                )}
              </div>
            )}
            
            <div>
              <Label>Descrição <span className="text-red-500">*</span></Label>
              <Input 
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors(prev => ({ ...prev, description: '' }));
                }}
                placeholder="Ex: Supermercado"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor <span className="text-red-500">*</span></Label>
                <Input 
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir apenas números, vírgula e ponto
                    const cleaned = value.replace(/[^0-9,.]/g, '');
                    setAmount(cleaned);
                    setErrors(prev => ({ ...prev, amount: '' }));
                  }}
                  placeholder="100,50"
                  inputMode="decimal"
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.amount}</p>
                )}
              </div>
              
              <div>
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Categoria <span className="text-red-500">*</span></Label>
              <Select value={category} onValueChange={(v) => {
                setCategory(v);
                setErrors(prev => ({ ...prev, category: '' }));
              }}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.category}</p>
              )}
            </div>
            
            <div>
              <Label>Data</Label>
              <Input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 font-bold"
                style={{ backgroundColor: '#f97316', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
              >
                {editingId ? 'Salvar' : 'Adicionar'}
              </Button>
              <Button 
                type="button" 
                onClick={() => setIsDialogOpen(false)} 
                variant="outline"
                className="flex-1 font-bold"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Receitas</p>
                <p className="text-2xl font-semibold text-green-800 dark:text-green-100">
                  R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">Despesas</p>
                <p className="text-2xl font-semibold text-red-800 dark:text-red-100">
                  R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Saldo</p>
                <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Calendar className={`w-8 h-8 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {isAdmin && allUsers.length > 0 && (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {allUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <p className="text-sm text-muted-foreground">{filteredTransactions.length} transações</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                {isAdmin && <TableHead>Usuário</TableHead>}
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    Nenhuma transação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <span className="font-medium">{tx.description}</span>
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {allUsers.find(u => u.id === tx.userId)?.name || tx.userId}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="secondary">{tx.category ? (categoryLabels[tx.category] || tx.category) : 'Outros'}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(tx.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(tx.id);
                            setDescription(tx.description || '');
                            setAmount(Math.abs(tx.amount).toString().replace('.', ','));
                            setCategory(tx.category || '');
                            setType(tx.type);
                            setDate(tx.date);
                            setUserId(tx.userId);
                            setIsDialogOpen(true);
                          }}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-bold border-0">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(tx.id)}
                                className="font-bold"
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
