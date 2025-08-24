import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  AlertCircle,
  CheckCircle,
  Database,
  Timer
} from "lucide-react";
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AgendamentoActionButtonsProps {
  agendamento: any;
  onUpdate: () => void;
  size?: 'sm' | 'default';
  showPrintButton?: boolean;
  hidePaymentInfo?: boolean;
  hideCancelAction?: boolean;
  showProntuario?: boolean;
  onProntuarioClick?: (paciente: any) => void;
  isPortalMedico?: boolean;
  isPortalFuncionario?: boolean;
  showReagendar?: boolean;
}

const AgendamentoActionButtons = ({ 
  agendamento, 
  onUpdate, 
  size = "default",
  showPrintButton = true,
  hidePaymentInfo = false,
  hideCancelAction = false,
  showProntuario = false,
  onProntuarioClick,
  isPortalMedico = false,
  isPortalFuncionario = false,
  showReagendar = false
}: AgendamentoActionButtonsProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <ActionButtonsContent 
        agendamento={agendamento}
        onUpdate={onUpdate}
        size={size}
        showPrintButton={showPrintButton}
        hidePaymentInfo={hidePaymentInfo}
        hideCancelAction={hideCancelAction}
        showProntuario={showProntuario}
        onProntuarioClick={onProntuarioClick}
        isPortalMedico={isPortalMedico}
        isPortalFuncionario={isPortalFuncionario}
        showReagendar={showReagendar}
      />
    </TenantGuard>
  );
};

const ActionButtonsContent = ({ 
  agendamento, 
  size = "default"
}: AgendamentoActionButtonsProps) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendada';
      case 'confirmado': return 'Confirmada';
      case 'paciente_chegou': return 'Paciente chegou';
      case 'em_andamento': return 'Em andamento';
      case 'concluido': return 'Concluída';
      case 'cancelado': return 'Cancelada';
      case 'faltou': return 'Paciente faltou';
      default: return status || 'Agendada';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-300';
      case 'paciente_chegou': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'concluido': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-300';
      case 'faltou': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado': return <Clock className="h-3 w-3" />;
      case 'confirmado': return <CheckCircle className="h-3 w-3" />;
      case 'paciente_chegou': return <CheckCircle className="h-3 w-3" />;
      case 'em_andamento': return <Timer className="h-3 w-3" />;
      case 'concluido': return <CheckCircle className="h-3 w-3" />;
      case 'cancelado': return <AlertCircle className="h-3 w-3" />;
      case 'faltou': return <AlertCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const status = agendamento?.status || 'agendado';

  return (
    <div className="space-y-4">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Demonstração de Ações</strong> - Funcionalidades completas estarão disponíveis quando acessado via subdomínio da clínica específica.
        </AlertDescription>
      </Alert>

      <div className={`flex items-center gap-1 ${size === 'sm' ? 'flex-col' : 'flex-row'} opacity-75`}>
        {/* Status Badge */}
        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold border text-center flex items-center justify-center gap-1 ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          {getStatusLabel(status)}
        </Badge>

        {/* Botões de demonstração desabilitados */}
        <div className="flex flex-wrap gap-1">
          <Button
            size={size}
            variant="outline"
            disabled
            className="bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          >
            Ações indisponíveis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgendamentoActionButtons;