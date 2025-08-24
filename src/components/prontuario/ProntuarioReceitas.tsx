import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface ProntuarioReceitasProps {
  pacienteId?: string;
  showAddButton?: boolean;
  onAddReceita?: () => void;
}

const ProntuarioReceitas = ({ pacienteId }: ProntuarioReceitasProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Receitas Médicas"
        description="Sistema de receitas médicas no prontuário do paciente"
        onBack={() => {}}
      />
    </TenantGuard>
  );
};

export default ProntuarioReceitas;