import React from 'react';
import { SubdomainGuard } from './SubdomainGuard';
import { TenantRouter } from './TenantRouter';

interface MultiTenantGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que combina SubdomainGuard e TenantRouter
 * para proteção completa multi-tenant
 */
export const MultiTenantGuard: React.FC<MultiTenantGuardProps> = ({ children }) => {
  return (
    <SubdomainGuard requireSubdomain={false}>
      <TenantRouter>
        {children}
      </TenantRouter>
    </SubdomainGuard>
  );
};