import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClinica } from '@/hooks/useClinica';
import { Clock, CheckCircle, XCircle, AlertCircle, Play, RefreshCw, Mail } from 'lucide-react';
import { TenantGuard } from '@/components/TenantGuard';

interface EmailLembrete {
  id: string;
  email_paciente: string;
  status_envio: string;
  data_envio?: string;
  erro_envio?: string;
  tentativas: number;
  created_at: string;
}

const EmailSystemStatusContent = () => {
  const [lembretes, setLembretes] = useState<EmailLembrete[]>([]);
  const [stats, setStats] = useState({
    enviados: 0,
    erros: 0,
    pendentes: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const { toast } = useToast();
  const { tenantId } = useClinica();

  const fetchLembretes = async () => {
    try {
      // Usar Edge Function para buscar dados
      const { data, error } = await supabase.functions.invoke('buscar-status-lembretes', {
        body: { 
          clinica_id: tenantId,
          days: 7
        }
      });

      if (error) throw error;

      const lembretesList = data?.lembretes || [];
      setLembretes(lembretesList);

      // Calcular estatísticas
      const enviados = lembretesList.filter((l: any) => l.status_envio === 'enviado').length;
      const erros = lembretesList.filter((l: any) => l.status_envio === 'erro').length;
      const pendentes = lembretesList.filter((l: any) => l.status_envio === 'pendente').length;

      setStats({
        enviados,
        erros,
        pendentes,
        total: lembretesList.length
      });
    } catch (error) {
      console.error('Erro ao buscar lembretes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o status do sistema",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testSystem = async () => {
    setTestLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enviar-lembretes-email', {
        body: { 
          teste: true,
          trigger: 'manual_test',
          clinica_id: tenantId
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Teste Executado",
        description: "Sistema testado com sucesso! Verifique o email de teste.",
      });

      // Recarregar dados após o teste
      setTimeout(() => {
        fetchLembretes();
      }, 2000);
    } catch (error: any) {
      console.error('Erro no teste:', error);
      toast({
        title: "❌ Erro no Teste",
        description: error.message || "Erro ao testar o sistema",
        variant: "destructive"
      });
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchLembretes();
    }
  }, [tenantId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviado':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Enviado</Badge>;
      case 'erro':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Erro</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2">Carregando status do sistema...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Status do Sistema de Emails (Últimos 7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-blue-800">Total</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.enviados}</div>
              <p className="text-sm text-green-800">Enviados</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.erros}</div>
              <p className="text-sm text-red-800">Erros</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
              <p className="text-sm text-yellow-800">Pendentes</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={testSystem} 
              disabled={testLoading}
              className="flex-1"
            >
              {testLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Testar Sistema
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={fetchLembretes}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Lembretes Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Lembretes Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {lembretes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum lembrete encontrado nos últimos 7 dias</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {lembretes.map((lembrete) => (
                <div key={lembrete.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{lembrete.email_paciente}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(lembrete.created_at).toLocaleString('pt-BR')}
                    </p>
                    {lembrete.erro_envio && (
                      <p className="text-xs text-red-600 mt-1">{lembrete.erro_envio}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(lembrete.status_envio)}
                    <span className="text-xs text-gray-500">
                      {lembrete.tentativas}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const EmailSystemStatus = () => {
  return (
    <TenantGuard>
      <EmailSystemStatusContent />
    </TenantGuard>
  );
};

export default EmailSystemStatus;