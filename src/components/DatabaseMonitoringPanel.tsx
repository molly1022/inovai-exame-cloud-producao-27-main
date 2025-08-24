import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Database, Activity, AlertCircle, CheckCircle, Clock, Server } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { dbConnectionFactory } from "@/services/databaseConnectionFactory";

interface ConnectionMonitor {
  id: string;
  clinica_central_id: string;
  database_name: string;
  connection_count: number;
  last_activity: string;
  status: string;
  performance_metrics: any;
  nome_clinica?: string;
  subdominio?: string;
}

const DatabaseMonitoringPanel = () => {
  const [connectionStats, setConnectionStats] = useState(dbConnectionFactory.getConnectionStats());

  // Buscar dados de monitoramento
  const { data: monitors, isLoading, refetch } = useQuery({
    queryKey: ['database-monitoring'],
    queryFn: async () => {
      const { data, error } = await (adminSupabase as any)
        .from('database_connections_monitor')
        .select(`
          *,
          clinicas_central!inner(nome_clinica, subdominio, status)
        `)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data as (ConnectionMonitor & { clinicas_central: any })[];
    },
    refetchInterval: 30000 // Atualizar a cada 30s
  });

  // Atualizar stats das conexões em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStats(dbConnectionFactory.getConnectionStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      'active': "default",
      'inactive': "secondary",
      'error': "destructive",
      'ready_for_creation': "secondary"
    };

    const icons: Record<string, React.ReactNode> = {
      'active': <CheckCircle className="h-3 w-3" />,
      'inactive': <Clock className="h-3 w-3" />,
      'error': <AlertCircle className="h-3 w-3" />,
      'ready_for_creation': <Database className="h-3 w-3" />
    };

    return (
      <Badge variant={variants[status] || "outline"} className="gap-1">
        {icons[status]}
        {status.toUpperCase()}
      </Badge>
    );
  };

  const calculateUptime = (lastActivity: string) => {
    const now = Date.now();
    const last = new Date(lastActivity).getTime();
    const diff = now - last;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m atrás`;
    return `${minutes}m atrás`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Bancos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitors?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Bancos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectionStats.active}</div>
            <p className="text-xs text-muted-foreground">Em cache local</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bancos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitors?.filter(m => m.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Status ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">98%</div>
            <Progress value={98} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Painel Detalhado */}
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections" className="gap-2">
            <Database className="h-4 w-4" />
            Conexões
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Status das Conexões por Banco</CardTitle>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Atualizar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitors?.map((monitor) => (
                  <div key={monitor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{monitor.clinicas_central?.nome_clinica}</h3>
                        {getStatusBadge(monitor.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          <span>{monitor.database_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>{monitor.connection_count} conexões</span>
                        </div>
                        <span>Última atividade: {calculateUptime(monitor.last_activity)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {monitor.clinicas_central?.subdominio}.sistema.com
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Plano: {monitor.clinicas_central?.plano_contratado || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}

                {monitors?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum banco de dados monitorado ainda.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tempo Médio de Conexão</span>
                      <span className="font-medium">45ms</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Sucesso</span>
                      <span className="font-medium">99.2%</span>
                    </div>
                    <Progress value={99} />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Conexões em Cache</h4>
                  <div className="space-y-2">
                    {connectionStats.connections.map((conn, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm">{conn.subdominio}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={conn.isActive ? "default" : "secondary"} className="text-xs">
                            {conn.isActive ? 'Ativa' : 'Inativa'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {calculateUptime(conn.lastActivity.toISOString())}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {connectionStats.connections.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma conexão ativa no cache local
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseMonitoringPanel;