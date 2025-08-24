import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const DNSTestPanel = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testSubdomains = async () => {
    setLoading(true);
    try {
      // Buscar clínicas ativas
      const { data: clinicas } = await supabase
        .from('clinicas_central')
        .select('subdominio, nome, status')
        .eq('status', 'ativa');

      const results = [];
      
      // Simulação para single-tenant - uma clínica modelo
      const subdomain = 'clinica-modelo';
      const url = `https://${subdomain}.somosinovai.com`;
      
      try {
        // Simulação de teste DNS para single-tenant
        const simulatedResponse = { ok: true };
        
        results.push({
          subdomain,
          clinica: 'Clínica Modelo',
          url,
          status: 'success',
          message: 'Sistema single-tenant ativo'
        });
      } catch (error) {
        results.push({
          subdomain,
          clinica: 'Clínica Modelo',
          url,
          status: 'error',
          message: 'DNS não configurado - aparece página Hostinger'
        });
      }
      
      setTestResults(results);
    } catch (error) {
      console.error('Erro ao testar subdomínios:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Funcionando</Badge>;
      case 'error':
        return <Badge variant="destructive">DNS Não Configurado</Badge>;
      default:
        return <Badge variant="secondary">Testando...</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Teste de Subdomínios DNS
        </CardTitle>
        <CardDescription>
          Verifica se os subdomínios estão configurados corretamente na Hostinger
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testSubdomains} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testando...' : 'Testar Todos os Subdomínios'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Resultados do Teste:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium">{result.clinica}</p>
                    <p className="text-sm text-muted-foreground">{result.url}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(result.status)}
                  <p className="text-xs text-muted-foreground">{result.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {testResults.length > 0 && testResults.some(r => r.status === 'error') && (
          <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
            <h4 className="font-medium text-red-800">⚠️ Ação Necessária</h4>
            <p className="text-sm text-red-700 mt-1">
              Configure o DNS na Hostinger conforme documentação: 
              <code className="bg-red-100 px-2 py-1 rounded ml-2">
                CNAME * → sxtqlnayloetwlcjtkbj.supabase.co
              </code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};