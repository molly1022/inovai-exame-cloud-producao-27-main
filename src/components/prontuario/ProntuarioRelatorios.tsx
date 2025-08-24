import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface ProntuarioRelatoriosProps {
  pacienteId?: string;
  paciente?: any;
}

const ProntuarioRelatorios = ({ pacienteId, paciente }: ProntuarioRelatoriosProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Relatórios do Prontuário"
        description="Sistema de relatórios e documentos médicos do paciente"
        onBack={() => {}}
      />
    </TenantGuard>
  );
};

export default ProntuarioRelatorios;