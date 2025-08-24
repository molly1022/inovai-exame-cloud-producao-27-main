import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

export const MedicoLoginTest = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Teste de Login de Médicos"
        description="Este módulo permite testar o sistema de login dos médicos"
      />
    </TenantGuard>
  );
};