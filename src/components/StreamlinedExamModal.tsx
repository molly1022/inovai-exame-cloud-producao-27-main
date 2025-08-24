import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface StreamlinedExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exam?: any;
}

const StreamlinedExamModal = ({ isOpen, onClose }: StreamlinedExamModalProps) => {
  if (!isOpen) return null;

  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Cadastro de Exames"
        description="Este módulo permite cadastrar e gerenciar exames"
        onBack={onClose}
      />
    </TenantGuard>
  );
};

export default StreamlinedExamModal;