import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface ProntuarioAtestadosProps {
  pacienteId?: string;
  showAddButton?: boolean;
}

const ProntuarioAtestados = ({ pacienteId }: ProntuarioAtestadosProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Atestados Médicos"
        description="Sistema de gerenciamento de atestados médicos no prontuário"
        onBack={() => {}}
      />
    </TenantGuard>
  );
};

export default ProntuarioAtestados;