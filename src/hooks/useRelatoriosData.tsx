
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';

export const useRelatoriosData = () => {
  const [pacientes, setPacientes] = useState([]);
  const [exames, setExames] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    convenioId: 'todos',
    status: 'todos',
    termo: ''
  });
  const { clinica } = useClinica();

  const fetchPacientes = async () => {
    if (!clinica?.id) return [];
    
    try {
      console.log('Demo: Buscando pacientes para relatórios');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Demo: dados simulados de pacientes
      return [
        { id: '1', nome: 'João Silva', cpf: '123.456.789-00', telefone: '(11) 99999-9999', email: 'joao@email.com', created_at: '2024-01-15T10:00:00', convenios: { nome: 'Unimed', cor: '#00a651' } },
        { id: '2', nome: 'Maria Santos', cpf: '987.654.321-00', telefone: '(11) 88888-8888', email: 'maria@email.com', created_at: '2024-01-16T14:30:00', convenios: { nome: 'Bradesco', cor: '#e60000' } },
        { id: '3', nome: 'Pedro Costa', cpf: '456.789.123-00', telefone: '(11) 77777-7777', email: 'pedro@email.com', created_at: '2024-01-17T09:00:00', convenios: null }
      ];
    } catch (error) {
      console.error('Demo: Erro ao buscar pacientes:', error);
      return [];
    }
  };

  const fetchExames = async () => {
    if (!clinica?.id) return [];
    
    try {
      console.log('Demo: Buscando exames para relatórios');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Demo: dados simulados de exames
      return [
        { id: '1', tipo: 'Exame de Sangue', data_exame: '2024-01-15', status: 'concluido', valor: 80, pacientes: { nome: 'João Silva', numero_convenio: '12345' }, medicos: { nome_completo: 'Dr. Carlos Lima' }, convenios: { nome: 'Unimed', cor: '#00a651' } },
        { id: '2', tipo: 'Ultrassonografia', data_exame: '2024-01-16', status: 'agendado', valor: 120, pacientes: { nome: 'Maria Santos', numero_convenio: '67890' }, medicos: { nome_completo: 'Dra. Ana Costa' }, convenios: { nome: 'Bradesco', cor: '#e60000' } },
        { id: '3', tipo: 'Eletrocardiograma', data_exame: '2024-01-17', status: 'concluido', valor: 90, pacientes: { nome: 'Pedro Costa', numero_convenio: null }, medicos: { nome_completo: 'Dr. João Silva' }, convenios: null }
      ];
    } catch (error) {
      console.error('Demo: Erro ao buscar exames:', error);
      return [];
    }
  };

  const fetchAgendamentos = async () => {
    if (!clinica?.id) return [];
    
    try {
      console.log('Demo: Buscando agendamentos para relatórios');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Demo: dados simulados de agendamentos
      return [
        { id: '1', data_agendamento: '2024-01-15T10:00:00', tipo_exame: 'Consulta Clínica Geral', status: 'concluido', valor_exame: 150, valor_pago: 150, pacientes: { nome: 'João Silva', numero_convenio: '12345' }, medicos: { nome_completo: 'Dr. Carlos Lima' }, convenios: { nome: 'Unimed', cor: '#00a651' } },
        { id: '2', data_agendamento: '2024-01-16T14:30:00', tipo_exame: 'Exame de Sangue', status: 'agendado', valor_exame: 80, valor_pago: 0, pacientes: { nome: 'Maria Santos', numero_convenio: '67890' }, medicos: { nome_completo: 'Dra. Ana Costa' }, convenios: { nome: 'Bradesco', cor: '#e60000' } },
        { id: '3', data_agendamento: '2024-01-17T09:00:00', tipo_exame: 'Consulta Cardiológica', status: 'confirmado', valor_exame: 200, valor_pago: 200, pacientes: { nome: 'Pedro Costa', numero_convenio: null }, medicos: { nome_completo: 'Dr. João Silva' }, convenios: null }
      ];
    } catch (error) {
      console.error('Demo: Erro ao buscar agendamentos:', error);
      return [];
    }
  };

  const fetchConvenios = async () => {
    if (!clinica?.id) return [];
    
    try {
      console.log('Demo: Buscando convênios para relatórios');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Demo: dados simulados de convênios
      return [
        { id: '1', nome: 'Unimed', cor: '#00a651', ativo: true },
        { id: '2', nome: 'Bradesco Saúde', cor: '#e60000', ativo: true },
        { id: '3', nome: 'SulAmérica', cor: '#0066cc', ativo: true },
        { id: '4', nome: 'Amil', cor: '#ff6600', ativo: true },
        { id: '5', nome: 'NotreDame', cor: '#8b0000', ativo: true }
      ];
    } catch (error) {
      console.error('Demo: Erro ao buscar convênios:', error);
      return [];
    }
  };

  // Atualizar dados quando filtros mudarem
  useEffect(() => {
    if (clinica?.id) {
      setLoading(true);
      Promise.all([
        fetchPacientes(),
        fetchExames(),
        fetchAgendamentos(),
        fetchConvenios()
      ]).then(([pacientesData, examesData, agendamentosData, conveniosData]) => {
        setPacientes(pacientesData);
        setExames(examesData);
        setAgendamentos(agendamentosData);
        setConvenios(conveniosData);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [clinica?.id, filtros]);

  return {
    pacientes,
    exames,
    agendamentos,
    convenios,
    loading,
    filtros,
    setFiltros,
    tipos: [...new Set(exames.map((e: any) => e.tipo))],
    exportarPDF: () => console.log('Função de exportar PDF'),
    exportarConvenio: (id: string) => console.log('Exportar convênio:', id)
  };
};
