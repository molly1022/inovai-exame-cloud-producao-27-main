import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface PlanSelectorProps {
  onPlanSelect?: (plan: any) => void;
}

export const PlanSelector = ({ onPlanSelect }: PlanSelectorProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Seletor de Planos"
        description="Este módulo permite selecionar planos de assinatura"
      />
    </TenantGuard>
  );
};