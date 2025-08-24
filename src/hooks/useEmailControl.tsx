import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClinica } from '@/hooks/useClinica';

export interface EmailControlStats {
  proximosLembretes: number;
  lembretesEnviadosHoje: number;
  pendentes: number;
  sistemaAtivo: boolean;
  ultimaExecucao?: string;
  proximaExecucao: string;
}

export interface ProximoAgendamento {
  id: string;
  paciente_nome: string;
  paciente_email: string;
  data_agendamento: string;
  horario: string;
  tipo_exame: string;
}

export const useEmailControl = () => {
  const [stats, setStats] = useState<EmailControlStats>({
    proximosLembretes: 5,
    lembretesEnviadosHoje: 12,
    pendentes: 3,
    sistemaAtivo: true,
    proximaExecucao: '18:00'
  });
  const [proximosAgendamentos, setProximosAgendamentos] = useState<ProximoAgendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviandoManual, setEnviandoManual] = useState(false);
  const { toast } = useToast();
  const { clinica } = useClinica();

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Dados demo
      const agendamentosDemo = [
        {
          id: '1',
          paciente_nome: 'João Silva',
          paciente_email: 'joao@email.com',
          data_agendamento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          horario: '09:00',
          tipo_exame: 'Consulta'
        }
      ];

      setProximosAgendamentos(agendamentosDemo);
      setStats({
        proximosLembretes: agendamentosDemo.length,
        lembretesEnviadosHoje: 12,
        pendentes: 3,
        sistemaAtivo: true,
        proximaExecucao: '18:00'
      });
    } catch (error) {
      console.error('Erro demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const enviarLembretesManual = async () => {
    try {
      setEnviandoManual(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Lembretes enviados",
        description: "Demonstração: lembretes processados com sucesso"
      });
      fetchStats();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro na demonstração",
        variant: "destructive"
      });
    } finally {
      setEnviandoManual(false);
    }
  };

  const toggleSistema = async (ativo: boolean) => {
    setStats(prev => ({ ...prev, sistemaAtivo: ativo }));
    toast({
      title: ativo ? "Sistema ativado" : "Sistema desativado",
      description: "Demonstração: configuração atualizada"
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const enviarLembretesAgora = enviarLembretesManual;
  const alternarSistema = (ativo?: boolean) => {
    if (ativo !== undefined) {
      return toggleSistema(ativo);
    } else {
      return toggleSistema(!stats.sistemaAtivo);
    }
  };
  const recarregarStats = fetchStats;

  return {
    stats,
    proximosAgendamentos,
    loading,
    enviandoManual,
    fetchStats,
    enviarLembretesManual,
    enviarLembretesAgora,
    toggleSistema,
    alternarSistema,
    recarregarStats
  };
};