
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

interface CardsResumoProps {
  estatisticas: any;
  dadosFinanceiros: any;
}

const CardsResumo = ({ estatisticas, dadosFinanceiros }: CardsResumoProps) => {
  if (!estatisticas || !dadosFinanceiros) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  const calcularPercentual = (valor: number, total: number) => {
    return total > 0 ? ((valor / total) * 100).toFixed(1) : '0.0';
  };

  const cards = [
    {
      title: "Total Consultas",
      value: estatisticas.totalConsultas.toLocaleString(),
      subtitle: `Hoje: ${estatisticas.consultasHoje} | Semana: ${estatisticas.consultasSemana}`,
      icon: Calendar,
      color: "bg-blue-500"
    },
    {
      title: "Faturamento Total",
      value: formatCurrency(dadosFinanceiros.totalFaturado),
      subtitle: `Ticket médio: ${formatCurrency(estatisticas.ticketMedio)}`,
      icon: DollarSign,
      color: "bg-green-500"
    },
    {
      title: "Recebido",
      value: formatCurrency(dadosFinanceiros.totalRecebido),
      subtitle: `${calcularPercentual(dadosFinanceiros.totalRecebido, dadosFinanceiros.totalFaturado)}% do total`,
      icon: TrendingUp,
      color: "bg-emerald-500"
    },
    {
      title: "A Receber",
      value: formatCurrency(dadosFinanceiros.totalPendente + dadosFinanceiros.totalParcial),
      subtitle: `Pendente: ${formatCurrency(dadosFinanceiros.totalPendente)}`,
      icon: Clock,
      color: "bg-amber-500"
    },
    {
      title: "Pagamentos Dinheiro",
      value: formatCurrency(dadosFinanceiros.pagamentosDinheiro.valor),
      subtitle: `${dadosFinanceiros.pagamentosDinheiro.quantidade} transações`,
      icon: Banknote,
      color: "bg-green-600"
    },
    {
      title: "Pagamentos Cartão",
      value: formatCurrency(dadosFinanceiros.pagamentosCartao.valor),
      subtitle: `${dadosFinanceiros.pagamentosCartao.quantidade} transações`,
      icon: CreditCard,
      color: "bg-blue-600"
    },
    {
      title: "Pagamentos PIX",
      value: formatCurrency(dadosFinanceiros.pagamentosPix.valor),
      subtitle: `${dadosFinanceiros.pagamentosPix.quantidade} transações`,
      icon: Smartphone,
      color: "bg-purple-600"
    },
    {
      title: "Transferências",
      value: formatCurrency(dadosFinanceiros.pagamentosTransferencia.valor),
      subtitle: `${dadosFinanceiros.pagamentosTransferencia.quantidade} transações`,
      icon: ArrowRightLeft,
      color: "bg-indigo-600"
    }
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {card.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status das consultas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status das Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(estatisticas.consultasPorStatus).map(([status, quantidade]) => {
              let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";
              let icon = Clock;
              
              switch (status) {
                case 'concluido':
                  badgeVariant = "default";
                  icon = CheckCircle;
                  break;
                case 'cancelado':
                case 'faltou':
                  badgeVariant = "destructive";
                  icon = XCircle;
                  break;
                case 'em_andamento':
                  badgeVariant = "outline";
                  break;
              }

              const Icon = icon;
              
              return (
                <div key={status} className="text-center">
                  <Badge variant={badgeVariant} className="mb-2 w-full justify-center">
                    <Icon className="h-3 w-3 mr-1" />
                    {status.replace('_', ' ')}
                  </Badge>
                  <p className="text-2xl font-bold">{quantidade as number}</p>
                  <p className="text-xs text-gray-500">
                    {calcularPercentual(quantidade as number, estatisticas.totalConsultas)}%
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Faturamento por convênio */}
      {dadosFinanceiros.faturamentoPorConvenio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Faturamento por Convênio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosFinanceiros.faturamentoPorConvenio
                .sort((a: any, b: any) => b.valor - a.valor)
                .slice(0, 5)
                .map((convenio: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{convenio.convenio}</p>
                    <p className="text-sm text-gray-500">{convenio.quantidade} consultas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(convenio.valor)}</p>
                    <p className="text-sm text-gray-500">
                      Média: {formatCurrency(convenio.ticketMedio)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CardsResumo;
