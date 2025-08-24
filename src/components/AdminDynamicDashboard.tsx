import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Database, 
  Globe, 
  TrendingUp, 
  Users, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface DashboardMetrics {
  totalClinics: number;
  activeClinics: number;
  totalConnections: number;
  avgResponseTime: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastUpdate: Date;
}

interface AdminDynamicDashboardProps {
  clinicas?: any[];
}

export const AdminDynamicDashboard = ({ clinicas = [] }: AdminDynamicDashboardProps) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalClinics: 0,
    activeClinics: 0,
    totalConnections: 0,
    avgResponseTime: 0,
    systemHealth: 'healthy',
    uptime: 99.9,
    lastUpdate: new Date()
  });

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const updateMetrics = () => {
      const now = new Date();
      
      // Simular métricas baseadas nos dados reais (estáticos para evitar loop)
      const totalClinics = clinicas.length;
      const activeClinics = clinicas.filter(c => c.status === 'ativa').length;
      
      // Dados simulados estáticos baseados na quantidade de clínicas
      const totalConnections = totalClinics * 2 + 15;
      const avgResponseTime = 75 + (totalClinics * 5);
      const uptime = 99.7;
      
      // Determinar health baseado em métricas
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (avgResponseTime > 200) systemHealth = 'warning';
      if (avgResponseTime > 500 || uptime < 99) systemHealth = 'critical';

      setMetrics({
        totalClinics,
        activeClinics,
        totalConnections,
        avgResponseTime,
        systemHealth,
        uptime,
        lastUpdate: now
      });
    };

    // Atualizar imediatamente
    updateMetrics();

    // Atualizar a cada 5 segundos quando ao vivo
    const interval = setInterval(() => {
      if (isLive) {
        updateMetrics();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [clinicas, isLive]);

  const getHealthBadge = (health: string) => {
    const config = {
      healthy: { variant: 'default' as const, color: 'text-green-600', icon: CheckCircle, text: 'Saudável' },
      warning: { variant: 'secondary' as const, color: 'text-yellow-600', icon: AlertTriangle, text: 'Atenção' },
      critical: { variant: 'destructive' as const, color: 'text-red-600', icon: AlertTriangle, text: 'Crítico' }
    };
    
    const { variant, color, icon: Icon, text } = config[health as keyof typeof config];
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com Status Tempo Real */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard Dinâmico</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Última atualização: {metrics.lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getHealthBadge(metrics.systemHealth)}
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isLive ? 'Ao Vivo' : 'Pausado'}
          </Button>
        </div>
      </div>

      {/* Métricas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clínicas Totais</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClinics}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeClinics} ativas ({((metrics.activeClinics/metrics.totalClinics)*100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões Ativas</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.totalConnections}</div>
            <p className="text-xs text-muted-foreground">
              ~{Math.floor(metrics.totalConnections/Math.max(metrics.activeClinics, 1))} por clínica
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Resposta</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {metrics.avgResponseTime < 100 ? 'Excelente' : 
               metrics.avgResponseTime < 200 ? 'Bom' : 
               metrics.avgResponseTime < 500 ? 'Médio' : 'Lento'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.uptime.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas do Sistema */}
      {metrics.systemHealth !== 'healthy' && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.avgResponseTime > 200 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Tempo de resposta elevado: {metrics.avgResponseTime}ms
                </div>
              )}
              {metrics.uptime < 99 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Uptime abaixo do esperado: {metrics.uptime.toFixed(2)}%
                </div>
              )}
              {metrics.totalConnections > metrics.totalClinics * 10 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  Número elevado de conexões simultâneas
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};