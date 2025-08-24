import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';
import { TenantDemoInterface } from '@/components/TenantDemoInterface';

const SecurePortalPaciente = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Portal Seguro do Paciente"
        description="Este módulo permite acesso seguro aos dados do paciente"
      />
    </TenantGuard>
  );
};

export default SecurePortalPaciente;