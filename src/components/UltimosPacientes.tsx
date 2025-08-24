import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

const UltimosPacientes = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Últimos Pacientes"
        description="Este módulo mostra os pacientes mais recentes"
      />
    </TenantGuard>
  );
};

export default UltimosPacientes;