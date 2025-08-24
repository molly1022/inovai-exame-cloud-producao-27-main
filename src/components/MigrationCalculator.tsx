import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

export const MigrationCalculator = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Calculadora de Migração"
        description="Este módulo calcula dados para migração"
      />
    </TenantGuard>
  );
};