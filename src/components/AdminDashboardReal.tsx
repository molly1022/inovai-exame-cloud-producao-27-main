import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Users, 
  Activity, 
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Globe,
  Eye,
  RefreshCw
} from "lucide-react";
import { useState } from "react";

export const AdminDashboardReal = () => {
  const [showDatabaseDetails, setShowDatabaseDetails] = useState<{ [key: string]: boolean }>({});

  // Buscar clínicas reais do banco central
  const { data: clinicas = [], refetch, isLoading } = useQuery({
    queryKey: ['clinicas-admin-real'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinicas_central')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Buscar métricas do sistema
  const { data: metricas } = useQuery({
    queryKey: ['metricas-sistema'],
    queryFn: async () => {
      const totalClinicas = clinicas.length;
      const clinicasAtivas = clinicas.filter(c => c.status === 'ativa').length;
      const clinicasSuspensas = clinicas.filter(c => c.status === 'suspensa').length;
      
      return {
        total_clinicas: totalClinicas,
        clinicas_ativas: clinicasAtivas,
        clinicas_suspensas: clinicasSuspensas,
        conexoes_ativas: clinicasAtivas, // Simplificado
        bancos_isolados: clinicas.filter(c => c.database_url).length
      };
    },
    enabled: !!clinicas.length
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Ativa</Badge>;
      case 'suspensa':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertTriangle className="h-3 w-3 mr-1" />Suspensa</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConexaoStatus = (clinica: any) => {
    if (clinica.database_url && clinica.service_role_key) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600">Database-per-Tenant</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-blue-600">RLS Compartilhado</span>
        </div>
      );
    }
  };

  const toggleDatabaseDetails = (clinicaId: string) => {
    setShowDatabaseDetails(prev => ({
      ...prev,
      [clinicaId]: !prev[clinicaId]
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clínicas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.total_clinicas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cadastradas no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clínicas Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metricas?.clinicas_ativas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Operando normalmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões DB</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metricas?.conexoes_ativas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Bancos conectados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bancos Isolados</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metricas?.bancos_isolados || 0}</div>
            <p className="text-xs text-muted-foreground">
              Database-per-Tenant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clínicas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Clínicas Cadastradas
            </CardTitle>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clinicas.map((clinica) => (
              <div key={clinica.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{clinica.nome}</h3>
                      <p className="text-sm text-muted-foreground">{clinica.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(clinica.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDatabaseDetails(clinica.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {showDatabaseDetails[clinica.id] ? 'Ocultar' : 'Detalhes'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subdomínio:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3" />
                      <span className="font-mono">{clinica.subdominio}.somosinovai.com</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Plano:</span>
                    <div className="mt-1 font-medium">{clinica.plano_id || 'Básico'}</div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Conexão:</span>
                    <div className="mt-1">
                      {getConexaoStatus(clinica)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Último Acesso:</span>
                    <div className="mt-1">
                      {clinica.last_access ? 
                        new Date(clinica.last_access).toLocaleDateString('pt-BR') : 
                        'Nunca'
                      }
                    </div>
                  </div>
                </div>

                {showDatabaseDetails[clinica.id] && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Configurações do Banco de Dados
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Database Name:</span>
                        <div className="mt-1 font-mono text-xs bg-white p-2 rounded border">
                          {clinica.database_name || 'Compartilhado (RLS)'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Database URL:</span>
                        <div className="mt-1 font-mono text-xs bg-white p-2 rounded border">
                          {clinica.database_url ? 
                            `${clinica.database_url.substring(0, 30)}...` : 
                            'Banco compartilhado'
                          }
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Service Key:</span>
                        <div className="mt-1 font-mono text-xs bg-white p-2 rounded border">
                          {clinica.service_role_key ? '••••••••••••••••' : 'Não configurada'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Criado em:</span>
                        <div className="mt-1">
                          {new Date(clinica.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {clinicas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma clínica cadastrada ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};