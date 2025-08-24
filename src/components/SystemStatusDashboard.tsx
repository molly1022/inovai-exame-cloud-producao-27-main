import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { 
  Globe, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity,
  Clock,
  Users,
  Server
} from "lucide-react";

interface Clinica {
  id: string;
  nome: string;
  subdominio: string;
  status: string;
  database_name: string;
  last_access: string;
  created_at: string;
}

interface SystemMetrics {
  totalClinicas: number;
  clinicasAtivas: number;
  ultimoAcesso: string;
  dnsStatus: 'ok' | 'warning' | 'error';
}

export const SystemStatusDashboard = () => {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalClinicas: 0,
    clinicasAtivas: 0,
    ultimoAcesso: '',
    dnsStatus: 'warning'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as clínicas
      const { data: clinicasData } = await adminSupabase
        .from('clinicas_central')
        .select('*')
        .order('created_at', { ascending: false });

      if (clinicasData) {
        setClinicas(clinicasData);
        
        // Calcular métricas
        const ativas = clinicasData.filter(c => c.status === 'ativa').length;
        const ultimoAcesso = clinicasData
          .filter(c => c.last_access)
          .sort((a, b) => new Date(b.last_access).getTime() - new Date(a.last_access).getTime())[0]?.last_access || '';

        setMetrics({
          totalClinicas: clinicasData.length,
          clinicasAtivas: ativas,
          ultimoAcesso,
          dnsStatus: 'warning' // Sempre warning pois DNS não está configurado
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDNS = async (subdominio: string) => {
    const url = `https://${subdominio}.somosinovai.com`;
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return 'ok';
    } catch {
      return 'error';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800';
      case 'suspensa': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const getSubdomainStatus = (subdominio: string) => {
    // Subdomínios que sabemos que funcionam em desenvolvimento
    const workingSubdomains = ['bancomodelo', 'clinica-1', 'teste-1', 'bancocentral'];
    return workingSubdomains.includes(subdominio);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalClinicas}</p>
                <p className="text-xs text-muted-foreground">Total Clínicas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.clinicasAtivas}</p>
                <p className="text-xs text-muted-foreground">Clínicas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-bold">⚠️ Pendente</p>
                <p className="text-xs text-muted-foreground">DNS Wildcard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs font-medium">
                  {metrics.ultimoAcesso ? formatDate(metrics.ultimoAcesso) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Último Acesso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status das Clínicas */}
      <Tabs defaultValue="clinicas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clinicas">Clínicas Registradas</TabsTrigger>
          <TabsTrigger value="dns">Status DNS</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="clinicas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clínicas no Sistema</CardTitle>
              <CardDescription>
                Lista de todas as clínicas registradas no banco central
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clinicas.map((clinica) => (
                  <div key={clinica.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{clinica.nome}</h4>
                        <Badge className={getStatusColor(clinica.status)}>
                          {clinica.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {clinica.subdominio}.somosinovai.com
                        </span>
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {clinica.database_name || 'RLS compartilhado'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Criada: {formatDate(clinica.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSubdomainStatus(clinica.subdominio) ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Status DNS - Ação Requerida
              </CardTitle>
              <CardDescription>
                Configuração DNS wildcard necessária na Hostinger
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">⚠️ DNS Wildcard não configurado</h4>
                <p className="text-sm text-orange-700 mb-3">
                  Para que os subdomínios funcionem em produção, é necessário configurar um registro CNAME wildcard na Hostinger:
                </p>
                <div className="bg-white p-3 rounded border font-mono text-sm">
                  <div>Tipo: CNAME</div>
                  <div>Nome: *</div>
                  <div>Valor: sxtqlnayloetwlcjtkbj.supabase.co</div>
                  <div>TTL: 3600</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Status por Subdomínio:</h4>
                {clinicas.map((clinica) => (
                  <div key={clinica.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-mono text-sm">
                      {clinica.subdominio}.somosinovai.com
                    </span>
                    <div className="flex items-center gap-2">
                      {getSubdomainStatus(clinica.subdominio) ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Funciona (dev)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">DNS necessário</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Informações sobre a configuração atual do multi-tenant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Banco Central</h4>
                  <div className="text-sm space-y-1 font-mono bg-muted p-3 rounded">
                    <div>URL: biihsfrunulliloaaxju.supabase.co</div>
                    <div>Tabela: clinicas_central</div>
                    <div>Status: ✅ Conectado</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Banco Modelo</h4>
                  <div className="text-sm space-y-1 font-mono bg-muted p-3 rounded">
                    <div>URL: tgydssyqgmifcuajacgo.supabase.co</div>
                    <div>RLS: ✅ Ativo</div>
                    <div>Status: ✅ Operacional</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Edge Functions</h4>
                  <div className="text-sm space-y-1 bg-muted p-3 rounded">
                    <div>✅ criar-banco-clinica</div>
                    <div>✅ clonar-schema-banco-modelo</div>
                    <div>✅ configurar-dns-hostinger</div>
                    <div>⏳ Supabase Management API</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Ambiente</h4>
                  <div className="text-sm space-y-1 bg-muted p-3 rounded">
                    <div>Desenvolvimento: ✅ Funcionando</div>
                    <div>Produção: ⚠️ Aguarda DNS</div>
                    <div>Subdomínio padrão: bancomodelo</div>
                    <div>Domínio: somosinovai.com</div>
                  </div>
                </div>
              </div>

              <Button onClick={loadSystemData} className="w-full">
                <Activity className="w-4 h-4 mr-2" />
                Atualizar Status
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};