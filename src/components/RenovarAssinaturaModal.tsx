import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface RenovarAssinaturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assinatura: any;
}

const RenovarAssinaturaModal = ({ isOpen, onClose }: RenovarAssinaturaModalProps) => {
  if (!isOpen) return null;

  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Renovar Assinatura"
        description="Este módulo permite renovar assinaturas de clínicas"
        onBack={onClose}
      />
    </TenantGuard>
  );
};

export default RenovarAssinaturaModal;