import React from 'react';
import { TenantGuard } from '@/components/TenantGuard';

interface ProtectedSubscriptionRouteProps {
  children: React.ReactNode;
}

export const ProtectedSubscriptionRoute = ({ children }: ProtectedSubscriptionRouteProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <div>
        {children}
      </div>
    </TenantGuard>
  );
};

export default ProtectedSubscriptionRoute;