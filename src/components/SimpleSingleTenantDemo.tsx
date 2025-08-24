import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle, Building2, Settings } from 'lucide-react';

interface SimpleSingleTenantDemoProps {
  title: string;
  description: string;
  type?: 'logs' | 'metricas' | 'configuracoes' | 'default';
}

export const SimpleSingleTenantDemo = ({ title, description, type = 'default' }: SimpleSingleTenantDemoProps) => {
  const getIcon = () => {
    switch (type) {
      case 'logs': return <Database className="h-8 w-8 text-primary" />;
      case 'metricas': return <CheckCircle className="h-8 w-8 text-success" />;
      case 'configuracoes': return <Settings className="h-8 w-8 text-primary" />;
      default: return <Building2 className="h-8 w-8 text-primary" />;
    }
  };

  const getDemoData = () => {
    switch (type) {
      case 'logs':
        return [
          { label: 'Sistema iniciado', valor: '✅ OK', timestamp: '2024-08-22 16:21:16' },
          { label: 'Banco limpo', valor: '✅ Concluído', timestamp: '2024-08-22 16:21:17' },
          { label: 'RLS configurado', valor: '✅ Ativo', timestamp: '2024-08-22 16:21:18' }
        ];
      case 'metricas':
        return [
          { label: 'CPU', valor: '45%', status: 'normal' },
          { label: 'Memória', valor: '67%', status: 'normal' },
          { label: 'Disco', valor: '23%', status: 'normal' }
        ];
      case 'configuracoes':
        return [
          { label: 'Sistema ativo', valor: 'true', tipo: 'boolean' },
          { label: 'Backup automático', valor: 'true', tipo: 'boolean' },
          { label: 'Modo segurança', valor: 'ativo', tipo: 'string' }
        ];
      default:
        return [
          { label: 'Status', valor: 'Ativo', status: 'success' },
          { label: 'Modelo', valor: 'Single-Tenant', status: 'info' },
          { label: 'Isolamento', valor: 'Por banco', status: 'info' }
        ];
    }
  };

  const demoData = getDemoData();

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="text-center">
          {getIcon()}
          <CardTitle className="mt-4">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Database className="h-4 w-4" />
            <AlertDescription>
              Sistema single-tenant ativo. Dados de demonstração sendo exibidos.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {demoData.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{item.label}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  item.status === 'success' ? 'bg-green-100 text-green-800' :
                  item.status === 'info' ? 'bg-blue-100 text-blue-800' :
                  item.status === 'normal' ? 'bg-gray-100 text-gray-800' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {item.valor}
                </span>
                {'timestamp' in item && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {item.timestamp}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">✅ Sistema Configurado</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Tabelas administrativas removidas</div>
              <div>• clinica_id removido das tabelas operacionais</div>
              <div>• RLS simplificado para single-tenant</div>
              <div>• Banco isolado por clínica</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleSingleTenantDemo;