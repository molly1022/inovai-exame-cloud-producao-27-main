import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  Settings,
  Clock
} from 'lucide-react';

interface TenantDebugPanelProps {
  hostname: string;
  detectedSubdomain: string | null;
  tenant: any;
  connectionReady: boolean;
  isProduction?: boolean;
}

/**
 * Painel de debug para o sistema Database-per-Tenant
 * Mostra informações detalhadas sobre detecção e conexão
 */
export const TenantDebugPanel = ({ 
  hostname, 
  detectedSubdomain, 
  tenant, 
  connectionReady,
  isProduction = false 
}: TenantDebugPanelProps) => {
  
  // Não mostrar em produção real
  if (isProduction) {
    return null;
  }

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Sistema Database-per-Tenant - Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Hostname */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium">
              <Globe className="h-3 w-3" />
              Hostname
            </div>
            <div className="text-muted-foreground font-mono">
              {hostname}
            </div>
          </div>

          {/* Subdomínio Detectado */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium">
              <Database className="h-3 w-3" />
              Subdomínio
            </div>
            <div className="flex items-center gap-1">
              {detectedSubdomain ? (
                <Badge variant="default" className="text-xs">
                  {detectedSubdomain}
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Não detectado
                </Badge>
              )}
            </div>
          </div>

          {/* Status da Clínica */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium">
              <CheckCircle className="h-3 w-3" />
              Clínica
            </div>
            <div className="space-y-1">
              {tenant ? (
                <>
                  <div className="font-medium">{tenant.nome_clinica}</div>
                  <Badge 
                    variant={tenant.status === 'ativa' ? 'default' : 'destructive'} 
                    className="text-xs"
                  >
                    {tenant.status}
                  </Badge>
                </>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Não encontrada
                </Badge>
              )}
            </div>
          </div>

          {/* Conexão com Banco */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium">
              <Database className="h-3 w-3" />
              Conexão
            </div>
            <div className="flex items-center gap-2">
              {connectionReady ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-green-700 text-xs">Banco Isolado</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  <span className="text-yellow-700 text-xs">RLS Fallback</span>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Informações Detalhadas da Clínica */}
        {tenant && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="font-medium text-muted-foreground">Database</div>
                <div className="font-mono">{tenant.database_name}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Plano</div>
                <div>{tenant.plano_contratado}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Criado</div>
                <div>{tenant.database_created ? 'Sim' : 'Não'}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Último Acesso
                </div>
                <div>
                  {tenant.ultimo_acesso 
                    ? new Date(tenant.ultimo_acesso).toLocaleString('pt-BR') 
                    : 'Nunca'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* URLs de Teste */}
        <div className="mt-4 pt-4 border-t border-orange-200">
          <div className="font-medium text-xs mb-2">URLs de Teste:</div>
          <div className="space-y-1 text-xs font-mono">
            <div>• teste-1.somosinovai.com</div>
            <div>• localhost:5173/tenant-test</div>
            <div>• {hostname}/tenant-test</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};