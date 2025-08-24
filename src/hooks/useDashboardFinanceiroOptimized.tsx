import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from './useClinica';

export interface FilterState {
  periodo: 'hoje' | 'semana_atual' | 'mes_atual' | 'ultimos_3_meses' | 'ano_atual' | 'personalizado';
  statusFinanceiro: 'todos' | 'recebidos' | 'a_receber_futuro' | 'a_receber_vencido' | 'parcial';
  medicoId: string;
  convenioId: string;
  tipoExame: string;
  dataInicio?: Date;
  dataFim?: Date;
}

interface DashboardData {
  faturamentoHoje: number;
  faturamentoMes: number;
  aReceberTotal: number;
  aReceberVencido: number;
  examesTotais: number;
  examesHoje: number;
  ticketMedio: number;
  faturamentoTotal: number;
  faturamentoPendente: number;
  totalConsultas: number;
  consultasPagas: number;
  consultasPendentes: number;
  mediaValorConsulta: number;
  transacoesRecentes: any[];
  agendamentosFuturos: any[];
  pagamentosVencidos: any[];
  fluxoCaixaData: any[];
  medicosList: any[];
  conveniosList: any[];
  categoriasList: any[];
  taxaConversao: number;
  repassesTotalMes: number;
  repassesPendentes: number;
  repassesPagos: number;
  receitaLiquida: number;
}

