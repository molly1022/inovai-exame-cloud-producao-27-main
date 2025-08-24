import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Users } from 'lucide-react';
import { useTenantSystem } from '@/hooks/useTenantSystem';

/**
 * Componente para testar e verificar o status do sistema Database-per-Tenant
 */
export const SystemStatusTest = () => {
  const tenantSystem = useTenantSystem();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runSystemTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results: any[] = [];

    try {
      // Teste 1: Verificar inicialização do tenant
      results.push({
        test: 'Inicialização do Tenant',
        status: tenantSystem.isInitialized ? 'success' : 'error',
        message: tenantSystem.isInitialized ? `Tenant "${tenantSystem.subdominio}" inicializado` : tenantSystem.error || 'Não inicializado',
        icon: CheckCircle
      });

      // Teste 2: Verificar conexão de banco
      results.push({
        test: 'Conexão de Banco',
        status: tenantSystem.isInitialized ? 'success' : 'warning',
        message: tenantSystem.isIsolated ? 'Banco isolado conectado' : 'Usando RLS compartilhado',
        icon: Database
      });

      // Teste 3: Testar query administrativa
      if (tenantSystem.isInitialized) {
        try {
          const { data: adminData } = await tenantSystem.getClient('clinicas_central')
            .from('clinicas_central')
            .select('nome, subdominio')
            .eq('subdominio', tenantSystem.subdominio)
            .single();

          results.push({
            test: 'Query Administrativa',
            status: 'success',
            message: `Clínica: ${adminData?.nome}`,
            icon: CheckCircle
          });
        } catch (error: any) {
          results.push({
            test: 'Query Administrativa',
            status: 'error',
            message: `Erro: ${error.message}`,
            icon: XCircle
          });
        }
      }

      // Teste 4: Testar query operacional (clínicas)
      if (tenantSystem.isInitialized) {
        try {
          const { data: operationalData, error } = await tenantSystem.query('clinicas')
            .select('id, nome')
            .limit(1);

          if (error) {
            results.push({
              test: 'Query Operacional (Clínicas)',
              status: 'warning',
              message: `Aviso: ${error.message}`,
              icon: AlertCircle
            });
          } else {
            results.push({
              test: 'Query Operacional (Clínicas)',
              status: 'success',
              message: `${operationalData?.length || 0} registros encontrados`,
              icon: CheckCircle
            });
          }
        } catch (error: any) {
          results.push({
            test: 'Query Operacional (Clínicas)',
            status: 'error',
            message: `Erro: ${error.message}`,
            icon: XCircle
          });
        }
      }

    } catch (error: any) {
      results.push({
        test: 'Sistema Geral',
        status: 'error',
        message: error.message,
        icon: XCircle
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  useEffect(() => {
    if (tenantSystem.isInitialized) {
      runSystemTests();
    }
  }, [tenantSystem.isInitialized]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return XCircle;
      default: return AlertCircle;
    }
  };

  if (tenantSystem.loading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="pt-6">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Inicializando sistema...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status do Sistema Database-per-Tenant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tenant ID</p>
              <p className="font-mono text-xs">{tenantSystem.tenantId?.slice(0, 8)}...</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Subdomínio</p>
              <p className="font-semibold">{tenantSystem.subdominio}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Database</p>
              <p className="font-mono text-xs">{tenantSystem.databaseName}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tipo</p>
              <Badge variant={tenantSystem.isIsolated ? "default" : "secondary"}>
                {tenantSystem.isIsolated ? 'Isolado' : 'RLS'}
              </Badge>
            </div>
          </div>

          <Button 
            onClick={runSystemTests} 
            disabled={testing}
            className="w-full"
          >
            {testing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            {testing ? 'Testando...' : 'Executar Testes'}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => {
                const Icon = result.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Icon className={`h-5 w-5 ${
                      result.status === 'success' ? 'text-green-600' : 
                      result.status === 'warning' ? 'text-yellow-600' : 
                      'text-red-600'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{result.test}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === 'success' ? 'OK' : 
                       result.status === 'warning' ? 'Aviso' : 'Erro'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};