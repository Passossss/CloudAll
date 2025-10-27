import { StatCard } from './StatCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, UserX, LogIn, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

const userDistributionData = [
  { name: 'Admin', value: 3, color: '#f97316' },
  { name: 'Usuário Normal', value: 45, color: '#3b82f6' },
  { name: 'Convidado', value: 12, color: '#8b5cf6' },
];

const loginsByWeekData = [
  { week: 'Sem 1', logins: 240 },
  { week: 'Sem 2', logins: 380 },
  { week: 'Sem 3', logins: 290 },
  { week: 'Sem 4', logins: 420 },
];

const monthlyGrowthData = [
  { month: 'Jan', usuarios: 35 },
  { month: 'Fev', usuarios: 42 },
  { month: 'Mar', usuarios: 38 },
  { month: 'Abr', usuarios: 60 },
  { month: 'Mai', usuarios: 55 },
  { month: 'Jun', usuarios: 67 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-600">Visão geral do sistema FinAdmin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Usuários Ativos"
          value="48"
          icon={<Users className="w-6 h-6" />}
          trend={{ value: "+12% no mês anterior", isPositive: true }}
          color="green"
        />
        <StatCard
          title="Usuários Bloqueados"
          value="3"
          icon={<UserX className="w-6 h-6" />}
          trend={{ value: "-2% no mês anterior", isPositive: true }}
          color="red"
        />
        <StatCard
          title="Total de Logins (Mês)"
          value="1,247"
          icon={<LogIn className="w-6 h-6" />}
          trend={{ value: "+8% no mês anterior", isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Permissões Criadas"
          value="12"
          icon={<Shield className="w-6 h-6" />}
          trend={{ value: "+3 este mês", isPositive: true }}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Pie Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Usuários</CardTitle>
            <p className="text-sm text-gray-600">Por tipo de permissão</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {userDistributionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logins by Week Bar Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Logins por Semana</CardTitle>
            <p className="text-sm text-gray-600">Últimas 4 semanas</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loginsByWeekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Bar dataKey="logins" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Growth Chart */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Crescimento de Usuários</CardTitle>
          <p className="text-sm text-gray-600">Novos usuários por mês</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="usuarios" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Novo Usuário</p>
                  <p className="text-sm text-gray-600">Cadastrar novo usuário</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nova Permissão</p>
                  <p className="text-sm text-gray-600">Criar permissão personalizada</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Relatório</p>
                  <p className="text-sm text-gray-600">Gerar relatório detalhado</p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}