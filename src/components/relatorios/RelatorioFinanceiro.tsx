
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Clock,
  Users,
  Calendar
} from "lucide-react";
import { useRelatoriosFinanceiros } from '@/hooks/useRelatoriosFinanceiros';

interface RelatorioFinanceiroProps {
  filtros: any;
}

const RelatorioFinanceiro = ({ filtros }: RelatorioFinanceiroProps) => {
  const { dados, loading } = useRelatoriosFinanceiros();

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { variant: any; label: string; icon: any } } = {
      'pago': { variant: 'default', label: 'Pago', icon: TrendingUp },
      'pendente': { variant: 'secondary', label: 'Pendente', icon: Clock },
      'parcial': { variant: 'outline', label: 'Parcial', icon: AlertTriangle },
      'atrasado': { variant: 'destructive', label: 'Atrasado', icon: TrendingDown }
    };

    const config = statusMap[status] || { variant: 'secondary', label: status, icon: Clock };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Faturamento Realizado</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(dados.faturamento_realizado)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Faturamento Total</p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(dados.faturamento_total)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Faturamento Pendente</p>
                <p className="text-2xl font-bold text-orange-800">
                  {formatCurrency(dados.faturamento_pendente)}
                </p>
                <Progress 
                  value={dados.faturamento_total > 0 ? (dados.faturamento_realizado / dados.faturamento_total) * 100 : 0} 
                  className="mt-2 h-2"
                />
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Consultas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Total de Consultas</p>
                <p className="text-2xl font-bold text-purple-800">
                  {dados.total_consultas}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-700">Consultas Pagas</p>
                <p className="text-2xl font-bold text-teal-800">
                  {dados.consultas_pagas}
                </p>
                <p className="text-xs text-teal-600">
                  {dados.total_consultas > 0 
                    ? Math.round((dados.consultas_pagas / dados.total_consultas) * 100) 
                    : 0}% do total
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Ticket Médio</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {formatCurrency(dados.ticket_medio)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes */}
      {dados.transacoes_recentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transações Recentes ({dados.transacoes_recentes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {dados.transacoes_recentes.map((transacao) => (
                  <div key={transacao.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{transacao.paciente}</h4>
                          {getStatusBadge(transacao.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(transacao.data)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(transacao.valor)}
                        </p>
                        {transacao.metodo && transacao.metodo !== 'N/A' && (
                          <p className="text-xs text-gray-500">
                            {transacao.metodo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Valores a Receber */}
      {dados.valores_receber.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Valores a Receber ({dados.valores_receber.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {dados.valores_receber.map((conta) => (
                  <div key={conta.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{conta.paciente}</h4>
                          {getStatusBadge(conta.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(conta.data)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(conta.valor_total)}
                        </p>
                        <p className="text-sm text-green-600">
                          Pago: {formatCurrency(conta.valor_pago)}
                        </p>
                        <p className="text-sm text-red-600">
                          Pendente: {formatCurrency(conta.valor_pendente)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Métodos de Pagamento */}
      {dados.metodos_pagamento.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dados.metodos_pagamento.map((metodo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{metodo.metodo}</p>
                    <p className="text-sm text-gray-600">{metodo.percentual.toFixed(1)}% do total</p>
                  </div>
                  <p className="font-bold text-lg text-green-600">
                    {formatCurrency(metodo.valor)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há dados */}
      {dados.total_consultas === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              Nenhuma consulta encontrada para os filtros selecionados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RelatorioFinanceiro;
