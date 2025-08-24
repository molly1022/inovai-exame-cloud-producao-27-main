import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTenantSystem } from '@/hooks/useTenantSystem';

interface TenantGuardProps {
  children: React.ReactNode;
  requiresOperationalDB?: boolean;
}

/**
 * Componente que protege o acesso baseado no tipo de banco necessário
 * - requiresOperationalDB=true: Só renderiza se tiver acesso ao banco operacional da clínica
 * - requiresOperationalDB=false: Só renderiza se estiver no contexto administrativo
 */
export const TenantGuard: React.FC<TenantGuardProps> = ({ 
  children, 
  requiresOperationalDB = true 
}) => {
  const { isInitialized, tenantId, isIsolated, loading, error } = useTenantSystem();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando contexto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro no sistema: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Para componentes que precisam do banco operacional
  if (requiresOperationalDB) {
    if (!isInitialized || !tenantId) {
      return (
        <Alert className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Este componente requer acesso a uma clínica específica.
            Por favor, acesse através do subdomínio da clínica.
          </AlertDescription>
        </Alert>
      );
    }
  }

  // Para componentes administrativos (banco central)
  if (!requiresOperationalDB) {
    // Permitir acesso administrativo mesmo sem tenant específico
    return <>{children}</>;
  }

  return <>{children}</>;
};