export const useDashboardFinanceiroOptimized = (filters: FilterState) => {
  const { clinica } = useClinica();
  const [data, setData] = useState<DashboardData>({
    faturamentoHoje: 0,
    faturamentoMes: 0,
    aReceberTotal: 0,
    aReceberVencido: 0,
    examesTotais: 0,
    examesHoje: 0,
    ticketMedio: 0,
    faturamentoTotal: 0,
    faturamentoPendente: 0,
    totalConsultas: 0,
    consultasPagas: 0,
    consultasPendentes: 0,
    mediaValorConsulta: 0,
    transacoesRecentes: [],
    agendamentosFuturos: [],
    pagamentosVencidos: [],
    fluxoCaixaData: [],
    medicosList: [],
    conveniosList: [],
    categoriasList: [],
    taxaConversao: 0,
    repassesTotalMes: 0,
    repassesPendentes: 0,
    repassesPagos: 0,
    receitaLiquida: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Gerando dados demo otimizados do dashboard financeiro...');
      
      // Dados demo para demonstração
      const medicosDemo = [
        { id: '1', nome_completo: 'Dr. João Silva' },
        { id: '2', nome_completo: 'Dra. Maria Santos' },
        { id: '3', nome_completo: 'Dr. Pedro Costa' }
      ];
        
      const conveniosDemo = [
        { id: '1', nome: 'SUS' },
        { id: '2', nome: 'Unimed' },
        { id: '3', nome: 'Bradesco Saúde' }
      ];

      const categoriasDemo = [
        { id: '1', nome: 'Consulta Geral' },
        { id: '2', nome: 'Exame Cardiológico' },
        { id: '3', nome: 'Ultrassom' }
      ];

      // Métricas demo baseadas nos filtros
      const baseValues = {
        faturamentoHoje: 2500,
        faturamentoMes: 45000,
        aReceberTotal: 12000,
        aReceberVencido: 3500,
        examesTotais: 150,
        examesHoje: 8,
        repassesTotalMes: 18000,
        repassesPendentes: 5500,
        repassesPagos: 12500
      };

      // Aplicar variações baseadas nos filtros para simular dados reais
      const multiplicador = filters.medicoId !== 'todos' ? 0.3 : 1;
      const variacaoPeriodo = filters.periodo === 'hoje' ? 0.1 : filters.periodo === 'semana_atual' ? 0.4 : 1;
      
      const faturamentoHoje = Math.round(baseValues.faturamentoHoje * multiplicador * variacaoPeriodo);
      const faturamentoMes = Math.round(baseValues.faturamentoMes * multiplicador);
      const aReceberTotal = Math.round(baseValues.aReceberTotal * multiplicador);
      const aReceberVencido = Math.round(baseValues.aReceberVencido * multiplicador);
      const examesTotais = Math.round(baseValues.examesTotais * multiplicador);
      const examesHoje = Math.round(baseValues.examesHoje * multiplicador);
      const totalConsultas = examesTotais;
      const consultasPagas = Math.round(totalConsultas * 0.8);
      const consultasPendentes = totalConsultas - consultasPagas;
      const ticketMedio = totalConsultas > 0 ? faturamentoMes / totalConsultas : 0;
      const mediaValorConsulta = ticketMedio;
      const taxaConversao = totalConsultas > 0 ? (consultasPagas / totalConsultas) * 100 : 0;
      const repassesTotalMes = Math.round(baseValues.repassesTotalMes * multiplicador);
      const repassesPendentes = Math.round(baseValues.repassesPendentes * multiplicador);
      const repassesPagos = Math.round(baseValues.repassesPagos * multiplicador);
      const receitaLiquida = faturamentoMes - repassesPagos;

      // Transações recentes demo
      const transacoesRecentes = Array.from({ length: Math.min(10, consultasPagas) }, (_, i) => ({
        id: `transacao-${i}`,
        data: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        paciente: `Paciente ${i + 1}`,
        medico: medicosDemo[i % medicosDemo.length].nome_completo,
        valor: Math.floor(Math.random() * 400) + 150,
        status: 'pago',
        tipo: 'Consulta'
      }));

      // Agendamentos futuros demo
      const agendamentosFuturos = Array.from({ length: Math.min(8, consultasPendentes) }, (_, i) => ({
        id: `futuro-${i}`,
        data_agendamento: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        paciente: `Paciente Futuro ${i + 1}`,
        medico: medicosDemo[i % medicosDemo.length].nome_completo,
        valor_exame: Math.floor(Math.random() * 300) + 200,
        valor_pago: 0,
        status_pagamento: 'pendente',
        tipo_exame: 'Consulta',
        dias_ate_consulta: i + 1
      }));

      // Pagamentos vencidos demo
      const numVencidos = Math.max(1, Math.floor(aReceberVencido / 300));
      const pagamentosVencidos = Array.from({ length: Math.min(5, numVencidos) }, (_, i) => ({
        id: `vencido-${i}`,
        data_agendamento: new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000).toISOString(),
        paciente: `Paciente Vencido ${i + 1}`,
        medico: medicosDemo[i % medicosDemo.length].nome_completo,
        valor_devido: Math.floor(aReceberVencido / numVencidos),
        dias_vencido: (i + 1) * 3,
        tipo_exame: 'Consulta'
      }));

      // Fluxo de caixa demo (últimos 6 meses)
      const fluxoCaixaData = Array.from({ length: 6 }, (_, i) => {
        const data = new Date();
        data.setMonth(data.getMonth() - (5 - i));
        const variacaoMes = 0.7 + Math.random() * 0.6; // Entre 70% e 130%
        return {
          periodo: data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          recebido: Math.round(faturamentoMes * variacaoMes),
          aReceber: Math.round(aReceberTotal * variacaoMes * 0.5)
        };
      });

      setData({
        faturamentoHoje,
        faturamentoMes,
        aReceberTotal,
        aReceberVencido,
        examesTotais,
        examesHoje,
        ticketMedio,
        faturamentoTotal: faturamentoMes,
        faturamentoPendente: aReceberTotal,
        totalConsultas,
        consultasPagas,
        consultasPendentes,
        mediaValorConsulta,
        transacoesRecentes,
        agendamentosFuturos,
        pagamentosVencidos,
        fluxoCaixaData,
        medicosList: medicosDemo,
        conveniosList: conveniosDemo,
        categoriasList: categoriasDemo,
        taxaConversao,
        repassesTotalMes,
        repassesPendentes,
        repassesPagos,
        receitaLiquida
      });

      console.log('Dados demo otimizados carregados com filtros:', filters);

    } catch (error) {
      console.error('Erro inesperado:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [clinica?.id, filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};