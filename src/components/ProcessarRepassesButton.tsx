import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

export const ProcessarRepassesButton = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Processar Repasses"
        description="Este módulo processa repasses dos médicos"
      />
    </TenantGuard>
  );
};