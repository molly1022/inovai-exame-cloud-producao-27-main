import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface ProntuarioExamesProps {
  pacienteId?: string;
}

const ProntuarioExames = ({ pacienteId }: ProntuarioExamesProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Exames do Prontuário"
        description="Sistema de visualização e gestão de exames no prontuário do paciente"
        onBack={() => {}}
      />
    </TenantGuard>
  );
};

export default ProntuarioExames;