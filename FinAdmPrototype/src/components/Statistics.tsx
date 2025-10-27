import { StatCard } from './StatCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Activity, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

const monthlyUserGrowth = [
  { month: 'Jan', usuarios: 28, novos: 8 },
  { month: 'Fev', usuarios: 35, novos: 12 },
  { month: 'Mar', usuarios: 42, novos: 15 },
  { month: 'Abr', usuarios: 38, novos: 9 },
  { month: 'Mai', usuarios: 55, novos: 18 },
  { month: 'Jun', usuarios: 67, novos: 22 },
  { month: 'Jul', usuarios: 73, novos: 19 },
  { month: 'Ago', usuarios: 82, novos: 25 },
  { month: 'Set', usuarios: 76, novos: 14 },
  { month: 'Out', usuarios: 91, novos: 28 },
  { month: 'Nov', usuarios: 105, novos: 32 },
  { month: 'Dez', usuarios: 118, novos: 35 }
];

const dailyAccess = [
  { day: 'Seg', acessos: 142 },
  { day: 'Ter', acessos: 156 },
  { day: 'Qua', acessos: 134 },
  { day: 'Qui', acessos: 178 },
  { day: 'Sex', acessos: 195 },
  { day: 'Sab', acessos: 89 },
  { day: 'Dom', acessos: 67 }
];

const last30DaysAccess = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  acessos: Math.floor(Math.random() * 50) + 100 + (i % 7 < 2 ? -30 : 0) // Menos acessos no fim de semana
}));

const topUsers = [
  { name: 'João Silva', email: 'joao@exemplo.com', logins: 87, lastAccess: '2h atrás' },
  { name: 'Maria Santos', email: 'maria@exemplo.com', logins: 72, lastAccess: '1h atrás' },
  { name: 'Pedro Oliveira', email: 'pedro@exemplo.com', logins: 68, lastAccess: '4h atrás' },
  { name: 'Ana Costa', email: 'ana@exemplo.com', logins: 61, lastAccess: '30m atrás' },
  { name: 'Carlos Lima', email: 'carlos@exemplo.com', logins: 54, lastAccess: '2d atrás' }
];

const systemMetrics = [
  { metric: 'Tempo médio de sessão', value: '24m 15s', trend: '+12%' },
  { metric: 'Taxa de retenção', value: '78%', trend: '+5%' },
  { metric: 'Páginas por sessão', value: '3.4', trend: '+8%' },
  { metric: 'Taxa de abandono', value: '22%', trend: '-3%' }
];

export function Statistics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Estatísticas Gerais</h1>
        <p className="text-gray-600">Análise detalhada do uso do sistema FinAdmin</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuários"
          value="118"
          icon={<Users className="w-6 h-6" />}
          trend={{ value: "+35 este mês", isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Usuários Ativos (30d)"
          value="91"
          icon={<Activity className="w-6 h-6" />}
          trend={{ value: "+22% vs mês anterior", isPositive: true }}
          color="green"
        />
        <StatCard
          title="Crescimento Mensal"
          value="29.7%"
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: "+5.2% vs meta", isPositive: true }}
          color="purple"
        />
        <StatCard
          title="Acessos Hoje"
          value="847"
          icon={<Calendar className="w-6 h-6" />}
          trend={{ value: "+124 vs ontem", isPositive: true }}
          color="orange"
        />
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly User Growth */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Crescimento de Usuários</CardTitle>
            <p className="text-sm text-gray-600">Novos usuários por mês nos últimos 12 meses</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyUserGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Bar dataKey="usuarios" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="novos" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Novos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Access Pattern */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Padrão de Acessos Semanal</CardTitle>
            <p className="text-sm text-gray-600">Média de acessos por dia da semana</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyAccess}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="acessos" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 30 Days Access Trend */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Acessos nos Últimos 30 Dias</CardTitle>
          <p className="text-sm text-gray-600">Histórico detalhado de acessos diários</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last30DaysAccess}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="acessos" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Active Users */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Usuários Mais Ativos</CardTitle>
            <p className="text-sm text-gray-600">Top 5 usuários por número de logins</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{user.logins} logins</p>
                    <p className="text-sm text-gray-600">{user.lastAccess}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Métricas do Sistema</CardTitle>
            <p className="text-sm text-gray-600">Indicadores de performance e engajamento</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{metric.metric}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{metric.value}</p>
                  </div>
                  <div>
                    <Badge 
                      className={`${
                        metric.trend.startsWith('+') || metric.trend.startsWith('-') && metric.metric.includes('abandono')
                          ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {metric.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-semibold text-blue-600 mb-2">96.5%</p>
              <p className="text-sm text-gray-600">Uptime do Sistema</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-semibold text-green-600 mb-2">4.8/5</p>
              <p className="text-sm text-gray-600">Satisfação dos Usuários</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-semibold text-purple-600 mb-2">1,247</p>
              <p className="text-sm text-gray-600">Transações Processadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}