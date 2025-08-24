import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

const UltimosPagamentos = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Últimos Pagamentos"
        description="Este módulo mostra os pagamentos mais recentes"
      />
    </TenantGuard>
  );
};

export default UltimosPagamentos;