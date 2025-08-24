import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface MedicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  medico?: any;
}

const MedicoModal = ({ isOpen, onClose }: MedicoModalProps) => {
  if (!isOpen) return null;

  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Cadastro de Médicos"
        description="Este módulo permite gerenciar médicos da clínica"
        onBack={onClose}
      />
    </TenantGuard>
  );
};

export default MedicoModal;