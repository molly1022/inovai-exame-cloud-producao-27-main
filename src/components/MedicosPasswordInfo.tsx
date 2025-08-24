import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface MedicoPassword {
  id: string;
  nome_completo: string;
  cpf: string;
  senha: string;
  created_at: string;
}

export const MedicosPasswordInfo = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Informações de Senha dos Médicos"
        description="Este módulo gerencia senhas e credenciais de acesso dos médicos"
      />
    </TenantGuard>
  );
};