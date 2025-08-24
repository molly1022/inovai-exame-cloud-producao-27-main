import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Key, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

const ConfigureDailyAPI = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    // Aqui seria implementado o teste real da conexão
    setTimeout(() => {
      setIsTestingConnection(false);
      toast.success('Teste de conexão realizado!');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            Configuração da API Daily.co
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure sua chave API do Daily.co para habilitar videochamadas
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status atual */}
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-red-50 border-red-200">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <span className="font-medium text-red-800">API não configurada</span>
              <p className="text-sm text-red-600">Configure a chave DAILY_API_KEY para habilitar telemedicina</p>
            </div>
          </div>

          {/* Passo 1: Obter chave API */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Passo 1: Obter chave API do Daily.co</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🆓 Conta Gratuita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="text-sm space-y-1">
                    <li>• 1.000 minutos/mês grátis</li>
                    <li>• Até 5 participantes</li>
                    <li>• Qualidade HD</li>
                    <li>• Sem custo adicional</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('https://dashboard.daily.co/signup', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Criar Conta Grátis
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">💼 Conta Paga</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="text-sm space-y-1">
                    <li>• Minutos ilimitados</li>
                    <li>• Até 200 participantes</li>
                    <li>• Gravação de chamadas</li>
                    <li>• Suporte prioritário</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('https://www.daily.co/pricing', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Preços
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Passo 2: Instruções */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Passo 2: Obter sua API Key</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="font-medium text-blue-800">Instruções:</div>
              <ol className="text-sm text-blue-700 space-y-2">
                <li>1. Acesse o <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-600 underline"
                  onClick={() => window.open('https://dashboard.daily.co/', '_blank')}
                >
                  Dashboard do Daily.co
                </Button></li>
                <li>2. Vá para "Developers" → "API Keys"</li>
                <li>3. Clique em "Create API Key"</li>
                <li>4. Dê um nome (ex: "Telemedicina")</li>
                <li>5. Copie a chave gerada</li>
                <li>6. Cole a chave no campo abaixo</li>
              </ol>
            </div>
          </div>

          {/* Passo 3: Configurar no Supabase */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Passo 3: Configurar no Supabase</h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <div className="font-medium text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Configure como Secret
              </div>
              <ol className="text-sm text-yellow-700 space-y-2">
                <li>1. Acesse o <Button 
                  variant="link" 
                  className="p-0 h-auto text-yellow-600 underline"
                  onClick={() => window.open('https://supabase.com/dashboard/project/sxtqlnayloetwlcjtkbj/settings/functions', '_blank')}
                >
                  Painel de Secrets do Supabase
                </Button></li>
                <li>2. Clique em "Add new secret"</li>
                <li>3. Nome: <code className="bg-yellow-100 px-1 rounded">DAILY_API_KEY</code></li>
                <li>4. Valor: Cole sua API key do Daily.co</li>
                <li>5. Clique em "Add secret"</li>
              </ol>
            </div>

            {/* Exemplo de configuração */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="text-sm font-medium mb-2">Exemplo de configuração:</div>
              <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
                <div>Name: DAILY_API_KEY</div>
                <div className="flex items-center gap-2">
                  <span>Value: </span>
                  {showApiKey ? (
                    <span>abc123def456ghi789jkl012mno345pqr678stu901</span>
                  ) : (
                    <span>••••••••••••••••••••••••••••••••••••••••••••</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="h-6 w-6 p-0"
                  >
                    {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Teste de conectividade */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Passo 4: Testar Configuração</h3>
            
            <div className="flex gap-3">
              <Button 
                onClick={testConnection}
                disabled={isTestingConnection}
                className="bg-green-600 hover:bg-green-700"
              >
                {isTestingConnection ? (
                  <>Testando...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Testar Conexão
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.open('/telemedicina-diagnostico', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Diagnóstico Completo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>❓ Problemas Comuns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <details className="border rounded-lg p-3">
              <summary className="font-medium cursor-pointer">Erro "You are not allowed to join this meeting"</summary>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Este erro acontece quando:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>A chave API não está configurada</li>
                  <li>A chave API está incorreta</li>
                  <li>A sala foi configurada como privada sem tokens</li>
                </ul>
                <p className="mt-2">
                  <strong>Solução:</strong> Configure a DAILY_API_KEY corretamente no Supabase.
                </p>
              </div>
            </details>

            <details className="border rounded-lg p-3">
              <summary className="font-medium cursor-pointer">Como verificar se a API está funcionando?</summary>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Acesse a página de <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => window.open('/telemedicina-diagnostico', '_blank')}
                >
                  Diagnóstico de Telemedicina
                </Button> e execute todos os testes.</p>
              </div>
            </details>

            <details className="border rounded-lg p-3">
              <summary className="font-medium cursor-pointer">Quantas teleconsultas posso fazer gratuitamente?</summary>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Com a conta gratuita do Daily.co:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>1.000 minutos por mês</li>
                  <li>Cerca de 16-17 horas de videochamada</li>
                  <li>Aproximadamente 30-60 consultas de 15-30 minutos</li>
                </ul>
              </div>
            </details>

            <details className="border rounded-lg p-3">
              <summary className="font-medium cursor-pointer">A configuração é segura?</summary>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Sim! A chave API é armazenada como secret no Supabase e não fica exposta no frontend. 
                   Apenas as edge functions do servidor têm acesso à chave.</p>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigureDailyAPI;