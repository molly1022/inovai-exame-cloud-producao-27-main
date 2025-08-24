import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Mail, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';
import { TenantGuard } from '@/components/TenantGuard';

const EmailSystemTestContent = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();
  const { clinica, tenantId } = useClinica();

  const testEmailSystem = async () => {
    if (!clinica?.id) {
      toast({
        title: "Erro",
        description: "Clínica não identificada",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTestResults(null);

    try {
      // Usar Edge Function para testar sistema
      const { data, error } = await supabase.functions.invoke('testar-sistema-email', {
        body: {
          clinica_id: clinica.id
        }
      });

      if (error) {
        throw error;
      }

      setTestResults({
        agendamentos: data.agendamentos || [],
        configuracao: data.configuracao || null,
        emailsEnviados: data.emails_enviados || [],
        dataProximoEnvio: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        horarioEnvio: data.configuracao?.horario_envio || '18:00:00'
      });

      toast({
        title: "Teste Concluído",
        description: "Resultados do sistema de emails carregados com sucesso"
      });

    } catch (error) {
      console.error('Erro no teste de email:', error);
      toast({
        title: "Erro no Teste",
        description: "Erro ao testar sistema de emails",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!clinica?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enviar-lembretes-email', {
        body: {
          teste: true,
          clinica_id: clinica.id
        }
      });

      if (error) throw error;
      
      toast({
        title: "Email de Teste Enviado",
        description: `${data?.emails_enviados || 0} emails enviados com sucesso`
      });
      
      // Recarregar dados após o teste
      testEmailSystem();
    } catch (error) {
      console.error('Erro ao enviar email de teste:', error);
      toast({
        title: "Erro no Envio",
        description: "Erro ao enviar email de teste",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Sistema de Lembretes por Email - Teste
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testEmailSystem} disabled={loading}>
            {loading ? 'Testando...' : 'Testar Sistema'}
          </Button>
          <Button onClick={sendTestEmail} disabled={loading || !testResults} variant="outline">
            Enviar Email de Teste
          </Button>
        </div>

        {testResults && (
          <div className="space-y-4">
            {/* Configuração */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Configurações de Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.configuracao ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Status:</strong> {testResults.configuracao.ativo ? '✅ Ativo' : '❌ Inativo'}</p>
                    <p><strong>Horário de Envio:</strong> {testResults.horarioEnvio}</p>
                    <p><strong>Horas de Antecedência:</strong> {testResults.configuracao.horas_antecedencia}h</p>
                    <p><strong>Remetente:</strong> {testResults.configuracao.remetente_nome} ({testResults.configuracao.remetente_email})</p>
                  </div>
                ) : (
                  <p className="text-red-600">❌ Configuração de email não encontrada</p>
                )}
              </CardContent>
            </Card>

            {/* Próximos Agendamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Agendamentos para {testResults.dataProximoEnvio}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.agendamentos.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm"><strong>{testResults.agendamentos.length}</strong> agendamentos encontrados:</p>
                    {testResults.agendamentos.slice(0, 5).map((ag: any, index: number) => (
                      <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                        <p><strong>{ag.paciente_nome}</strong> - {ag.tipo_exame}</p>
                        <p>Email: {ag.paciente_email} | Horário: {ag.horario}</p>
                        {ag.medico_nome && <p>Médico: {ag.medico_nome}</p>}
                      </div>
                    ))}
                    {testResults.agendamentos.length > 5 && (
                      <p className="text-xs text-gray-500">... e mais {testResults.agendamentos.length - 5} agendamentos</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">Nenhum agendamento encontrado para amanhã</p>
                )}
              </CardContent>
            </Card>

            {/* Emails Enviados Hoje */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Emails Enviados Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.emailsEnviados.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm"><strong>{testResults.emailsEnviados.length}</strong> emails processados hoje:</p>
                    {testResults.emailsEnviados.slice(0, 5).map((email: any, index: number) => (
                      <div key={index} className="text-xs p-2 bg-gray-50 rounded flex items-center gap-2">
                        {email.status_envio === 'enviado' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <div>
                          <p><strong>{email.email_paciente}</strong> - {email.status_envio}</p>
                          <p>{new Date(email.created_at).toLocaleString('pt-BR')}</p>
                          {email.erro_envio && <p className="text-red-600">Erro: {email.erro_envio}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Nenhum email enviado hoje</p>
                )}
              </CardContent>
            </Card>

            {/* Resumo */}
            <Card className="bg-blue-50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">📋 Resumo do Sistema</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Próximo envio:</strong> {testResults.dataProximoEnvio} às {testResults.horarioEnvio}</li>
                  <li>• <strong>Agendamentos elegíveis:</strong> {testResults.agendamentos.length}</li>
                  <li>• <strong>Emails processados hoje:</strong> {testResults.emailsEnviados.length}</li>
                  <li>• <strong>Sistema:</strong> {testResults.configuracao?.ativo ? '✅ Funcionando' : '❌ Inativo'}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EmailSystemTest = () => {
  return (
    <TenantGuard>
      <EmailSystemTestContent />
    </TenantGuard>
  );
};

export default EmailSystemTest;