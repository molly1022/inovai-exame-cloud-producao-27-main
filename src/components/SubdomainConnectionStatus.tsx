import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Globe, Activity, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useSubdomainRouting } from "@/hooks/useSubdomainRouting";
import { useTenantConnection } from "@/hooks/useTenantConnection";

interface SubdomainConnectionStatusProps {
  showDetails?: boolean;
}

/**
 * Componente para mostrar status da conexão por subdomínio
 * Sistema Database-per-Tenant
 */
export const SubdomainConnectionStatus = ({ showDetails = true }: SubdomainConnectionStatusProps) => {
  const { clinica, loading: routingLoading, error: routingError, isValidSubdomain } = useSubdomainRouting();
  const { 
    isConnected, 
    loading: connectionLoading, 
    error: connectionError,
    databaseName,
    subdominio 
  } = useTenantConnection();

  const getStatusIcon = () => {
    if (routingLoading || connectionLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    }
    
    if (isValidSubdomain && isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusBadge = () => {
    if (routingLoading || connectionLoading) {
      return <Badge variant="outline">Conectando...</Badge>;
    }
    
    if (isValidSubdomain && isConnected) {
      return <Badge variant="default">Conectado</Badge>;
    }
    
    return <Badge variant="destructive">Desconectado</Badge>;
  };

  const getCurrentSubdomain = () => {
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('lovableproject.com')) {
      return 'clinica-demo'; // Desenvolvimento
    }
    
    return hostname.split('.')[0] || 'indefinido';
  };

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        {getStatusBadge()}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Status da Conexão Database-per-Tenant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Status da Conexão:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>

        {/* Informações do Subdomínio */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>Subdomínio Detectado:</strong> {getCurrentSubdomain()}
            </span>
          </div>
          
          {clinica && (
            <>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Database:</strong> {clinica.database_name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Clínica:</strong> {clinica.nome_clinica}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">{clinica.plano_contratado}</Badge>
                <Badge variant={clinica.status === 'ativa' ? 'default' : 'secondary'}>
                  {clinica.status}
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Erros */}
        {(routingError || connectionError) && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>Erro:</strong> {routingError || connectionError}
            </p>
          </div>
        )}

        {/* Informações Técnicas */}
        {clinica && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Informações Técnicas:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div><strong>ID da Clínica:</strong> {clinica.id}</div>
              <div><strong>URL Completa:</strong> {clinica.subdominio}.sistema.com</div>
              <div><strong>Sistema:</strong> Database-per-Tenant v2.0</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};