import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface ProntuarioTimelineProps {
  pacienteId?: string;
}

const ProntuarioTimeline = ({ pacienteId }: ProntuarioTimelineProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Timeline do Prontuário"
        description="Cronologia de eventos e atividades do paciente"
        onBack={() => {}}
      />
    </TenantGuard>
  );
};

export default ProntuarioTimeline;