import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

interface MedicoData {
  id?: string;
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  crm?: string;
  coren?: string;
  especialidade: string;
  setor?: string;
  categoria_trabalho: string[];
  percentual_repasse: number;
  senha_acesso?: string;
}

interface MedicoModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medico: MedicoData) => void;
  medico?: MedicoData | null;
  loading?: boolean;
}

export const MedicoModalEnhanced = ({ isOpen, onClose }: MedicoModalEnhancedProps) => {
  if (!isOpen) return null;

  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Cadastro Avançado de Médicos"
        description="Este módulo permite gerenciar médicos com recursos avançados"
        onBack={onClose}
      />
    </TenantGuard>
  );
};