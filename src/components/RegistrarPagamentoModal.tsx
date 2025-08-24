import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface RegistrarPagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: any;
  onSuccess: () => void;
}

const RegistrarPagamentoModal = ({ isOpen, onClose }: RegistrarPagamentoModalProps) => {
  if (!isOpen) return null;

  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Registrar Pagamento"
        description="Este módulo permite registrar pagamentos de exames e consultas"
        onBack={onClose}
      />
    </TenantGuard>
  );
};

export default RegistrarPagamentoModal;