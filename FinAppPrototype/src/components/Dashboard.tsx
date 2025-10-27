import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Badge } from "./ui/badge";

export function Dashboard() {
  const stats = [
    {
      title: "Receitas do Mês",
      value: "R$ 3.240,00",
      change: "+12%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Despesas do Mês",
      value: "R$ 1.890,50",
      change: "-8%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "Saldo Atual",
      value: "R$ 1.349,50",
      change: "+24%",
      trend: "up",
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Usuários Ativos",
      value: "127",
      change: "+3",
      trend: "up",
      icon: Users,
      color: "text-purple-600"
    }
  ];

  const recentTransactions = [
    { id: 1, description: "Salário", amount: 2400.00, type: "Receita", date: "15/03" },
    { id: 2, description: "Supermercado", amount: -156.80, type: "Despesa", date: "14/03" },
    { id: 3, description: "Freelance", amount: 840.00, type: "Receita", date: "13/03" },
    { id: 4, description: "Netflix", amount: -29.90, type: "Despesa", date: "12/03" },
    { id: 5, description: "Uber", amount: -25.50, type: "Despesa", date: "12/03" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Visão geral das suas finanças</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas movimentações financeiras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(Math.abs(transaction.amount))}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metas Financeiras</CardTitle>
            <CardDescription>Acompanhe seu progresso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Economia para viagem</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">R$ 1.300 de R$ 2.000</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Reserva de emergência</span>
                  <span>40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">R$ 2.000 de R$ 5.000</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Curso online</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">R$ 425 de R$ 500</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}