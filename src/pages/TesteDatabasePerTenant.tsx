import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Settings, TestTube, Globe } from 'lucide-react';
import { TestClinicaCreation } from '@/components/TestClinicaCreation';
import { SystemStatusTest } from '@/components/SystemStatusTest';

/**
 * Página completa para testar o sistema Database-per-Tenant
 */
const TesteDatabasePerTenant = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Database className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Sistema Database-per-Tenant
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Teste completo do sistema multi-tenant com banco central e bancos isolados por clínica
            </p>
          </div>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Banco Central</h3>
                <Badge variant="default">Conectado</Badge>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Globe className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Subdomínios</h3>
                <Badge variant="secondary">Ativo</Badge>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Settings className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <h3 className="font-semibold">Multi-Tenant</h3>
                <Badge variant="outline">Configurado</Badge>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <TestTube className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Testes</h3>
                <Badge variant="default">Pronto</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sistema de Status */}
        <div className="flex justify-center">
          <SystemStatusTest />
        </div>

        {/* Sistema de Criação de Clínicas */}
        <div className="max-w-4xl mx-auto">
          <TestClinicaCreation />
        </div>

        {/* Documentação */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Como Funciona o Sistema</CardTitle>
            <CardDescription>
              Arquitetura e fluxo do sistema Database-per-Tenant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  1. Banco Central
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Armazena informações de todas as clínicas</li>
                  <li>• Gerencia subdomínios e configurações</li>
                  <li>• Controla acesso e permissões</li>
                  <li>• Registra logs e métricas do sistema</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  2. Roteamento por Subdomínio
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Detecta subdomínio automaticamente</li>
                  <li>• Busca configurações no banco central</li>
                  <li>• Estabelece contexto da clínica</li>
                  <li>• Redireciona para banco específico</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  3. Isolamento de Dados
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Cada clínica tem seu banco próprio</li>
                  <li>• Dados completamente isolados</li>
                  <li>• Fallback para RLS quando necessário</li>
                  <li>• Conexões dinâmicas e seguras</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  4. Criação de Clínicas
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Registro automático no central</li>
                  <li>• Geração de subdomínio único</li>
                  <li>• Configuração DNS necessária</li>
                  <li>• Sistema pronto para uso</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Próximos Passos para DNS</h4>
              <ol className="space-y-1 text-sm text-blue-700">
                <li>1. Acesse o painel da Hostinger</li>
                <li>2. Vá em DNS/Nameservers do seu domínio</li>
                <li>3. Adicione um registro CNAME: <code>subdominio</code> → <code>seudominio.com</code></li>
                <li>4. Aguarde propagação DNS (até 24h)</li>
                <li>5. Acesse: <code>subdominio.seudominio.com</code></li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TesteDatabasePerTenant;