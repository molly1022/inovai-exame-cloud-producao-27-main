
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const { tenant, loading: tenantLoading, error: tenantError, isTenantValid } = useTenant();

  useEffect(() => {
    // Aguardar carregamento do tenant
    if (tenantLoading) return;

    // Verificar se tenant é válido
    if (tenantError || !isTenantValid()) {
      setAuthState('unauthenticated');
      return;
    }

    // Verificar autenticação
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const clinicaEmail = localStorage.getItem('clinicaEmail');
    const tenantId = localStorage.getItem('tenant_id');
    
    console.log('🔒 Verificando autenticação:');
    console.log('- Autenticado:', isAuth);
    console.log('- Email:', clinicaEmail);
    console.log('- Tenant ID:', tenantId);
    console.log('- Tenant válido:', isTenantValid());
    
    if (isAuth && clinicaEmail && tenantId && tenant?.id === tenantId) {
      console.log('✅ Acesso autorizado');
      setAuthState('authenticated');
    } else {
      console.log('❌ Acesso negado - redirecionando para login');
      // Limpar dados inconsistentes
      if (!isAuth || !clinicaEmail || !tenantId) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('clinicaEmail');
        localStorage.removeItem('clinicaNome');
      }
      setAuthState('unauthenticated');
    }
  }, [tenant, tenantLoading, tenantError, isTenantValid]);

  // Loading state
  if (authState === 'loading' || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Tenant error state
  if (tenantError || !isTenantValid()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md p-6">
          <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Clínica não encontrada</h2>
          <p className="text-gray-600 mb-4">{tenantError || 'O subdomínio não foi encontrado.'}</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (authState === 'unauthenticated') {
    return <Navigate to="/clinica-login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
