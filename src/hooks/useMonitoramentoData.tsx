import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useClinica } from "@/hooks/useClinica";
import { format, differenceInMinutes, startOfWeek, endOfWeek, startOfMonth, endOfDay, startOfDay } from 'date-fns';
import type { FuncionarioLog, FuncionarioSessao, HorarioTrabalho, ProdutividadeFuncionario, AbaTipo } from '@/types/monitoramento';

export const useMonitoramentoData = () => {
  const [logs, setLogs] = useState<FuncionarioLog[]>([]);
  const [sessoes, setSessoes] = useState<FuncionarioSessao[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [horarioTrabalho, setHorarioTrabalho] = useState<HorarioTrabalho[]>([]);
  const [produtividade, setProdutividade] = useState<ProdutividadeFuncionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFuncionario, setFiltroFuncionario] = useState('todos');
  const [filtroAcao, setFiltroAcao] = useState('todas');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const { toast } = useToast();
  const { clinica } = useClinica();

  const fetchFuncionarios = useCallback(async () => {
    try {
      // Demo: dados de funcionários
      const funcionariosDemo = [
        { id: '1', nome_completo: 'Ana Silva', funcao: 'Recepcionista', ativo: true },
        { id: '2', nome_completo: 'Carlos Santos', funcao: 'Técnico de Enfermagem', ativo: true },
        { id: '3', nome_completo: 'Maria Oliveira', funcao: 'Auxiliar Administrativo', ativo: true }
      ];
      
      console.log('Demo: Funcionários carregados:', funcionariosDemo.length);
      setFuncionarios(funcionariosDemo);
    } catch (error) {
      console.error('Erro demo ao carregar funcionários:', error);
      toast({
        title: "Erro",
        description: "Erro demo ao carregar funcionários",
        variant: "destructive"
      });
    }
  }, [toast]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      
      // Demo: dados de logs
      const logsDemo: FuncionarioLog[] = [
        {
          id: '1',
          funcionario_id: '1',
          acao: 'LOGIN',
          descricao: 'Usuário fez login no sistema',
          detalhes: { ip: '192.168.1.100' },
          created_at: new Date().toISOString(),
          tabela_afetada: 'funcionarios_sessoes',
          registro_id: 'sess_123',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          funcionarios: { nome_completo: 'Ana Silva', funcao: 'Recepcionista' }
        },
        {
          id: '2',
          funcionario_id: '2',
          acao: 'CREATE_PATIENT',
          descricao: 'Paciente João Silva cadastrado',
          detalhes: { paciente_id: 'pac_123' },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          tabela_afetada: 'pacientes',
          registro_id: 'pac_123',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          funcionarios: { nome_completo: 'Carlos Santos', funcao: 'Técnico de Enfermagem' }
        },
        {
          id: '3',
          funcionario_id: '3',
          acao: 'CREATE_APPOINTMENT',
          descricao: 'Consulta agendada para 15/01/2024',
          detalhes: { consulta_id: 'cons_456' },
          created_at: new Date(Date.now() - 7200000).toISOString(),
          tabela_afetada: 'agendamentos',
          registro_id: 'cons_456',
          ip_address: '192.168.1.102',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          funcionarios: { nome_completo: 'Maria Oliveira', funcao: 'Auxiliar Administrativo' }
        },
        {
          id: '4',
          funcionario_id: '1',
          acao: 'CREATE_EXAM',
          descricao: 'Exame de sangue cadastrado',
          detalhes: { exame_id: 'ex_789' },
          created_at: new Date(Date.now() - 10800000).toISOString(),
          tabela_afetada: 'exames',
          registro_id: 'ex_789',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          funcionarios: { nome_completo: 'Ana Silva', funcao: 'Recepcionista' }
        }
      ];
      
      console.log('Demo: Logs carregados:', logsDemo.length);
      setLogs(logsDemo);
    } catch (error) {
      console.error('Erro demo ao carregar logs:', error);
      toast({
        title: "Erro",
        description: "Erro demo ao carregar logs de funcionários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchSessoes = useCallback(async () => {
    try {
      // Demo: dados de sessões
      const sessoesDemo: FuncionarioSessao[] = [
        {
          id: '1',
          funcionario_id: '1',
          login_at: new Date(Date.now() - 14400000).toISOString(),
          logout_at: new Date(Date.now() - 3600000).toISOString(),
          duracao_sessao: '180',
          ativa: false,
          ip_address: '192.168.1.100',
          funcionarios: { nome_completo: 'Ana Silva', funcao: 'Recepcionista' }
        },
        {
          id: '2',
          funcionario_id: '2',
          login_at: new Date(Date.now() - 10800000).toISOString(),
          logout_at: null,
          duracao_sessao: null,
          ativa: true,
          ip_address: '192.168.1.101',
          funcionarios: { nome_completo: 'Carlos Santos', funcao: 'Técnico de Enfermagem' }
        },
        {
          id: '3',
          funcionario_id: '3',
          login_at: new Date(Date.now() - 7200000).toISOString(),
          logout_at: new Date(Date.now() - 1800000).toISOString(),
          duracao_sessao: '90',
          ativa: false,
          ip_address: '192.168.1.102',
          funcionarios: { nome_completo: 'Maria Oliveira', funcao: 'Auxiliar Administrativo' }
        }
      ];
      
      console.log('Demo: Sessões carregadas:', sessoesDemo.length);
      setSessoes(sessoesDemo);
    } catch (error) {
      console.error('Erro demo ao carregar sessões:', error);
      toast({
        title: "Erro",
        description: "Erro demo ao carregar sessões",
        variant: "destructive"
      });
    }
  }, [toast]);

  const fetchHorarioTrabalho = useCallback(async () => {
    try {
      // Demo: dados de horário de trabalho semanal
      const horarioTrabalhoDemo: HorarioTrabalho[] = [
        {
          funcionario_id: '1',
          nome_completo: 'Ana Silva',
          minutos_trabalhados: 2400, // 40 horas
          sessoes_ativas: 1,
          ultimo_acesso: new Date(Date.now() - 3600000).toISOString()
        },
        {
          funcionario_id: '2',
          nome_completo: 'Carlos Santos',
          minutos_trabalhados: 2160, // 36 horas
          sessoes_ativas: 2,
          ultimo_acesso: new Date(Date.now() - 1800000).toISOString()
        },
        {
          funcionario_id: '3',
          nome_completo: 'Maria Oliveira',
          minutos_trabalhados: 2520, // 42 horas
          sessoes_ativas: 0,
          ultimo_acesso: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      
      console.log('Demo: Horário de trabalho carregado:', horarioTrabalhoDemo.length);
      setHorarioTrabalho(horarioTrabalhoDemo);
    } catch (error) {
      console.error('Erro demo ao carregar horários de trabalho:', error);
      toast({
        title: "Erro",
        description: "Erro demo ao carregar horários de trabalho",
        variant: "destructive"
      });
    }
  }, [toast]);

  const fetchProdutividade = useCallback(async () => {
    try {
      // Demo: dados de produtividade mensal
      const produtividadeDemo: ProdutividadeFuncionario[] = [
        {
          funcionario_id: '1',
          nome_completo: 'Ana Silva',
          pacientes_adicionados: 25,
          exames_adicionados: 15,
          agendamentos_feitos: 45,
          total_acoes: 85,
          media_acoes_por_hora: 8.5
        },
        {
          funcionario_id: '2',
          nome_completo: 'Carlos Santos',
          pacientes_adicionados: 18,
          exames_adicionados: 32,
          agendamentos_feitos: 28,
          total_acoes: 78,
          media_acoes_por_hora: 6.2
        },
        {
          funcionario_id: '3',
          nome_completo: 'Maria Oliveira',
          pacientes_adicionados: 22,
          exames_adicionados: 8,
          agendamentos_feitos: 38,
          total_acoes: 68,
          media_acoes_por_hora: 7.8
        }
      ];
      
      console.log('Demo: Produtividade carregada:', produtividadeDemo.length);
      setProdutividade(produtividadeDemo);
    } catch (error) {
      console.error('Erro demo ao carregar produtividade:', error);
      toast({
        title: "Erro",
        description: "Erro demo ao carregar dados de produtividade",
        variant: "destructive"
      });
    }
  }, [toast]);

  const recarregarDados = useCallback(() => {
    fetchFuncionarios();
    fetchLogs();
    fetchSessoes();
    fetchHorarioTrabalho();
    fetchProdutividade();
  }, [fetchFuncionarios, fetchLogs, fetchSessoes, fetchHorarioTrabalho, fetchProdutividade]);

  const aplicarFiltros = useCallback((abaSelecionada: AbaTipo) => {
    if (abaSelecionada === 'logs') {
      fetchLogs();
    } else if (abaSelecionada === 'sessoes') {
      fetchSessoes();
    }
  }, [fetchLogs, fetchSessoes]);

  const limparFiltros = useCallback(() => {
    setFiltroFuncionario('todos');
    setFiltroAcao('todas');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    fetchLogs();
    fetchSessoes();
  }, [fetchLogs, fetchSessoes]);

  const getHistoricoFuncionario = useCallback((funcionarioId: string) => {
    return logs.filter(log => 
      log.funcionario_id === funcionarioId && 
      ['CREATE_PATIENT', 'UPDATE_PATIENT', 'CREATE_EXAM', 'UPDATE_EXAM', 'CREATE_APPOINTMENT', 'UPDATE_APPOINTMENT'].includes(log.acao)
    );
  }, [logs]);

  useEffect(() => {
    console.log('Demo: Carregando dados de monitoramento');
    fetchFuncionarios();
    fetchLogs();
    fetchSessoes();
    fetchHorarioTrabalho();
    fetchProdutividade();
  }, [fetchFuncionarios, fetchLogs, fetchSessoes, fetchHorarioTrabalho, fetchProdutividade]);

  return {
    // Data
    logs,
    sessoes,
    funcionarios,
    horarioTrabalho,
    produtividade,
    loading,
    
    // Filters
    filtroFuncionario,
    setFiltroFuncionario,
    filtroAcao,
    setFiltroAcao,
    filtroDataInicio,
    setFiltroDataInicio,
    filtroDataFim,
    setFiltroDataFim,
    
    // Actions
    recarregarDados,
    aplicarFiltros,
    limparFiltros,
    getHistoricoFuncionario
  };
};
