
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Calendar, CreditCard, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentMetricsProps {
  assinatura?: any;
}

const PaymentMetrics = ({ assinatura }: PaymentMetricsProps) => {
  // Valor padrão atual do sistema: R$ 250,00
  const valorPadrao = 250.00;

  const calcularEconomiaTotal = () => {
    if (!assinatura || !assinatura.valor_original || !assinatura.percentual_desconto) return 0;
    const economia = assinatura.valor_original - assinatura.valor;
    return economia;
  };

  const calcularProximoVencimento = () => {
    if (!assinatura) return 'N/A';
    return new Date(assinatura.proximo_pagamento).toLocaleDateString('pt-BR');
  };

  const formatarPeriodo = (meses: number) => {
    if (meses === 1) return 'Mensal';
    if (meses === 6) return 'Semestral';
    if (meses === 12) return 'Anual';
    return `${meses} meses`;
  };

  const getStatusText = () => {
    if (!assinatura) return 'Inativa';
    
    switch (assinatura.status) {
      case 'ativa':
        return 'Ativa';
      case 'vencida':
        return 'Vencida';
      case 'pendente':
        return 'Pendente';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Inativa';
    }
  };

  const getStatusColor = () => {
    if (!assinatura) return 'text-red-800';
    
    switch (assinatura.status) {
      case 'ativa':
        return 'text-green-800';
      case 'vencida':
        return 'text-red-800';
      case 'pendente':
        return 'text-yellow-800';
      case 'cancelada':
        return 'text-gray-800';
      default:
        return 'text-red-800';
    }
  };

  // Corrigir valor para usar o valor real da assinatura ou valor padrão
  const valorAtual = assinatura?.valor || valorPadrao;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {assinatura?.percentual_desconto > 0 ? 'Economia Total' : 'Valor Pago'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800">
            {assinatura?.percentual_desconto > 0 ? (
              formatCurrency(calcularEconomiaTotal())
            ) : (
              formatCurrency(valorAtual)
            )}
          </div>
          <p className="text-xs text-green-600 mt-1">
            {assinatura?.percentual_desconto > 0 
              ? `${assinatura.percentual_desconto}% de desconto`
              : 'Valor atual da assinatura'
            }
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximo Vencimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">
            {calcularProximoVencimento()}
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {assinatura ? `${assinatura.dias_restantes || 0} dias restantes` : 'Sem assinatura'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-800">
            {assinatura ? formatarPeriodo(assinatura.periodo_meses || 1) : 'Nenhum'}
          </div>
          <p className="text-xs text-purple-600 mt-1">
            {formatCurrency(valorAtual)} total
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Status da Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            {assinatura?.status === 'ativa' ? 'Tudo funcionando' : 'Ação necessária'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMetrics;
