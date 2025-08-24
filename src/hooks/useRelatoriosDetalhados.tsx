
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';
import { useToast } from '@/hooks/use-toast';

interface FiltrosRelatorios {
  dataInicio?: Date;
  dataFim?: Date;
  convenioId?: string;
  medicoId?: string;
  statusPagamento?: string;
  metodoPagamento?: string;
  statusAgendamento?: string;
  termoBusca?: string;
}

interface DadosPaciente {
  id: string;
  nome: string;
  cpf: string;
  convenio?: { nome: string; cor: string };
  numero_convenio?: string;
  totalConsultas: number;
  valorTotalGasto: number;
  ultimaConsulta?: string;
  telefone?: string;
  email?: string;
}

interface DadosAgendamento {
  id: string;
  data_agendamento: string;
  horario: string;
  status: string;
  tipo_exame: string;
  valor_exame: number;
  valor_pago: number;
  status_pagamento: string;
  metodo_pagamento?: string;
  paciente: { nome: string; cpf: string };
  medico?: { nome_completo: string };
  convenio?: { nome: string; cor: string };
  observacoes?: string;
}

interface DadosConvenio {
  id: string;
  nome: string;
  cor: string;
  descricao?: string;
  percentual_desconto: number;
  totalPacientes: number;
  totalConsultas: number;
  valorTotalFaturado: number;
  valorMedioConsulta: number;
  consultasPagas: number;
  consultasPendentes: number;
  consultasParciais: number;
}

interface DadosFinanceiros {
  totalFaturado: number;
  totalRecebido: number;
  totalPendente: number;
  totalParcial: number;
  pagamentosDinheiro: { quantidade: number; valor: number };
  pagamentosCartao: { quantidade: number; valor: number };
  pagamentosPix: { quantidade: number; valor: number };
  pagamentosTransferencia: { quantidade: number; valor: number };
  faturamentoPorConvenio: Array<{
    convenio: string;
    valor: number;
    quantidade: number;
    ticketMedio: number;
  }>;
  fluxoCaixaDiario: Array<{
    data: string;
    entradas: number;
    quantidade: number;
  }>;
}

interface EstatisticasGerais {
  totalConsultas: number;
  consultasHoje: number;
  consultasSemana: number;
  consultasMes: number;
  ticketMedio: number;
  consultasPorStatus: { [key: string]: number };
  consultasPorMedico: Array<{
    medico: string;
    quantidade: number;
    valor: number;
    tempoMedio: number;
  }>;
}

