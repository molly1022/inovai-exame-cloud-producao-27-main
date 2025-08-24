import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClinica } from '@/hooks/useClinica';

export const useReagendamento = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { clinica } = useClinica();

  const reagendarConsulta = async (
    agendamentoOriginalId: string,
    novaData: string,
    novoHorario: string,
    motivo: string,
    observacoes?: string
  ) => {
    if (!clinica?.id) {
      toast({
        title: "Erro",
        description: "Clínica não encontrada",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      // Demo: simular reagendamento
      console.log('Demo: Reagendando consulta ID:', agendamentoOriginalId);
      console.log('Demo: Nova data/horário:', novaData, novoHorario);
      console.log('Demo: Motivo:', motivo);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo: simular operações de reagendamento

      toast({
        title: "Consulta reagendada",
        description: `Consulta reagendada para ${new Date(`${novaData}T${novoHorario}`).toLocaleString('pt-BR')}`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao reagendar consulta:', error);
      toast({
        title: "Erro",
        description: "Erro ao reagendar consulta",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const obterHistoricoReagendamentos = async (agendamentoId: string) => {
    try {
      // Demo: simular histórico de reagendamentos
      console.log('Demo: Buscando histórico para agendamento ID:', agendamentoId);
      await new Promise(resolve => setTimeout(resolve, 300));

      const historicoDemo = [
        {
          id: '1',
          agendamento_original_id: agendamentoId,
          agendamento_novo_id: 'novo_123',
          motivo: 'Solicitação do paciente',
          observacoes: 'Reagendado para melhor horário',
          data_reagendamento: new Date(Date.now() - 86400000).toISOString(),
          agendamentos: {
            data_agendamento: '2024-01-20T10:00:00-03:00',
            horario: '10:00',
            status: 'cancelado'
          }
        }
      ];

      return { data: historicoDemo, error: null };
    } catch (error) {
      console.error('Erro demo ao buscar histórico de reagendamentos:', error);
      return { data: [], error };
    }
  };

  return {
    reagendarConsulta,
    obterHistoricoReagendamentos,
    loading
  };
};