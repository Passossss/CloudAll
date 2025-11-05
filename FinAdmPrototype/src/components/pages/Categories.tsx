import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useTransactions } from '../../hooks/useTransactions';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Tag } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  food: 'Alimentação',
  transport: 'Transporte',
  entertainment: 'Entretenimento',
  shopping: 'Compras',
  bills: 'Contas',
  health: 'Saúde',
  education: 'Educação',
  salary: 'Salário',
  freelance: 'Freelance',
  investment: 'Investimentos',
  gift: 'Presentes',
  other: 'Outros',
};

const categoryPalette: string[] = [
  '#10b981',
  '#3b82f6',
  '#f97316',
  '#8b5cf6',
  '#facc15',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
  '#22d3ee',
  '#a855f7',
];

const periodOptions = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '1y', label: 'Últimos 12 meses' },
];

export function Categories() {
  console.log('[Categories] Componente iniciado');
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [period, setPeriod] = useState<string>('30d');

  const {
    users,
    loading: loadingUsers,
    error: usersError,
  } = useAdminUsers();

  console.log('[Categories] useAdminUsers retornou:', { 
    users: users?.length, 
    loadingUsers, 
    usersError: usersError?.message 
  });

  const filters = useMemo(() => ({
    userId: selectedUserId || undefined,
    limit: 0,
  }), [selectedUserId]);

  const {
    categories,
    stats,
    loading,
    error,
    loadStats,
  } = useTransactions(filters);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }
    
    // Converter período para datas from/to
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    const fromStr = startDate.toISOString().split('T')[0];
    const toStr = endDate.toISOString().split('T')[0];
    
    loadStats(fromStr, toStr).catch((err) => {
      console.error('Erro ao atualizar estatísticas de categorias:', err);
    });
  }, [selectedUserId, period, loadStats]);

  const isLoading = loading || loadingUsers;
  const combinedError = error || usersError;

  console.log('[Categories] Estado:', {
    isLoading,
    combinedError: combinedError?.message,
    categories: categories?.length,
    selectedUserId,
  });

  const totalCategories = categories?.length || 0;
  const totalTransactions = stats?.count ?? 0;
  const totalExpenses = stats?.expenses ?? 0;
  const totalIncome = stats?.income ?? 0;

  const chartData = (categories || []).map((category, index) => ({
    name: categoryLabels[category.category] || category.category,
    value: Math.abs(category.total),
    color: categoryPalette[index % categoryPalette.length],
    type: category.type,
    count: category.count,
  }));

  const expenseCategories = (categories || []).filter((category) => category.type === 'expense');
  const incomeCategories = (categories || []).filter((category) => category.type === 'income');

  if (isLoading) {
    return <LoadingState message="Carregando categorias..." />;
  }

  if (combinedError) {
    return <ErrorState error={combinedError} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore o uso de categorias de despesas e receitas a partir dos dados reais das transações
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                Selecione um usuário para ver detalhes
              </SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedUserId ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Selecione um usuário para visualizar as categorias utilizadas nas transações.
          </CardContent>
        </Card>
      ) : totalCategories === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Nenhuma transação encontrada para o período selecionado.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Categorias ativas</p>
                    <p className="text-2xl font-semibold">{totalCategories}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Tag className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800">
              <CardContent className="p-6">
                <p className="text-sm text-green-700 dark:text-green-300">Receitas</p>
                <p className="text-2xl font-semibold text-green-800 dark:text-green-100">
                  R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-green-700/70 dark:text-green-300/80 mt-2">
                  {incomeCategories.length} categoria(s)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:border-red-800">
              <CardContent className="p-6">
                <p className="text-sm text-red-700 dark:text-red-300">Despesas</p>
                <p className="text-2xl font-semibold text-red-800 dark:text-red-100">
                  R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-red-700/70 dark:text-red-300/80 mt-2">
                  {expenseCategories.length} categoria(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Transações lançadas</p>
                <p className="text-2xl font-semibold">{totalTransactions}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Considerando o período selecionado
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Proporção dos valores por categoria no período selecionado
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((item, index) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string, item: any) => [
                          `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                          `${name} — ${item.payload.type === 'income' ? 'Receita' : 'Despesa'}`,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo por Categoria</CardTitle>
                <p className="text-sm text-muted-foreground">Valores absolutos das categorias no período</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {(categories || []).map((category, index) => (
                  <div
                    key={`${category.category}-${category.type}`}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {categoryLabels[category.category] || category.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {category.count} lançamento(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={category.type === 'income' ? 'default' : 'secondary'} className="mb-2">
                        {category.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                      <p className="font-semibold">
                        R$ {Math.abs(category.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}