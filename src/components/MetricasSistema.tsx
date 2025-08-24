import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MetricaData {
  id: string;
  clinica_id: string | null;
  data_referencia: string;
  tipo_metrica: string;
  valor: number;
  unidade: string | null;
  metadados: any;
  created_at: string;
}

export function MetricasSistema() {
  const [metricas, setMetricas] = useState<MetricaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetricas();
  }, []);

  const fetchMetricas = async () => {
    try {
      // Para single-tenant, usar dados demo ao invés de tabela inexistente
      const demoMetricas: MetricaData[] = [
        {
          id: '1',
          clinica_id: null,
          data_referencia: new Date().toISOString().split('T')[0],
          tipo_metrica: 'usuarios_ativos',
          valor: 2847,
          unidade: 'usuarios',
          metadados: {},
          created_at: new Date().toISOString()
        },
        {
          id: '2', 
          clinica_id: null,
          data_referencia: new Date().toISOString().split('T')[0],
          tipo_metrica: 'receita_total',
          valor: 24500,
          unidade: 'reais',
          metadados: {},
          created_at: new Date().toISOString()
        }
      ];
      
      setMetricas(demoMetricas);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Processamento dos dados para gráficos
  const processarMetricasParaGraficos = () => {
    const metricasGlobais = metricas.filter(m => m.clinica_id === null);
    
    // Métricas diárias dos últimos 30 dias
    const metricasDiarias = metricasGlobais
      .filter(m => ['usuarios_ativos', 'novos_cadastros', 'receita_diaria'].includes(m.tipo_metrica))
      .reduce((acc: any, metrica) => {
        const data = metrica.data_referencia;
        if (!acc[data]) acc[data] = { data };
        acc[data][metrica.tipo_metrica] = metrica.valor;
        return acc;
      }, {});

    return Object.values(metricasDiarias).slice(-30);
  };

  const processarStatusClinicas = () => {
    const statusMetricas = metricas.filter(m => m.tipo_metrica === 'status_clinicas' && m.clinica_id === null);
    if (statusMetricas.length === 0) return [];

    const ultima = statusMetricas[0];
    if (!ultima.metadados) return [];

    return Object.entries(ultima.metadados).map(([status, quantidade]: [string, any]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: quantidade,
      color: getStatusColor(status)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return '#22c55e';
      case 'inativa': return '#6b7280';
      case 'suspensa': return '#eab308';
      case 'bloqueada': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const calcularTendencia = (tipoMetrica: string) => {
    const metricasFiltradas = metricas
      .filter(m => m.tipo_metrica === tipoMetrica && m.clinica_id === null)
      .slice(0, 7); // Últimos 7 dias

    if (metricasFiltradas.length < 2) return { tendencia: 0, isPositive: true };

    const valorAtual = metricasFiltradas[0]?.valor || 0;
    const valorAnterior = metricasFiltradas[1]?.valor || 0;
    
    const tendencia = valorAnterior > 0 ? ((valorAtual - valorAnterior) / valorAnterior) * 100 : 0;
    
    return {
      tendencia: Math.abs(tendencia),
      isPositive: valorAtual >= valorAnterior
    };
  };

  const metricsCards = [
    {
      title: 'Receita Total',
      value: 'R$ 24.500,00',
      change: calcularTendencia('receita_total'),
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Clínicas Ativas',
      value: '127',
      change: calcularTendencia('clinicas_ativas'),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Usuários Ativos',
      value: '2.847',
      change: calcularTendencia('usuarios_ativos'),
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'Agendamentos/Dia',
      value: '1.245',
      change: calcularTendencia('agendamentos_diarios'),
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  const graficoDados = processarMetricasParaGraficos();
  const statusDados = processarStatusClinicas();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-1 text-xs">
                  {metric.change.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={metric.change.isPositive ? 'text-green-600' : 'text-red-600'}>
                    {metric.change.tendencia.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos detalhados */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="growth">Crescimento</TabsTrigger>
          <TabsTrigger value="status">Status das Clínicas</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividade dos Últimos 30 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={graficoDados}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="usuarios_ativos" 
                      stroke="#8884d8" 
                      name="Usuários Ativos"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="novos_cadastros" 
                      stroke="#82ca9d" 
                      name="Novos Cadastros"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Status das Clínicas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={statusDados}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusDados.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Crescimento do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={graficoDados}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="novos_cadastros" fill="#8884d8" name="Novas Clínicas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {statusDados.map((status, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span>Clínicas {status.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{status.value}</div>
                  <Badge 
                    style={{ backgroundColor: status.color }}
                    className="text-white mt-2"
                  >
                    {((status.value / statusDados.reduce((acc, s) => acc + s.value, 0)) * 100).toFixed(1)}%
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Receita Diária</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={graficoDados}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`R$ ${value}`, 'Receita']} />
                  <Bar dataKey="receita_diaria" fill="#22c55e" name="Receita Diária" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}