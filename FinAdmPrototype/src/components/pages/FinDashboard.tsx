import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target, PiggyBank, ArrowUpRight, ArrowDownRight, Plus, Shield, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const balanceData = [
  { month: 'Jan', receitas: 4500, despesas: 3200 },
  { month: 'Fev', receitas: 5200, despesas: 3800 },
  { month: 'Mar', receitas: 4800, despesas: 3400 },
  { month: 'Abr', receitas: 5500, despesas: 4100 },
  { month: 'Mai', receitas: 6200, despesas: 4500 },
  { month: 'Jun', receitas: 5800, despesas: 4200 },
];

const categoryData = [
  { name: 'Alimentação', value: 1200, color: '#f87b07' },
  { name: 'Transporte', value: 800, color: '#fdc570' },
  { name: 'Lazer', value: 450, color: '#10b981' },
  { name: 'Saúde', value: 300, color: '#3b82f6' },
  { name: 'Outros', value: 250, color: '#8b5cf6' },
];

const recentTransactions = [
  { id: 1, description: 'Supermercado Extra', amount: -185.50, category: 'Alimentação', date: '2024-12-09', type: 'expense' },
  { id: 2, description: 'Salário', amount: 4500.00, category: 'Salário', date: '2024-12-05', type: 'income' },
  { id: 3, description: 'Uber', amount: -32.00, category: 'Transporte', date: '2024-12-08', type: 'expense' },
  { id: 4, description: 'Netflix', amount: -45.90, category: 'Lazer', date: '2024-12-07', type: 'expense' },
  { id: 5, description: 'Freelance', amount: 800.00, category: 'Trabalho', date: '2024-12-06', type: 'income' },
];

export function FinDashboard() {
  const { isAdmin } = useAuth();
  const totalReceitas = balanceData[balanceData.length - 1]?.receitas || 0;
  const totalDespesas = balanceData[balanceData.length - 1]?.despesas || 0;
  const saldoAtual = totalReceitas - totalDespesas;
  const crescimentoReceitas = '+12.5%';
  const crescimentoDespesas = '+8.2%';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1>Olá, Gustavo! 👋</h1>
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
          {isAdmin && (
            <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar Sistema
            </Button>
          )}
          <Button className="bg-primary hover:bg-primary/90">
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
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+5.2% vs mês anterior</span>
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
                <p className="text-2xl font-semibold text-green-600">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">{crescimentoReceitas}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-semibold text-red-600">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500">{crescimentoDespesas}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
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
            <Button variant="outline" size="sm">Ver Todas</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                    ) : (
                      <ArrowDownRight className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
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
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
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
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium">Nova Receita</h3>
            <p className="text-sm text-muted-foreground">Adicionar entrada de dinheiro</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border-red-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
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