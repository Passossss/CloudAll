import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useTransactionSummary } from "../hooks/useTransactionSummary";
import { Skeleton } from "./ui/skeleton";

export function Reports() {
  const { user } = useUser();
  const [period, setPeriod] = useState("30d");
  const { summary, isLoading } = useTransactionSummary(user?.id || '', period);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalExpenses = Math.abs(summary?.expenses || 0);
  const categoriesWithPercentage = (summary?.categories || []).map(cat => ({
    name: cat.category,
    amount: Math.abs(cat.amount),
    count: cat.count,
    percentage: totalExpenses > 0 ? Math.round((Math.abs(cat.amount) / totalExpenses) * 100) : 0,
    color: getCategoryColor(cat.category)
  }));

  function getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      food: "#ef4444",
      transport: "#3b82f6",
      entertainment: "#8b5cf6",
      health: "#10b981",
      shopping: "#f59e0b",
      education: "#06b6d4",
      salary: "#10b981",
      freelance: "#10b981",
    };
    return colorMap[category.toLowerCase()] || "#f87b07";
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Relatórios</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Análise detalhada das suas finanças</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Semanal</SelectItem>
              <SelectItem value="30d">Mensal</SelectItem>
              <SelectItem value="365d">Anual</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receitas</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(summary?.income || 0)}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Despesas</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary?.balance || 0)}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo do Período */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Período</CardTitle>
            <CardDescription>Visão geral das finanças no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Receitas</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(summary?.income || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `100%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Despesas</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(totalExpenses)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ 
                        width: `${summary?.income ? (totalExpenses / summary.income) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Saldo</span>
                    <span className={`font-semibold ${(summary?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(summary?.balance || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${summary?.income && summary.balance >= 0 ? (summary.balance / summary.income) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gastos por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição das despesas por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : categoriesWithPercentage.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma categoria encontrada</p>
                <p className="text-sm mt-2">Comece registrando suas transações!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoriesWithPercentage.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium capitalize">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{formatCurrency(category.amount)}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: category.color,
                          width: `${category.percentage}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}