import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export function Reports() {
  const mockData = [
    { month: "Janeiro", income: 3200, expenses: 2100, balance: 1100 },
    { month: "Fevereiro", income: 3400, expenses: 2350, balance: 1050 },
    { month: "Março", income: 3240, expenses: 1890, balance: 1350 },
  ];

  const categories = [
    { name: "Alimentação", amount: 680, color: "#ef4444", percentage: 36 },
    { name: "Transporte", amount: 320, color: "#3b82f6", percentage: 17 },
    { name: "Entretenimento", amount: 450, color: "#8b5cf6", percentage: 24 },
    { name: "Saúde", amount: 240, color: "#10b981", percentage: 13 },
    { name: "Outros", amount: 200, color: "#f59e0b", percentage: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Relatórios</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Análise detalhada das suas finanças</p>
        </div>
        
        <div className="flex gap-3">
          <Select defaultValue="monthly">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receitas</p>
                <p className="text-2xl font-bold text-green-600">R$ 9.840,00</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.2% vs mês anterior
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Despesas</p>
                <p className="text-2xl font-bold text-red-600">R$ 6.340,00</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  -3.1% vs mês anterior
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo</p>
                <p className="text-2xl font-bold text-blue-600">R$ 3.500,00</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +15.3% vs mês anterior
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Receitas vs Despesas nos últimos meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{data.month}</span>
                    <span className={`font-semibold ${data.balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {data.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Receitas: R$ {data.income.toLocaleString()}</span>
                      <span>Despesas: R$ {data.expenses.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(data.income / Math.max(...mockData.map(d => d.income))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gastos por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição das despesas por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">R$ {category.amount.toLocaleString()}</span>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}