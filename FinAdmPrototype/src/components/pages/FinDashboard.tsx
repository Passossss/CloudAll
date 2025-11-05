import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target, PiggyBank, ArrowUpRight, ArrowDownRight, Plus, Shield, Settings, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';

interface FinDashboardProps {
  onPageChange?: (page: string) => void;
}

export function FinDashboard({ onPageChange }: FinDashboardProps) {
  const { isAdmin, user } = useAuth();
  const { transactions, loading, stats } = useTransactions();
  
  const totalReceitas = stats?.income || 0;
  const totalDespesas = Math.abs(stats?.expenses || 0);
  const saldoAtual = totalReceitas - totalDespesas;
  const crescimentoReceitas = '+0%';
  const crescimentoDespesas = '+0%';
  
  // Pegar últimas 5 transações recentes
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      description: t.description || 'Sem descrição',
      amount: t.type === 'income' ? t.amount : -Math.abs(t.amount),
      category: 'Categoria',
      date: new Date(t.date).toISOString().split('T')[0],
      type: t.type,
    }));

  // Dados simplificados para gráficos (podem ser melhorados com dados históricos)
  const balanceData = [
    { month: 'Jan', receitas: 0, despesas: 0 },
    { month: 'Fev', receitas: 0, despesas: 0 },
    { month: 'Mar', receitas: 0, despesas: 0 },
    { month: 'Abr', receitas: 0, despesas: 0 },
    { month: 'Mai', receitas: totalReceitas, despesas: totalDespesas },
    { month: 'Jun', receitas: totalReceitas, despesas: totalDespesas },
  ];

  const categoryData = [
    { name: 'Geral', value: totalDespesas, color: '#f87b07' },
  ];

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1>Olá, {user?.name || 'Usuário'}! 👋</h1>
            {isAdmin && (
              <Badge className="bg-gradient-to-r from-primary to-accent text-white shadow-sm">
                <Shield className="w-3 h-3 mr-1" />
                Admin Dashboard
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {isAdmin 
              ? "Painel administrativo - Visão geral do sistema e suas finanças" 
              : "Aqui está um resumo das suas finanças hoje"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => onPageChange?.('transactions')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className="text-2xl font-semibold text-primary">
                  R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                  <span className="text-sm text-green-500 dark:text-green-400">+5.2% vs mês anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                  <span className="text-sm text-green-500 dark:text-green-400">{crescimentoReceitas}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowDownRight className="w-4 h-4 text-red-500 dark:text-red-400 mr-1" />
                  <span className="text-sm text-red-500 dark:text-red-400">{crescimentoDespesas}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meta de Economia</p>
                <p className="text-2xl font-semibold">R$ 2.000,00</p>
                <div className="flex items-center mt-1">
                  <div className="w-16 h-2 bg-muted rounded-full mr-2">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={balanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <p className="text-sm text-muted-foreground">Este mês</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium ml-auto">R$ {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transações Recentes</CardTitle>
              <p className="text-sm text-muted-foreground">Últimas 5 movimentações</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPageChange?.('transactions')}
            >
              Ver Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                    ) : (
                      <ArrowDownRight className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{transaction.category}</Badge>
                      <span className="text-sm text-muted-foreground">{transaction.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-primary/20"
          onClick={() => onPageChange?.('transactions')}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium">Nova Receita</h3>
            <p className="text-sm text-muted-foreground">Adicionar entrada de dinheiro</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-red-200"
          onClick={() => onPageChange?.('transactions')}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-medium">Nova Despesa</h3>
            <p className="text-sm text-muted-foreground">Registrar um gasto</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <PiggyBank className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium">Definir Meta</h3>
            <p className="text-sm text-muted-foreground">Criar objetivo de economia</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}