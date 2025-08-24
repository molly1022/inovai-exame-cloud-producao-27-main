import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface MedicoAgendamentoCardProps {
  agendamento?: any;
  onStatusChange?: () => void;
  hidePaymentInfo?: boolean;
  hideCancelAction?: boolean;
  showProntuario?: boolean;
  onProntuarioClick?: (agendamento: any) => void;
}

const MedicoAgendamentoCard = ({ 
  agendamento, 
  onStatusChange, 
  hidePaymentInfo = false, 
  hideCancelAction = false, 
  showProntuario = false, 
  onProntuarioClick 
}: MedicoAgendamentoCardProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Agendamentos do Médico"
        description="Card de agendamentos para visualização e gestão de consultas médicas"
        onBack={() => {}}
      />
    </TenantGuard>
  );
};

export default MedicoAgendamentoCard;