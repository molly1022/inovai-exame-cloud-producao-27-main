import { useState, useEffect } from 'react';
import { useMedicoAuth } from '@/hooks/useMedicoAuth';

export const useMedicoData = () => {
  const [agendamentosHoje, setAgendamentosHoje] = useState<any[]>([]);
  const [proximosAgendamentos, setProximosAgendamentos] = useState<any[]>([]);
  const [pacientesRecentes, setPacientesRecentes] = useState<any[]>([]);
  const [examesToday, setExamesToday] = useState<any[]>([]);
  const [receitasRecentes, setReceitasRecentes] = useState<any[]>([]);
  const [atestadosRecentes, setAtestadosRecentes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    agendamentosAmanha: 0,
    agendamentosSemana: 0
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Demo data
      const agendamentosDemo = [
        { id: '1', pacientes: { nome_completo: 'João Silva' }, data_agendamento: new Date().toISOString(), horario: '09:00', tipo_exame: 'Consulta' }
      ];
      const pacientesDemo = [
        { id: '1', nome_completo: 'Maria Santos', created_at: new Date().toISOString() }
      ];
      
      setAgendamentosHoje(agendamentosDemo);
      setProximosAgendamentos(agendamentosDemo);
      setPacientesRecentes(pacientesDemo);
      setExamesToday([]);
      setReceitasRecentes([]);
      setAtestadosRecentes([]);
      setStats({
        agendamentosHoje: 1,
        agendamentosAmanha: 2,
        agendamentosSemana: 5
      });
    } catch (error) {
      console.error('Erro demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const { isAuthenticated, medico } = useMedicoAuth();

  useEffect(() => {
    if (isAuthenticated && medico?.id) {
      loadData();
    }
  }, [isAuthenticated, medico]);

  return {
    agendamentosHoje,
    proximosAgendamentos, 
    pacientesRecentes,
    examesToday,
    receitasRecentes,
    atestadosRecentes,
    stats: {
      ...stats,
      agendamentosFuturos: 0,
      agendamentosPassados: 0,
      examesRealizados: 0,
      receitasEmitidas: 0,
      atestadosEmitidos: 0,
      proximoAgendamento: null
    },
    loading,
    refetch: loadData,
    // Legacy properties for compatibility
    agendamentos: agendamentosHoje,
    pacientes: pacientesRecentes,
    exames: examesToday,
    receitas: receitasRecentes,
    atestados: atestadosRecentes,
    isLoading: loading,
    refetchAll: loadData,
    hasErrors: false
  };
};