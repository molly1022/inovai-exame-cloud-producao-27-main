import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface PagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PagamentoModal = ({ isOpen, onClose }: PagamentoModalProps) => {
  if (!isOpen) return null;

  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Gestão de Pagamentos"
        description="Este módulo gerencia pagamentos da clínica"
        onBack={onClose}
      />
    </TenantGuard>
  );
};