export const useRelatoriosDetalhados = (filtros: FiltrosRelatorios) => {
  const [pacientes, setPacientes] = useState<DadosPaciente[]>([]);
  const [agendamentos, setAgendamentos] = useState<DadosAgendamento[]>([]);
  const [convenios, setConvenios] = useState<DadosConvenio[]>([]);
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais | null>(null);
  const [loading, setLoading] = useState(true);
  const { clinica } = useClinica();
  const { toast } = useToast();

  const buscarPacientesDetalhados = async () => {
    if (!clinica?.id) return [];

    try {
      console.log('Demo: Buscando pacientes detalhados');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Demo: dados simulados de pacientes detalhados com estatísticas
      return [
        { 
          id: '1', 
          nome: 'João Silva', 
          cpf: '123.456.789-00', 
          numero_convenio: '12345', 
          telefone: '(11) 99999-9999', 
          email: 'joao@email.com', 
          convenio: { nome: 'Unimed', cor: '#00a651' },
          totalConsultas: 8,
          valorTotalGasto: 1200,
          ultimaConsulta: '2024-01-15T10:00:00'
        },
        { 
          id: '2', 
          nome: 'Maria Santos', 
          cpf: '987.654.321-00', 
          numero_convenio: '67890', 
          telefone: '(11) 88888-8888', 
          email: 'maria@email.com', 
          convenio: { nome: 'Bradesco', cor: '#e60000' },
          totalConsultas: 5,
          valorTotalGasto: 750,
          ultimaConsulta: '2024-01-16T14:30:00'
        },
        { 
          id: '3', 
          nome: 'Pedro Costa', 
          cpf: '456.789.123-00', 
          numero_convenio: null, 
          telefone: '(11) 77777-7777', 
          email: 'pedro@email.com', 
          convenio: null,
          totalConsultas: 3,
          valorTotalGasto: 600,
          ultimaConsulta: '2024-01-10T09:00:00'
        }
      ];
    } catch (error) {
      console.error('Demo: Erro ao buscar pacientes detalhados:', error);
      return [];
    }
  };

  const buscarAgendamentosDetalhados = async () => {
    if (!clinica?.id) return [];

    try {
      console.log('Demo: Buscando agendamentos detalhados');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Demo: dados simulados de agendamentos detalhados
      const agendamentosDemo = [
        {
          id: '1',
          data_agendamento: '2024-01-15T10:00:00',
          horario: '10:00',
          status: 'concluido',
          tipo_exame: 'Consulta Clínica Geral',
          valor_exame: 150,
          valor_pago: 150,
          status_pagamento: 'pago',
          metodo_pagamento: 'cartao',
          observacoes: 'Consulta de rotina',
          pacientes: { nome: 'João Silva', cpf: '123.456.789-00' },
          medicos: { nome_completo: 'Dr. Carlos Lima' },
          convenios: { nome: 'Unimed', cor: '#00a651' }
        },
        {
          id: '2',
          data_agendamento: '2024-01-16T14:30:00',
          horario: '14:30',
          status: 'agendado',
          tipo_exame: 'Exame de Sangue',
          valor_exame: 80,
          valor_pago: 0,
          status_pagamento: 'pendente',
          metodo_pagamento: null,
          observacoes: 'Exame de rotina',
          pacientes: { nome: 'Maria Santos', cpf: '987.654.321-00' },
          medicos: { nome_completo: 'Dra. Ana Costa' },
          convenios: { nome: 'Bradesco', cor: '#e60000' }
        },
        {
          id: '3',
          data_agendamento: '2024-01-17T09:00:00',
          horario: '09:00',
          status: 'confirmado',
          tipo_exame: 'Consulta Cardiológica',
          valor_exame: 200,
          valor_pago: 200,
          status_pagamento: 'pago',
          metodo_pagamento: 'dinheiro',
          observacoes: 'Consulta especializada',
          pacientes: { nome: 'Pedro Costa', cpf: '456.789.123-00' },
          medicos: { nome_completo: 'Dr. João Silva' },
          convenios: null
        }
      ];

      return agendamentosDemo.map(agendamento => ({
        ...agendamento,
        paciente: agendamento.pacientes,
        medico: agendamento.medicos,
        convenio: agendamento.convenios
      }));
    } catch (error) {
      console.error('Demo: Erro ao buscar agendamentos detalhados:', error);
      return [];
    }
  };

  const buscarConveniosDetalhados = async () => {
    if (!clinica?.id) return [];

    try {
      console.log('Demo: Buscando convênios detalhados');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Demo: dados simulados de convênios detalhados
      const conveniosDemo = [
        {
          id: '1',
          nome: 'Unimed',
          cor: '#00a651',
          descricao: 'Convênio Unimed',
          percentual_desconto: 0.15,
          totalPacientes: 85,
          totalConsultas: 142,
          valorTotalFaturado: 21300,
          valorMedioConsulta: 150,
          consultasPagas: 120,
          consultasPendentes: 18,
          consultasParciais: 4
        },
        {
          id: '2',
          nome: 'Bradesco Saúde',
          cor: '#e60000',
          descricao: 'Bradesco Saúde',
          percentual_desconto: 0.12,
          totalPacientes: 62,
          totalConsultas: 98,
          valorTotalFaturado: 14700,
          valorMedioConsulta: 150,
          consultasPagas: 85,
          consultasPendentes: 11,
          consultasParciais: 2
        },
        {
          id: '3',
          nome: 'SulAmérica',
          cor: '#0066cc',
          descricao: 'SulAmérica Saúde',
          percentual_desconto: 0.18,
          totalPacientes: 45,
          totalConsultas: 72,
          valorTotalFaturado: 10800,
          valorMedioConsulta: 150,
          consultasPagas: 65,
          consultasPendentes: 6,
          consultasParciais: 1
        }
      ];

      return conveniosDemo;
    } catch (error) {
      console.error('Demo: Erro ao buscar convênios detalhados:', error);
      return [];
    }
  };

  const calcularDadosFinanceiros = async () => {
    if (!clinica?.id) return null;

    try {
      console.log('Demo: Calculando dados financeiros');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Demo: dados financeiros simulados
      return {
        totalFaturado: 42500,
        totalRecebido: 38250,
        totalPendente: 3400,
        totalParcial: 850,
        pagamentosDinheiro: { quantidade: 45, valor: 12750 },
        pagamentosCartao: { quantidade: 78, valor: 18200 },
        pagamentosPix: { quantidade: 32, valor: 6800 },
        pagamentosTransferencia: { quantidade: 12, valor: 500 },
        faturamentoPorConvenio: [
          { convenio: 'Unimed', valor: 21300, quantidade: 142, ticketMedio: 150 },
          { convenio: 'Bradesco Saúde', valor: 14700, quantidade: 98, ticketMedio: 150 },
          { convenio: 'SulAmérica', valor: 10800, quantidade: 72, ticketMedio: 150 },
          { convenio: 'Particular', valor: 6200, quantidade: 31, ticketMedio: 200 }
        ],
        fluxoCaixaDiario: [
          { data: '15/01/2024', entradas: 1200, quantidade: 8 },
          { data: '16/01/2024', entradas: 1800, quantidade: 12 },
          { data: '17/01/2024', entradas: 950, quantidade: 6 },
          { data: '18/01/2024', entradas: 2100, quantidade: 14 },
          { data: '19/01/2024', entradas: 1650, quantidade: 11 }
        ]
      };
    } catch (error) {
      console.error('Demo: Erro ao calcular dados financeiros:', error);
      return null;
    }
  };

  const calcularEstatisticasGerais = async () => {
    if (!clinica?.id) return null;

    try {
      console.log('Demo: Calculando estatísticas gerais');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Demo: estatísticas gerais simuladas
      return {
        totalConsultas: 343,
        consultasHoje: 12,
        consultasSemana: 78,
        consultasMes: 285,
        ticketMedio: 155.25,
        consultasPorStatus: {
          'agendado': 68,
          'confirmado': 45,
          'concluido': 185,
          'cancelado': 32,
          'falta': 13
        },
        consultasPorMedico: [
          { medico: 'Dr. Carlos Lima', quantidade: 85, valor: 12750, tempoMedio: 32 },
          { medico: 'Dra. Ana Costa', quantidade: 72, valor: 10800, tempoMedio: 28 },
          { medico: 'Dr. João Silva', quantidade: 65, valor: 13000, tempoMedio: 35 },
          { medico: 'Dra. Maria Santos', quantidade: 58, valor: 8700, tempoMedio: 30 },
          { medico: 'Dr. Pedro Oliveira', quantidade: 45, valor: 6750, tempoMedio: 25 }
        ]
      };
    } catch (error) {
      console.error('Demo: Erro ao calcular estatísticas gerais:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!clinica?.id) return;

    const buscarDados = async () => {
      setLoading(true);
      try {
        const [
          pacientesData,
          agendamentosData,
          conveniosData,
          dadosFinanceirosData,
          estatisticasData
        ] = await Promise.all([
          buscarPacientesDetalhados(),
          buscarAgendamentosDetalhados(),
          buscarConveniosDetalhados(),
          calcularDadosFinanceiros(),
          calcularEstatisticasGerais()
        ]);

        setPacientes(pacientesData);
        setAgendamentos(agendamentosData);
        setConvenios(conveniosData);
        setDadosFinanceiros(dadosFinanceirosData);
        setEstatisticas(estatisticasData);
      } catch (error) {
        console.error('Erro ao carregar dados dos relatórios:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados dos relatórios",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, [clinica?.id, filtros]);

  return {
    pacientes,
    agendamentos,
    convenios,
    dadosFinanceiros,
    estatisticas,
    loading
  };
};
