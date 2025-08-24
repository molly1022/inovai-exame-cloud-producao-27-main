
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Banknote, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

interface PaymentQuickBadgeProps {
  valorExame: number;
  valorPago: number;
  statusPagamento: string;
  size?: 'sm' | 'default';
  onRegistrarPagamento?: () => void;
}

const PaymentQuickBadge = ({ 
  valorExame, 
  valorPago, 
  statusPagamento,
  size = 'sm',
  onRegistrarPagamento
}: PaymentQuickBadgeProps) => {
  const [expanded, setExpanded] = useState(false);
  const valorDevido = Math.max(0, valorExame - valorPago);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const getStatusInfo = () => {
    if (valorDevido === 0 && valorPago > 0) {
      return {
        label: 'PAGO',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: <CheckCircle className="h-3 w-3" />
      };
    } else if (valorPago > 0 && valorDevido > 0) {
      return {
        label: 'PARCIAL',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: <AlertCircle className="h-3 w-3" />
      };
    } else {
      return {
        label: 'PENDENTE',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: <Banknote className="h-3 w-3" />
      };
    }
  };

  const statusInfo = getStatusInfo();

  if (!expanded) {
    // Estado colapsado - badge compacto
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(true)}
        className={`w-full justify-between text-xs font-semibold border ${statusInfo.color}`}
      >
        <div className="flex items-center gap-1">
          {statusInfo.icon}
          {statusInfo.label}
          {valorDevido > 0 && (
            <span className="ml-1">{formatCurrency(valorDevido)}</span>
          )}
        </div>
        <ChevronDown className="h-3 w-3" />
      </Button>
    );
  }

  // Estado expandido - detalhes completos
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Banknote className="h-4 w-4" />
          Informações Financeiras
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(false)}
          className="h-6 w-6 p-0"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Valor:</span>
          <span className="font-medium">{formatCurrency(valorExame)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Pago:</span>
          <span className="font-medium text-green-600">{formatCurrency(valorPago)}</span>
        </div>
        
        {valorDevido > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Devido:</span>
            <span className="font-medium text-red-600">{formatCurrency(valorDevido)}</span>
          </div>
        )}
      </div>

      <div className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center justify-center gap-1 ${statusInfo.color}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </div>

      {/* Botão para registrar pagamento quando há pendência */}
      {valorDevido > 0 && onRegistrarPagamento && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRegistrarPagamento}
          className="w-full text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
        >
          <Banknote className="h-3 w-3 mr-1" />
          Registrar Pagamento
        </Button>
      )}
    </div>
  );
};

export default PaymentQuickBadge;
