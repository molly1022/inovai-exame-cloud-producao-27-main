import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Target, TrendingDown } from 'lucide-react';

export const AdminFinancialCharts = () => {
  // Dados mockados para demonstração até implementar RPC functions
  const faturamentoMockData = [
    { mes: 'Jan', valor: 12500, clinicas: 5 },
    { mes: 'Fev', valor: 15600, clinicas: 6 },
    { mes: 'Mar', valor: 18200, clinicas: 7 },
    { mes: 'Abr', valor: 16800, clinicas: 6 },
    { mes: 'Mai', valor: 21300, clinicas: 8 },
    { mes: 'Jun', valor: 19700, clinicas: 7 }
  ];

  const vencimentosMockData = [
    { status: 'Ativo', quantidade: 12, cor: '#10b981' },
    { status: 'Vence em 7 dias', quantidade: 3, cor: '#f59e0b' },
    { status: 'Vencido', quantidade: 1, cor: '#ef4444' },
    { status: 'Suspenso', quantidade: 2, cor: '#6b7280' }
  ];

  const metricas = {
    faturamento_atual: 19700,
    faturamento_projetado: 24500,
    conversao_rate: 65.2,
    churn_rate: 8.5,
    crescimento_mensal: 12.3,
    total_trial: 8,
    total_pagas: 15
  };

  const faturamentoData = [
    { name: 'Atual', valor: metricas.faturamento_atual, fill: '#3b82f6' },
    { name: 'Projetado', valor: metricas.faturamento_projetado, fill: '#10b981' },
  ];

  const conversaoData = [
    { name: 'Trial', value: metricas.total_trial, fill: '#f59e0b' },
    { name: 'Pagantes', value: metricas.total_pagas, fill: '#10b981' },
  ];

  const cores = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {metricas.faturamento_atual.toFixed(2)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {metricas.crescimento_mensal >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(metricas.crescimento_mensal).toFixed(1)}% vs projeção
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projeção Futuro</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {metricas.faturamento_projetado.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Potencial máximo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metricas.conversao_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Trial → Pagante
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metricas.churn_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa cancelamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento Atual vs Projetado */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Atual vs Projetado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={faturamentoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição Trial vs Pagantes */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Clínicas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={conversaoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {conversaoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Faturamento Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Faturamento (6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={faturamentoMockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']} />
              <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status das Clínicas */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Clínicas por Vencimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vencimentosMockData.map((item, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div 
                  className="w-8 h-8 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: item.cor }}
                />
                <div className="text-2xl font-bold">{item.quantidade}</div>
                <div className="text-sm text-muted-foreground">{item.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nota sobre dados mockados */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              <strong>Demonstração:</strong> Estes dados são simulados para fins de apresentação. 
              Os dados reais serão carregados após implementação das funções RPC no banco central.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinancialCharts;