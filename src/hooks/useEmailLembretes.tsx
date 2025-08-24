import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClinica } from '@/hooks/useClinica';

interface ConfiguracaoLembretes {
  id?: string;
  ativo: boolean;
  horario_envio: string;
  antecedencia_horas: number;
  horas_antecedencia: number;
  template_email: string;
  template_personalizado?: string;
  assunto_email: string;
}

const configuracaoDefault: ConfiguracaoLembretes = {
  ativo: true,
  horario_envio: '18:00',
  antecedencia_horas: 24,
  horas_antecedencia: 24,
  template_email: 'Olá {paciente_nome}! Lembrete de consulta para amanhã.',
  template_personalizado: '',
  assunto_email: 'Lembrete: Consulta agendada'
};

export const useEmailLembretes = () => {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoLembretes>(configuracaoDefault);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { toast } = useToast();

  const salvarConfiguracao = useCallback(async (novaConfiguracao: ConfiguracaoLembretes) => {
    try {
      setSalvando(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfiguracao(novaConfiguracao);
      toast({ title: "Configuração salva", description: "Demo: configuração atualizada" });
    } catch (error) {
      toast({ title: "Erro", description: "Erro demo", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }, [toast]);

  const atualizarConfiguracao = useCallback(async (novaConfiguracao: ConfiguracaoLembretes) => {
    await salvarConfiguracao(novaConfiguracao);
  }, [salvarConfiguracao]);

  const recarregarDados = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  }, []);

  // Create demo email lembrete data
  const demoLembretes = [{
    id: '1',
    email_paciente: 'demo@email.com',
    status_envio: 'enviado' as const,
    tentativas: 1,
    created_at: new Date().toISOString(),
    ...configuracao
  }];

  return { 
    configuracao, 
    loading, 
    salvando,
    salvarConfiguracao,
    atualizarConfiguracao,
    recarregarDados,
    lembretes: demoLembretes
  };
};