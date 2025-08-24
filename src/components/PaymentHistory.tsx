import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

export const PaymentHistory = ({ assinatura }: { assinatura?: any }) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Histórico de Pagamentos"
        description="Este módulo mostra o histórico de pagamentos"
      />
    </TenantGuard>
  );
};