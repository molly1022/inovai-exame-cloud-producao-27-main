import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Building2, CheckCircle } from 'lucide-react';

export const SingleTenantInfo = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Sistema Single-Tenant Configurado</h2>
        <p className="text-muted-foreground">Banco de dados limpo e otimizado para clínica específica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <Database className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Banco Limpo</CardTitle>
            <CardDescription>Tabelas administrativas removidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Tabelas admin removidas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>clinica_id removido</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>RLS simplificado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Clínica Única</CardTitle>
            <CardDescription>Modelo otimizado por clínica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Modelo:</strong> Single-Tenant</div>
              <div><strong>Isolamento:</strong> Por banco</div>
              <div><strong>Performance:</strong> Otimizada</div>
              <div><strong>Segurança:</strong> Total</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-success mb-2" />
            <CardTitle>Status</CardTitle>
            <CardDescription>Sistema funcionando</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">✓ Ativo</div>
              <div className="text-sm text-muted-foreground mt-2">
                Pronto para uso operacional
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">✅ Configuração Completa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium">Tabelas Operacionais:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>pacientes</li>
              <li>medicos</li>
              <li>agendamentos</li>
              <li>exames</li>
              <li>funcionarios</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Metadata da Clínica:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>clinica_info (dados únicos)</li>
              <li>configuracoes_clinica</li>
              <li>RLS simplificado</li>
              <li>Contexto único</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTenantInfo;