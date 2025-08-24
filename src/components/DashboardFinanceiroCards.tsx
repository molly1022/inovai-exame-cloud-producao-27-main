
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, TrendingUp, AlertCircle, CheckCircle, Calendar, Users, UserMinus } from 'lucide-react';

interface DashboardFinanceiroCardsProps {
  data: {
    faturamentoHoje: number;
    faturamentoMes: number;
    faturamentoTotal: number;
    faturamentoPendente: number;
    totalConsultas: number;
    consultasPagas: number;
    consultasPendentes: number;
    mediaValorConsulta: number;
    repassesTotalMes: number;
    repassesPendentes: number;
    repassesPagos: number;
    receitaLiquida: number;
  };
}

const DashboardFinanceiroCards = ({ data }: DashboardFinanceiroCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
            <Banknote className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Faturamento Hoje</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="text-2xl font-bold text-green-800 truncate">
            {formatCurrency(data.faturamentoHoje)}
          </div>
          <p className="text-xs text-green-600 mt-1 truncate">
            Recebido hoje
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Faturamento do Mês</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="text-2xl font-bold text-blue-800 truncate">
            {formatCurrency(data.faturamentoMes)}
          </div>
          <p className="text-xs text-blue-600 mt-1 truncate">
            Recebido no mês
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Faturamento Total</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="text-2xl font-bold text-purple-800 truncate">
            {formatCurrency(data.faturamentoTotal)}
          </div>
          <p className="text-xs text-purple-600 mt-1 truncate">
            Total arrecadado
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">A Receber</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="text-2xl font-bold text-red-800 truncate">
            {formatCurrency(data.faturamentoPendente)}
          </div>
          <p className="text-xs text-red-600 mt-1 truncate">
            Pendente de pagamento
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-teal-700 flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Total de Consultas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="text-2xl font-bold text-teal-800">
            {data.totalConsultas}
          </div>
          <p className="text-xs text-teal-600 mt-1 truncate">
            Consultas realizadas
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Consultas Pagas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="text-2xl font-bold text-emerald-800">
            {data.consultasPagas}
          </div>
          <p className="text-xs text-emerald-600 mt-1 truncate">
            {data.totalConsultas > 0 ? Math.round((data.consultasPagas / data.totalConsultas) * 100) : 0}% do total
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Consultas Pendentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="text-2xl font-bold text-amber-800">
            {data.consultasPendentes}
          </div>
          <p className="text-xs text-amber-600 mt-1 truncate">
            {data.totalConsultas > 0 ? Math.round((data.consultasPendentes / data.totalConsultas) * 100) : 0}% do total
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Ticket Médio</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="text-2xl font-bold text-indigo-800 truncate">
            {formatCurrency(data.mediaValorConsulta)}
          </div>
          <p className="text-xs text-indigo-600 mt-1 truncate">
            Por consulta
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
            <UserMinus className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Repasses do Mês</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="text-2xl font-bold text-orange-800 truncate">
            {formatCurrency(data.repassesTotalMes)}
          </div>
          <p className="text-xs text-orange-600 mt-1 truncate">
            Total a pagar médicos
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-cyan-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Receita Líquida</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="text-2xl font-bold text-cyan-800 truncate">
            {formatCurrency(data.receitaLiquida)}
          </div>
          <p className="text-xs text-cyan-600 mt-1 truncate">
            Faturamento - Repasses
          </p>
        </CardContent>
      </Card>

    </div>
  );
};

export default DashboardFinanceiroCards;
