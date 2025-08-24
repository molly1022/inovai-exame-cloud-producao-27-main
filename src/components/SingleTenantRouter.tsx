import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface SingleTenantInfo {
  id: string;
  nome_clinica: string;
  subdominio: string;
  database_name: string;
  status: string;
  plano_contratado: string;
}

interface SingleTenantRouterProps {
  children: React.ReactNode;
}

export const SingleTenantRouter: React.FC<SingleTenantRouterProps> = ({ children }) => {
  const [tenantInfo, setTenantInfo] = useState<SingleTenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeTenant();
  }, []);

  const initializeTenant = async () => {
    try {
      console.log('🔍 Inicializando sistema single-tenant...');
      
      // Configuração fixa para single-tenant
      const fixedTenant: SingleTenantInfo = {
        id: 'single-tenant-id',
        nome_clinica: 'Clínica Modelo',
        subdominio: 'clinica-modelo',
        database_name: 'banco_modelo',
        status: 'ativa',
        plano_contratado: 'basico'
      };

      // Configurar localStorage para compatibilidade
      localStorage.setItem('tenant_id', fixedTenant.id);
      localStorage.setItem('clinica_id', fixedTenant.id);
      localStorage.setItem('tenant_subdominio', fixedTenant.subdominio);
      localStorage.setItem('database_name', fixedTenant.database_name);
      localStorage.setItem('clinica_nome', fixedTenant.nome_clinica);

      setTenantInfo(fixedTenant);
      console.log('✅ Sistema single-tenant inicializado:', fixedTenant);

    } catch (error: any) {
      console.error('❌ Erro ao inicializar sistema:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      console.log('🔄 Finalizando inicialização, loading = false');
    }
  };

  if (loading) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Inicializando sistema single-tenant...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Erro na Inicialização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={initializeTenant}
            className="w-full mt-4"
            variant="outline"
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!tenantInfo || tenantInfo.status !== 'ativa') {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            Sistema Suspenso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              O sistema está temporariamente suspenso. Entre em contato com o suporte.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Debug Header - apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-muted border-b p-2 text-xs text-muted-foreground">
          <div className="container mx-auto flex items-center justify-between">
            <span>
              🏥 {tenantInfo.nome_clinica} | 📊 {tenantInfo.plano_contratado} | 🗄️ {tenantInfo.database_name}
            </span>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Single-Tenant Ativo</span>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default SingleTenantRouter;