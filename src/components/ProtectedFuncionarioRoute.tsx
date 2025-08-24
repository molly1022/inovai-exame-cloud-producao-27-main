
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedFuncionarioRouteProps {
  children: React.ReactNode;
}

const ProtectedFuncionarioRoute = ({ children }: ProtectedFuncionarioRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [tenantValid, setTenantValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar autenticação do funcionário
    const funcionarioLoggedIn = localStorage.getItem('funcionario_logged');
    const funcionarioEmail = localStorage.getItem('funcionario_email');
    const tenantId = localStorage.getItem('tenant_id');
    
    // Verificar se o tenant é válido
    const isValidTenant = tenantId && tenantId !== '';
    setTenantValid(isValidTenant);
    
    if (funcionarioLoggedIn === 'true' && funcionarioEmail && isValidTenant) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null || tenantValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Verificando autenticação...</div>
      </div>
    );
  }

  if (!tenantValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Clínica não encontrada</h1>
          <p>O subdomínio informado não foi encontrado.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/funcionario-login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedFuncionarioRoute;
