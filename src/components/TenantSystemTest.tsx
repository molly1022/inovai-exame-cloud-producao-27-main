import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Globe, 
  Loader2, 
  RefreshCw,
  Settings
} from 'lucide-react';
import { adminSupabase, createClinicClient } from '@/integrations/supabase/adminClient';
import { dbConnectionFactory } from '@/services/databaseConnectionFactory';

interface SystemStatus {
  subdomain: string | null;
  tenantFound: boolean;
  databaseConfigured: boolean;
  connectionActive: boolean;
  clinicData?: any;
  connectionStats?: any;
  errors: string[];
}

/**
 * Componente para testar o sistema Database-per-Tenant
 * Verifica detecção de subdomínio, conexão com banco central e isolado
 */
export const TenantSystemTest = () => {
  const [status, setStatus] = useState<SystemStatus>({
    subdomain: null,
    tenantFound: false,
    databaseConfigured: false,
    connectionActive: false,
    errors: []
  });
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    runSystemTest();
  }, []);

  const detectSubdomain = (): string | null => {
    const hostname = window.location.hostname;
    console.log('🌐 Detectando subdomínio:', hostname);
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'teste-1';
    }
    
    if (hostname.includes('somosinovai.com')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        return parts[0];
      }
    }
    
    if (hostname.includes('lovableproject.com')) {
      return 'teste-1';
    }
    
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    
    return null;
  };

  const runSystemTest = async () => {
    setLoading(true);
    const results: any[] = [];
    const errors: string[] = [];
    
    try {
      // Test 1: Detecção de subdomínio
      const subdomain = detectSubdomain();
      results.push({
        test: 'Detecção de Subdomínio',
        status: subdomain ? 'success' : 'error',
        message: subdomain ? `Subdomínio detectado: ${subdomain}` : 'Subdomínio não detectado',
        value: subdomain
      });

      if (!subdomain) {
        errors.push('Subdomínio não detectado');
        setStatus(prev => ({ ...prev, errors, subdomain }));
        return;
      }

      // Test 2: Buscar clínica no banco central
      const { data: clinicData, error: clinicError } = await adminSupabase
        .from('clinicas_central')
        .select('*')
        .eq('subdominio', subdomain)
        .single();

      results.push({
        test: 'Busca no Banco Central',
        status: !clinicError && clinicData ? 'success' : 'error',
        message: !clinicError && clinicData 
          ? `Clínica encontrada: ${clinicData.nome}` 
          : `Erro: ${clinicError?.message || 'Clínica não encontrada'}`,
        value: clinicData
      });

      if (clinicError || !clinicData) {
        errors.push(`Clínica não encontrada: ${clinicError?.message}`);
      }

      // Test 3: Configuração do banco específico
      const clinicClient = createClinicClient(subdomain);
      results.push({
        test: 'Configuração Banco Específico',
        status: clinicClient ? 'success' : 'warning',
        message: clinicClient 
          ? 'Cliente do banco configurado' 
          : 'Cliente não configurado - usando RLS',
        value: !!clinicClient
      });

      // Test 4: Connection Factory
      const connection = await dbConnectionFactory.getConnection(subdomain);
      results.push({
        test: 'Connection Factory',
        status: connection ? 'success' : 'error',
        message: connection 
          ? `Conexão estabelecida: ${connection.databaseName}` 
          : 'Falha na conexão',
        value: connection
      });

      // Test 5: Estatísticas de conexões
      const stats = dbConnectionFactory.getConnectionStats();
      results.push({
        test: 'Estatísticas de Conexão',
        status: 'info',
        message: `${stats.total} conexões total, ${stats.active} ativas`,
        value: stats
      });

      setStatus({
        subdomain,
        tenantFound: !!clinicData,
        databaseConfigured: !!clinicClient,
        connectionActive: !!connection,
        clinicData,
        connectionStats: stats,
        errors
      });

    } catch (error: any) {
      errors.push(`Erro geral: ${error.message}`);
      results.push({
        test: 'Sistema Geral',
        status: 'error',
        message: error.message,
        value: null
      });
    } finally {
      setTestResults(results);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Settings className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Teste do Sistema Database-per-Tenant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={runSystemTest} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Executar Teste
            </Button>
            
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                Hostname: {window.location.hostname}
              </span>
            </div>
          </div>

          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {status.subdomain ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Subdomínio</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {status.subdomain || 'Não detectado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {status.tenantFound ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Tenant</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {status.tenantFound ? 'Encontrado' : 'Não encontrado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {status.databaseConfigured ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium">Banco</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {status.databaseConfigured ? 'Configurado' : 'RLS Fallback'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {status.connectionActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Conexão</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {status.connectionActive ? 'Ativa' : 'Inativa'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resultados dos Testes */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold mb-2">Resultados dos Testes</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <span className="text-sm font-medium">{result.test}</span>
                </div>
                <div className="text-right">
                  <Badge variant={
                    result.status === 'success' ? 'default' :
                    result.status === 'error' ? 'destructive' : 
                    result.status === 'warning' ? 'secondary' : 'outline'
                  }>
                    {result.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Erros */}
          {status.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Erros Encontrados</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {status.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Dados da Clínica */}
          {status.clinicData && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2">Dados da Clínica</h4>
              <div className="text-xs text-green-700 space-y-1">
                <p><strong>Nome:</strong> {status.clinicData.nome}</p>
                <p><strong>Subdomínio:</strong> {status.clinicData.subdominio}</p>
                <p><strong>Database:</strong> {status.clinicData.database_name}</p>
                <p><strong>Status:</strong> {status.clinicData.status}</p>
                <p><strong>Plano:</strong> {status.clinicData.plano_contratado}</p>
                <p><strong>Criado DB:</strong> {status.clinicData.database_created ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};