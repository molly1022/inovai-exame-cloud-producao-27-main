import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface SelectPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelected?: (plan: any) => void;
  onSuccess?: () => void;
  assinatura?: any;
}

export const SelectPlanModal = ({ isOpen, onClose, onSuccess, assinatura }: SelectPlanModalProps) => {
  if (!isOpen) return null;

  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Selecionar Plano"
        description="Este módulo permite selecionar planos de assinatura"
        onBack={onClose}
      />
    </TenantGuard>
  );
};