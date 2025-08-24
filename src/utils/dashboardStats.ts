
/**
 * Utility functions for DashboardStatsCards
 * Move standalone logic here to avoid import cycles.
 */
import { supabase } from '@/integrations/supabase/client';

export async function getAgendamentosDia(clinicaId: string, date: string) {
  console.log('Buscando agendamentos para clinica:', clinicaId, 'data:', date);
  
  // Mock data for demonstration - operational tables not in central database
  const data = [
    {
      id: '1',
      data_agendamento: `${date}T10:00:00`,
      pacientes: { nome: 'João Silva' },
      medicos: { nome_completo: 'Dr. Carlos Santos' }
    },
    {
      id: '2', 
      data_agendamento: `${date}T14:30:00`,
      pacientes: { nome: 'Maria Oliveira' },
      medicos: { nome_completo: 'Dra. Ana Costa' }
    }
  ];
  const error = null;

  if (error) {
    console.error('Erro ao buscar agendamentos do dia:', error);
    throw error;
  }
  
  console.log('Agendamentos encontrados para o dia:', data?.length || 0);
  return data || [];
}
