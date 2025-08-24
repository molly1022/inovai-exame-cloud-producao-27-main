import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

const UltimosExames = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Últimos Exames"
        description="Este módulo mostra os exames mais recentes"
      />
    </TenantGuard>
  );
};

export default UltimosExames;