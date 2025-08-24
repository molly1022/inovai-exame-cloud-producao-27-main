import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

export const TeleconsultaMonitor = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Monitor de Teleconsultas"
        description="Este módulo monitora teleconsultas em andamento"
      />
    </TenantGuard>
  );
};