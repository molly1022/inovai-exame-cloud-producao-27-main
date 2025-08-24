import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

export const PlanUsageIndicator = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Indicador de Uso do Plano"
        description="Este módulo mostra estatísticas de uso do plano contratado"
      />
    </TenantGuard>
  );
};