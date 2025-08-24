import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface PatientAccessValidatorProps {
  children: React.ReactNode;
  pacienteId: string;
  clinicaId: string;
}

export const PatientAccessValidator: React.FC<PatientAccessValidatorProps> = ({ 
  children, 
  pacienteId, 
  clinicaId 
}) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Validador de Acesso de Pacientes"
        description="Sistema de validação de acesso seguro a dados de pacientes por clínica"
        onBack={() => {}}
      />
    </TenantGuard>
  );
};