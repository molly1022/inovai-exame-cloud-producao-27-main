import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const DailyConfigTest = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    configured: boolean;
    message: string;
    tested: boolean;
  } | null>(null);

  const testDailyConfig = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testando configuração Daily.co...');
      
      const { data, error } = await supabase.functions.invoke('daily-config-check');
      
      if (error) {
        console.error('Erro na edge function:', error);
        setConfigStatus({
          configured: false,
          message: 'Erro ao verificar configuração: ' + error.message,
          tested: true
        });
        toast({
          title: "Erro",
          description: "Não foi possível verificar a configuração",
          variant: "destructive"
        });
        return;
      }

      console.log('📊 Resultado do teste:', data);
      
      setConfigStatus({
        configured: data.configured || false,
        message: data.message || data.error || 'Configuração verificada',
        tested: true
      });

      if (data.configured) {
        toast({
          title: "✅ Configuração OK",
          description: "API Daily.co está configurada corretamente"
        });
      } else {
        toast({
          title: "⚠️ Configuração Pendente",
          description: data.error || "API Daily.co não está configurada",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erro ao testar configuração:', error);
      setConfigStatus({
        configured: false,
        message: 'Erro interno: ' + (error as Error).message,
        tested: true
      });
      toast({
        title: "Erro",
        description: "Falha no teste de configuração",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (!configStatus?.tested) return null;
    
    if (configStatus.configured) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    if (!configStatus?.tested) return null;
    
    if (configStatus.configured) {
      return <Badge variant="default" className="bg-green-500">Configurado</Badge>;
    } else {
      return <Badge variant="destructive">Não Configurado</Badge>;
    }
  };

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Status da API Daily.co
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Teste a configuração da API Daily.co para verificar se a telemedicina está funcionando corretamente.</p>
        </div>

        {configStatus?.tested && (
          <div className="p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              <span className="font-medium text-sm">
                {configStatus.configured ? 'Configuração Válida' : 'Problema de Configuração'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {configStatus.message}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={testDailyConfig}
            disabled={testing}
            variant={configStatus?.configured ? "outline" : "default"}
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              'Testar Configuração'
            )}
          </Button>

          {!configStatus?.configured && (
            <Button
              variant="secondary"
              onClick={() => window.open('https://dashboard.daily.co', '_blank')}
            >
              Obter API Key
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p><strong>Importante:</strong> A API Daily.co é necessária para criar salas de teleconsulta.</p>
          <p>Configure a API key como secret 'DAILY_API_KEY' no Supabase.</p>
        </div>
      </CardContent>
    </Card>
  );
};