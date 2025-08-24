import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

export const SubscriptionBanner = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Banner de Assinatura"
        description="Este módulo mostra informações da assinatura"
      />
    </TenantGuard>
  );
};