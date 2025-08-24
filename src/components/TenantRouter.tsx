import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Database, Globe, Loader2, CheckCircle } from 'lucide-react';
import { TenantDebugPanel } from '@/components/TenantDebugPanel';
import { supabase } from '@/integrations/supabase/client';

interface TenantInfo {
  id: string;
  nome_clinica: string;
  subdominio: string;
  database_name: string;
  database_url: string;
  status: 'ativa' | 'suspensa' | 'inativa';
  plano_contratado: string;
}

interface TenantRouterProps {
  children: React.ReactNode;
}

/**
 * Router multi-tenant com detecção automática de subdomínio
 * Busca a clínica específica baseada no subdomínio detectado
 */
export const TenantRouter = ({ children }: TenantRouterProps) => {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionReady, setConnectionReady] = useState(true);
  const [detectedSubdomain, setDetectedSubdomain] = useState<string>('');

  useEffect(() => {
    initializeTenant();
  }, []);

  const detectSubdomain = (): string => {
    const hostname = window.location.hostname;
    console.log('🔍 TenantRouter - Detectando subdomínio do hostname:', hostname);

    // Desenvolvimento: usar subdomínio padrão
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      console.log('🧪 Ambiente desenvolvimento - usando subdomínio padrão: clinica-1');
      return 'clinica-1';
    }

    // Preview Lovable: usar subdomínio padrão  
    if (hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) {
      console.log('🧪 Ambiente preview - usando subdomínio padrão: clinica-1');
      return 'clinica-1';
    }

    // Produção: extrair subdomínio real
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      const subdomain = parts[0];
      console.log('🌐 Subdomínio detectado:', subdomain);
      return subdomain;
    }

    console.log('⚠️ Nenhum subdomínio válido detectado, usando padrão: clinica-1');
    return 'clinica-1';
  };

  const initializeTenant = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Detectar subdomínio atual
      const subdomain = detectSubdomain();
      setDetectedSubdomain(subdomain);
      
      console.log('🔍 Inicializando sistema multi-tenant para subdomínio:', subdomain);

      // Buscar clínica específica pelo subdomínio na tabela central
      const { data: clinicaData, error: clinicaError } = await supabase
        .from('clinicas_central')
        .select('*')
        .eq('subdominio', subdomain)
        .eq('status', 'ativa')
        .single();

      if (clinicaError) {
        console.error('❌ Erro na busca da clínica:', clinicaError);
        throw new Error(`Clínica não encontrada para o subdomínio: ${subdomain}`);
      }
      
      if (!clinicaData) {
        console.error('❌ Nenhuma clínica encontrada para o subdomínio:', subdomain);
        throw new Error(`Clínica não encontrada para o subdomínio: ${subdomain}`);
      }

      console.log('✅ Clínica encontrada e ativa:', {
        nome: clinicaData.nome,
        id: clinicaData.id,
        subdominio: clinicaData.subdominio
      });

      // Configurar contexto da clínica específica
      console.log('🔧 Configurando contexto da clínica...');
      localStorage.setItem('tenant_id', clinicaData.id);
      localStorage.setItem('clinica_id', clinicaData.id);
      localStorage.setItem('clinica_nome', clinicaData.nome);
      localStorage.setItem('tenant_subdominio', clinicaData.subdominio);
      localStorage.setItem('database_name', clinicaData.database_name);

      // Criar objeto tenant
      const tenantInfo: TenantInfo = {
        id: clinicaData.id,
        nome_clinica: clinicaData.nome,
        subdominio: clinicaData.subdominio,
        database_name: clinicaData.database_name || `clinica_${clinicaData.subdominio.replace('-', '_')}`,
        database_url: clinicaData.database_url || '',
        status: clinicaData.status as 'ativa' | 'suspensa' | 'inativa',
        plano_contratado: clinicaData.plano_id || 'basico'
      };

      console.log('🎉 Sistema multi-tenant inicializado com sucesso!');
      setTenant(tenantInfo);
      setError(null);

    } catch (err: any) {
      console.error('❌ Erro ao inicializar sistema multi-tenant:', err);
      setError(err.message);
    } finally {
      console.log('🔄 Finalizando inicialização, loading = false');
      setLoading(false);
    }
  };
  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Inicializando Sistema</h2>
                <p className="text-sm text-muted-foreground">
                  Detectando configurações da clínica...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de erro
  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-destructive/10 text-destructive p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Acesso Negado</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {error || 'Clínica não encontrada ou inativa.'}
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={initializeTenant} 
                  className="w-full"
                  variant="outline"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Clínica suspensa
  if (tenant.status === 'suspensa') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
                  <Database className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Clínica Suspensa</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  A clínica <strong>{tenant.nome_clinica}</strong> está temporariamente suspensa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sistema ativo - renderizar com informações do tenant
  return (
    <div>
      {/* Debug Panel - Informações detalhadas do sistema */}
      <TenantDebugPanel 
        hostname={window.location.hostname}
        detectedSubdomain={detectedSubdomain}
        tenant={tenant}
        connectionReady={connectionReady}
        isProduction={false}
      />
      
      {children}
    </div>
  );
};