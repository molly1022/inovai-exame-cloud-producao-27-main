
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useRelatoriosAgendamentos } from '@/hooks/useRelatoriosAgendamentos';

interface RelatorioOperacionalProps {
  filtros: any;
}

const RelatorioOperacional = ({ filtros }: RelatorioOperacionalProps) => {
  const { dados, loading } = useRelatoriosAgendamentos(filtros);

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'confirmado':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
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
      {/* Cards de Resumo Operacional */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total de Consultas</p>
                <p className="text-2xl font-bold text-blue-800">
                  {dados.totalAgendamentos}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Consultas Concluídas</p>
                <p className="text-2xl font-bold text-green-800">
                  {dados.concluidos}
                </p>
                <p className="text-xs text-green-600">
                  {dados.totalAgendamentos > 0 
                    ? Math.round((dados.concluidos / dados.totalAgendamentos) * 100) 
                    : 0}% do total
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Agendamentos Pendentes</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {dados.agendados + dados.confirmados}
                </p>
                <p className="text-xs text-yellow-600">
                  Agendados: {dados.agendados} | Confirmados: {dados.confirmados}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Cancelamentos</p>
                <p className="text-2xl font-bold text-red-800">
                  {dados.cancelados}
                </p>
                <p className="text-xs text-red-600">
                  {dados.totalAgendamentos > 0 
                    ? Math.round((dados.cancelados / dados.totalAgendamentos) * 100) 
                    : 0}% do total
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro Operacional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo Financeiro das Operações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Faturamento Total</p>
              <p className="text-xl font-bold text-gray-800">
                {formatCurrency(dados.totalFaturamento)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Total Recebido</p>
              <p className="text-xl font-bold text-green-800">
                {formatCurrency(dados.totalRecebido)}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600">Pendente</p>
              <p className="text-xl font-bold text-orange-800">
                {formatCurrency(dados.totalPendente)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Consultas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Consultas do Período ({dados.agendamentos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {dados.agendamentos.map((agendamento, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(agendamento.status)}
                    <div>
                      <p className="font-medium">{agendamento.pacientes?.nome}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')} - {agendamento.horario}
                      </p>
                      <p className="text-xs text-gray-500">
                        {agendamento.tipo_exame} | {agendamento.medicos?.nome_completo || 'Médico não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(agendamento.status)}>
                      {agendamento.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">
                      {formatCurrency(agendamento.valor_exame || 0)}
                    </p>
                    {agendamento.valor_pago > 0 && (
                      <p className="text-xs text-green-600">
                        Pago: {formatCurrency(agendamento.valor_pago)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {dados.agendamentos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma consulta encontrada para os filtros selecionados</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioOperacional;
