import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface ProntuarioAnotacoesProps {
  pacienteId?: string;
}

const ProntuarioAnotacoes = ({ pacienteId }: ProntuarioAnotacoesProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Anotações do Prontuário"
        description="Sistema de gerenciamento de anotações médicas no prontuário do paciente"
        onBack={() => {}}
      />
    </TenantGuard>
  );
};

export default ProntuarioAnotacoes;