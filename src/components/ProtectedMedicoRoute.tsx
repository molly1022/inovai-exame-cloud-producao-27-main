
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useMedicoAuth } from '@/hooks/useMedicoAuth';

interface ProtectedMedicoRouteProps {
  children: ReactNode;
}

const ProtectedMedicoRoute = ({ children }: ProtectedMedicoRouteProps) => {
  const { isAuthenticated, loading } = useMedicoAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal-medico" replace />;
  }

  return <>{children}</>;
};

export default ProtectedMedicoRoute;
