import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

export const TelemedicinaTester = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Testador de Telemedicina"
        description="Este módulo testa funcionalidades de telemedicina"
      />
    </TenantGuard>
  );
};