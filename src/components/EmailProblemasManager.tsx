import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';
import { TenantGuard } from '@/components/TenantGuard';

interface EmailLembrete {
  id: string;
  email_paciente: string;
  status_envio: 'pendente' | 'enviado' | 'erro' | 'cancelado';
  erro_envio?: string;
  tentativas: number;
  created_at: string;
  data_envio?: string;
}

interface EmailProblemasManagerProps {
  lembretes: EmailLembrete[];
  onRecarregar: () => void;
}

const EmailProblemasManagerContent = ({ lembretes, onRecarregar }: EmailProblemasManagerProps) => {
  const [limpandoErros, setLimpandoErros] = useState(false);
  const [reenviarId, setReenviarId] = useState<string | null>(null);
  const { toast } = useToast();
  const { tenantId } = useClinica();

  // Filtrar emails cancelados - eles não devem aparecer na interface
  const emailsAtivos = lembretes.filter(l => l.status_envio !== 'cancelado');
  const emailsComProblema = emailsAtivos.filter(l => l.status_envio === 'erro');
  const emailsPendentes = emailsAtivos.filter(l => l.status_envio === 'pendente');

  const limparEmailsAntigos = async () => {
    setLimpandoErros(true);
    try {
      console.log('Iniciando limpeza de emails antigos...');
      
      // Usando Edge Function ao invés de RPC diretamente
      const { data, error } = await supabase.functions.invoke('limpar-emails-antigos', {
        body: { 
          clinica_id: tenantId
        }
      });
      
      if (error) {
        console.error('Erro na função limpar_emails_antigos:', error);
        throw error;
      }

      console.log('Limpeza concluída. Emails limpos:', data);

      toast({
        title: "Limpeza concluída",
        description: `${data?.removidos || 0} emails antigos com erro foram removidos da exibição`
      });
      
      // Recarregar dados após a limpeza
      await onRecarregar();
    } catch (error) {
      console.error('Erro ao limpar emails:', error);
      toast({
        title: "Erro na limpeza",
        description: error.message || "Não foi possível limpar os emails antigos",
        variant: "destructive"
      });
    } finally {
      setLimpandoErros(false);
    }
  };

  const reenviarEmail = async (lembreteId: string, emailPaciente: string) => {
    setReenviarId(lembreteId);
    try {
      console.log('Tentando reenviar email para:', emailPaciente);
      
      // Tentar reenviar usando Edge Function
      const { error: sendError } = await supabase.functions.invoke('enviar-lembretes-email', {
        body: { 
          force: true, 
          clinica_id: tenantId,
          email_especifico: emailPaciente,
          lembrete_id: lembreteId
        }
      });

      if (sendError) {
        console.error('Erro ao reenviar:', sendError);
        throw sendError;
      }

      toast({
        title: "Email reenviado",
        description: `Tentativa de reenvio para ${emailPaciente} foi iniciada`
      });
      
      // Aguardar um pouco antes de recarregar para dar tempo do processamento
      setTimeout(() => {
        onRecarregar();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      toast({
        title: "Erro no reenvio",
        description: error.message || "Não foi possível reenviar o email",
        variant: "destructive"
      });
    } finally {
      setReenviarId(null);
    }
  };

  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email) && 
           !email.includes('@teste') && 
           !email.includes('@example') &&
           !email.endsWith('@gmail.co') &&
           !email.endsWith('@hotmail.co');
  };

  if (emailsComProblema.length === 0 && emailsPendentes.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          ✅ Nenhum problema encontrado com os emails! Todos os lembretes estão funcionando normalmente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {emailsComProblema.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Emails com Problema
                <Badge variant="destructive">{emailsComProblema.length}</Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={limparEmailsAntigos}
                disabled={limpandoErros}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {limpandoErros ? "Limpando..." : "Limpar Antigos"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {emailsComProblema.map((lembrete) => {
                const emailValido = validarEmail(lembrete.email_paciente);
                const isOld = new Date(lembrete.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000);
                
                return (
                  <div key={lembrete.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{lembrete.email_paciente}</span>
                        {!emailValido && (
                          <Badge variant="destructive" className="text-xs">Email Inválido</Badge>
                        )}
                        {isOld && (
                          <Badge variant="secondary" className="text-xs">Antigo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-red-600 mt-1">{lembrete.erro_envio}</p>
                      <p className="text-xs text-gray-500">
                        {lembrete.tentativas} tentativa{lembrete.tentativas !== 1 ? 's' : ''} • 
                        {new Date(lembrete.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {emailValido && !isOld && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reenviarEmail(lembrete.id, lembrete.email_paciente)}
                        disabled={reenviarId === lembrete.id}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${reenviarId === lembrete.id ? 'animate-spin' : ''}`} />
                        {reenviarId === lembrete.id ? "Reenviando..." : "Tentar Novamente"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {emailsPendentes.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ⏳ {emailsPendentes.length} email{emailsPendentes.length !== 1 ? 's' : ''} pendente{emailsPendentes.length !== 1 ? 's' : ''} de envio. 
            Se ficarem pendentes por muito tempo, verifique a configuração do Resend.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const EmailProblemasManager = ({ lembretes, onRecarregar }: EmailProblemasManagerProps) => {
  return (
    <TenantGuard>
      <EmailProblemasManagerContent lembretes={lembretes} onRecarregar={onRecarregar} />
    </TenantGuard>
  );
};

export default EmailProblemasManager;