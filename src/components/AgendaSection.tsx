import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Stethoscope, Calendar } from "lucide-react";
import { formatTimeLocal } from '@/lib/utils';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AgendamentoActionButtons from './AgendamentoActionButtons';

interface Agendamento {
  id: string;
  tipo_exame: string;
  data_agendamento: string;
  status: string;
  observacoes?: string;
  eh_telemedicina?: boolean;
  pacientes?: {
    nome: string;
    cpf: string;
  };
  medicos?: {
    nome_completo: string;
    crm?: string;
  };
}

interface AgendaSectionProps {
  title: string;
  agendamentos: Agendamento[];
  onUpdate: () => void;
  variant?: 'default' | 'warning' | 'info' | 'success';
  showPrintButton?: boolean;
  hidePaymentInfo?: boolean;
  hideCancelAction?: boolean;
  emptyMessage?: string;
  showProntuario?: boolean;
  onProntuarioClick?: (paciente: any) => void;
  isPortalMedico?: boolean;
  isPortalFuncionario?: boolean;
  showReagendar?: boolean;
}

const AgendaSection = ({ 
  title, 
  agendamentos, 
  onUpdate, 
  emptyMessage = "Nenhum agendamento encontrado",
  variant = 'default',
  showPrintButton = true,
  hidePaymentInfo = false,
  hideCancelAction = false,
  showProntuario = false,
  onProntuarioClick,
  isPortalMedico = false,
  isPortalFuncionario = false,
  showReagendar = false
}: AgendaSectionProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 border-blue-300';
      case 'confirmado': return 'bg-green-100 border-green-300';
      case 'paciente_chegou': return 'bg-yellow-100 border-yellow-300';
      case 'em_andamento': return 'bg-orange-100 border-orange-300';
      case 'concluido': return 'bg-gray-100 border-gray-300';
      case 'cancelado': return 'bg-red-100 border-red-300';
      case 'faltou': return 'bg-purple-100 border-purple-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  if (agendamentos.length === 0) {
    return (
      <Card className={getVariantStyles()}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            {title}
            <Badge variant="secondary" className="text-xs">0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500 text-sm">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={getVariantStyles()} data-tour="agendamento-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <Badge variant="secondary" className="text-xs">{agendamentos.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[...agendamentos]
          .sort((a, b) => new Date(a.data_agendamento).getTime() - new Date(b.data_agendamento).getTime())
          .map((agendamento) => (
          <div 
            key={agendamento.id} 
            className={`p-4 rounded-lg border-2 ${getStatusColor(agendamento.status)} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">
                      {format(new Date(agendamento.data_agendamento), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">
                      {formatTimeLocal(agendamento.data_agendamento)}
                    </span>
                  </div>
                   <span className="text-sm font-semibold text-gray-700">
                     {agendamento.tipo_exame}
                   </span>
                   {agendamento.eh_telemedicina && (
                     <Badge className="bg-blue-100 text-blue-800 text-xs">
                       Telemedicina
                     </Badge>
                   )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <User className="h-3 w-3" />
                  <span className="truncate">
                    {agendamento.pacientes?.nome || 'Paciente não encontrado'}
                  </span>
                </div>

                {agendamento.medicos && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Stethoscope className="h-3 w-3" />
                    <span>Dr(a). {agendamento.medicos.nome_completo}</span>
                    {agendamento.medicos.crm && (
                      <span className="text-xs">CRM: {agendamento.medicos.crm}</span>
                    )}
                  </div>
                )}

                {agendamento.observacoes && (
                  <div className="text-xs text-gray-600 mt-2 italic bg-white/50 p-2 rounded">
                    {agendamento.observacoes}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <AgendamentoActionButtons
                  agendamento={agendamento}
                  onUpdate={onUpdate}
                  size="sm"
                  showPrintButton={showPrintButton}
                  hidePaymentInfo={hidePaymentInfo}
                  hideCancelAction={hideCancelAction}
                  showProntuario={showProntuario}
                  onProntuarioClick={onProntuarioClick}
                  isPortalMedico={isPortalMedico}
                  isPortalFuncionario={isPortalFuncionario}
                  showReagendar={showReagendar}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AgendaSection;
