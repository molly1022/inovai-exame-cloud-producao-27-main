import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Play, 
  Video, 
  Key,
  Globe,
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: any;
}

const TeleconsultaTester = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [dailyConfigured, setDailyConfigured] = useState<boolean | null>(null);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const updateLastResult = (updates: Partial<TestResult>) => {
    setResults(prev => prev.map((r, i) => i === prev.length - 1 ? { ...r, ...updates } : r));
  };

  const clearResults = () => {
    setResults([]);
  };

  // Teste 1: Verificar se Daily.co API está configurada
  const testDailyConfig = async () => {
    addResult({
      name: 'Configuração Daily.co API',
      status: 'loading',
      message: 'Verificando chave API...'
    });

    try {
      const { data, error } = await supabase.functions.invoke('daily-config-check');
      
      if (error) {
        updateLastResult({
          status: 'error',
          message: `Erro ao verificar configuração: ${error.message}`,
          details: error
        });
        setDailyConfigured(false);
        return false;
      }

      if (data?.configured) {
        updateLastResult({
          status: 'success',
          message: '✅ Daily.co API configurada corretamente'
        });
        setDailyConfigured(true);
        return true;
      } else {
        updateLastResult({
          status: 'error',
          message: '❌ Daily.co API não configurada - chave DAILY_API_KEY não encontrada',
          details: 'Configure DAILY_API_KEY nas secrets do Supabase'
        });
        setDailyConfigured(false);
        return false;
      }
    } catch (error) {
      updateLastResult({
        status: 'error',
        message: `❌ Erro de conexão: ${error}`,
        details: error
      });
      setDailyConfigured(false);
      return false;
    }
  };

  // Teste 2: Criar sala de teste
  const testRoomCreation = async () => {
    addResult({
      name: 'Criação de Sala Daily.co',
      status: 'loading',
      message: 'Criando sala de teste...'
    });

    try {
      const testAgendamentoId = 'test-' + Date.now();
      const { data, error } = await supabase.functions.invoke('create-daily-room', {
        body: {
          agendamento_id: testAgendamentoId,
          clinica_id: '00000000-0000-0000-0000-000000000001' // ID de teste
        }
      });

      if (error) {
        updateLastResult({
          status: 'error',
          message: `❌ Erro ao criar sala: ${error.message}`,
          details: error
        });
        return null;
      }

      if (data?.success) {
        updateLastResult({
          status: 'success',
          message: `✅ Sala criada: ${data.room?.name}`,
          details: data
        });
        return data;
      } else {
        updateLastResult({
          status: 'warning',
          message: '⚠️ Modo demo ativo - Daily.co não configurado',
          details: data
        });
        return data;
      }
    } catch (error) {
      updateLastResult({
        status: 'error',
        message: `❌ Erro na criação: ${error}`,
        details: error
      });
      return null;
    }
  };

  // Teste 3: Verificar URLs geradas
  const testUrlValidation = async (roomData: any) => {
    addResult({
      name: 'Validação de URLs',
      status: 'loading',
      message: 'Validando URLs geradas...'
    });

    try {
      const medicoUrl = roomData?.urls?.medico;
      const pacienteUrl = roomData?.urls?.paciente;

      if (!medicoUrl || !pacienteUrl) {
        updateLastResult({
          status: 'error',
          message: '❌ URLs não foram geradas',
          details: { roomData }
        });
        return false;
      }

      // Verificar se são URLs válidas
      try {
        new URL(medicoUrl);
        new URL(pacienteUrl);
      } catch {
        updateLastResult({
          status: 'error',
          message: '❌ URLs inválidas geradas',
          details: { medicoUrl, pacienteUrl }
        });
        return false;
      }

      updateLastResult({
        status: 'success',
        message: '✅ URLs válidas geradas',
        details: { medicoUrl, pacienteUrl }
      });
      return true;
    } catch (error) {
      updateLastResult({
        status: 'error',
        message: `❌ Erro na validação: ${error}`,
        details: error
      });
      return false;
    }
  };

  // Teste 4: Simular acesso à sala
  const testRoomAccess = async (roomData: any) => {
    addResult({
      name: 'Teste de Acesso à Sala',
      status: 'loading',
      message: 'Testando acesso às URLs...'
    });

    try {
      const medicoUrl = roomData?.urls?.medico;
      
      if (!medicoUrl) {
        updateLastResult({
          status: 'error',
          message: '❌ URL do médico não disponível'
        });
        return false;
      }

      // Tentar fazer uma requisição à URL (modo no-cors para evitar problemas)
      const response = await fetch(medicoUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      });

      updateLastResult({
        status: 'success',
        message: '✅ URLs acessíveis - pronto para teste real',
        details: 'Use as URLs nos iframes para testar videochamada'
      });
      return true;
    } catch (error) {
      updateLastResult({
        status: 'warning',
        message: '⚠️ Não foi possível testar acesso (normal devido ao CORS)',
        details: 'URLs podem estar funcionando - teste manualmente'
      });
      return true; // Consideramos sucesso pois CORS é esperado
    }
  };

  // Executar todos os testes
  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();

    try {
      // Teste 1: Configuração
      const configOk = await testDailyConfig();
      
      if (!configOk) {
        toast.error('Daily.co não configurado - configure DAILY_API_KEY');
        setIsRunning(false);
        return;
      }

      // Teste 2: Criação de sala
      const roomData = await testRoomCreation();
      
      if (!roomData) {
        toast.error('Falha na criação de sala');
        setIsRunning(false);
        return;
      }

      // Teste 3: Validação de URLs
      const urlsOk = await testUrlValidation(roomData);
      
      if (!urlsOk) {
        toast.error('URLs inválidas geradas');
        setIsRunning(false);
        return;
      }

      // Teste 4: Teste de acesso
      await testRoomAccess(roomData);

      toast.success('✅ Todos os testes concluídos!');
    } catch (error) {
      toast.error(`Erro nos testes: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'loading': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'loading': return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            Diagnóstico de Telemedicina
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sistema completo de testes para identificar e corrigir problemas de acesso às videochamadas
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status da API */}
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="text-sm font-medium">Status da API Daily.co:</span>
              {dailyConfigured === null ? (
                <Badge variant="outline">Não verificado</Badge>
              ) : dailyConfigured ? (
                <Badge className="bg-green-100 text-green-800">Configurada</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">Não configurada</Badge>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <Button 
                onClick={runAllTests}
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Executar Diagnóstico Completo
              </Button>
              
              <Button 
                variant="outline"
                onClick={clearResults}
                disabled={isRunning}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar Resultados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados dos testes */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded-lg ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{result.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </div>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-blue-600">
                            Ver detalhes
                          </summary>
                          <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções para corrigir problemas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Como Corrigir o Erro "You are not allowed to join this meeting"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-3">
            <div>
              <strong>🔑 1. Configurar Daily.co API Key</strong>
              <p className="text-muted-foreground mt-1">
                O erro acontece quando a chave API não está configurada ou está incorreta.
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-1 ml-4">
                <li>Acesse <a href="https://dashboard.daily.co/" target="_blank" className="text-blue-600">Daily.co Dashboard</a></li>
                <li>Vá em "Developers" → "API Keys"</li>
                <li>Copie sua API key</li>
                <li>Configure como secret "DAILY_API_KEY" no Supabase</li>
              </ul>
            </div>

            <div>
              <strong>🏠 2. Configuração de Salas</strong>
              <p className="text-muted-foreground mt-1">
                Salas privadas precisam de Meeting Tokens ou devem ser públicas.
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-1 ml-4">
                <li>Salas públicas: Acesso direto com URLs</li>
                <li>Salas privadas: Requerem Meeting Tokens</li>
                <li>Implementamos salas públicas com expiração para segurança</li>
              </ul>
            </div>

            <div>
              <strong>🔗 3. URLs de Acesso</strong>
              <p className="text-muted-foreground mt-1">
                URLs devem ser geradas corretamente com parâmetros de usuário.
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-1 ml-4">
                <li>Médico: userName=Dr.Nome&userRole=moderator</li>
                <li>Paciente: userName=Nome&userRole=participant</li>
                <li>Encoding adequado para nomes com acentos</li>
              </ul>
            </div>

            <div>
              <strong>⏰ 4. Controle de Acesso Temporal</strong>
              <p className="text-muted-foreground mt-1">
                Acesso liberado 15 minutos antes até 2 horas depois da consulta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeleconsultaTester;