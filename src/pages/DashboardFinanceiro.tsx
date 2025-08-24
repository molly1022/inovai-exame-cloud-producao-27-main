
import React, { useState } from 'react';
import { useDashboardFinanceiroOptimized } from '@/hooks/useDashboardFinanceiroOptimized';
import DashboardFinanceiroCards from '@/components/DashboardFinanceiroCards';
import TransacoesRecentesTable from '@/components/TransacoesRecentesTable';
import DashboardFinanceiroFilters, { FilterState } from '@/components/DashboardFinanceiroFilters';
import ValoresReceberTable from '@/components/ValoresReceberTable';
import FluxoCaixaChart from '@/components/FluxoCaixaChart';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, BarChart3, LineChart, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DashboardFinanceiro = () => {
  const [filters, setFilters] = useState<FilterState>({
    periodo: 'mes_atual',
    statusFinanceiro: 'todos',
    medicoId: 'todos',
    convenioId: 'todos',
    tipoExame: 'todos'
  });
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  
  const { data, loading, error, refetch } = useDashboardFinanceiroOptimized(filters);

  const handleFiltersChange = (newFilters: FilterState) => {
    console.log('Dashboard Financeiro - Filtros recebidos:', newFilters);
    setFilters(newFilters);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados: {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-2"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando dados financeiros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros Avançados */}
      <DashboardFinanceiroFilters
        onFiltersChange={handleFiltersChange}
        medicos={data.medicosList}
        convenios={data.conveniosList}
        categorias={data.categoriasList}
        initialFilters={filters}
      />

      {/* Cards de Métricas */}
      <DashboardFinanceiroCards data={data} />

      {/* Gráfico de Fluxo de Caixa */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Análise Temporal</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Barras
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
            className="flex items-center gap-2"
          >
            <LineChart className="h-4 w-4" />
            Linha
          </Button>
        </div>
      </div>
      
      <FluxoCaixaChart data={data.fluxoCaixaData} tipo={chartType} />

      {/* Tabs para organizar as informações */}
      <Tabs defaultValue="transacoes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transacoes">
            Transações Realizadas ({data.transacoesRecentes.length})
          </TabsTrigger>
          <TabsTrigger value="a-receber">
            Valores a Receber ({data.agendamentosFuturos.length + data.pagamentosVencidos.length})
          </TabsTrigger>
          <TabsTrigger value="resumo">Resumo Executivo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transacoes" className="space-y-6">
          {data.transacoesRecentes.length > 0 ? (
            <TransacoesRecentesTable transacoes={data.transacoesRecentes} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma transação encontrada para os filtros aplicados.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="a-receber" className="space-y-6">
          {(data.agendamentosFuturos.length > 0 || data.pagamentosVencidos.length > 0) ? (
            <ValoresReceberTable 
              agendamentosFuturos={data.agendamentosFuturos}
              pagamentosVencidos={data.pagamentosVencidos}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum valor a receber encontrado para os filtros aplicados.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="resumo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Resumo do Período</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Recebido:</span>
                  <span className="font-bold text-blue-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                      .format(data.faturamentoTotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total a Receber:</span>
                  <span className="font-bold text-blue-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                      .format(data.faturamentoPendente || 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-blue-700 font-semibold">Fluxo Total:</span>
                  <span className="font-bold text-blue-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                      .format((data.faturamentoTotal || 0) + (data.faturamentoPendente || 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Indicadores</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-700">Taxa de Conversão:</span>
                  <span className="font-bold text-green-900">
                    {data.taxaConversao || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Ticket Médio:</span>
                  <span className="font-bold text-green-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                      .format(data.mediaValorConsulta || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Consultas Pendentes:</span>
                  <span className="font-bold text-green-900">
                    {data.consultasPendentes || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Total de Consultas:</span>
                  <span className="font-bold text-green-900">
                    {data.totalConsultas || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardFinanceiro;
