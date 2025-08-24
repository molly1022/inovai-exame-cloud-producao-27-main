import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';
import { FilterState } from '@/components/DashboardFinanceiroFilters';

interface DashboardFinanceiroData {
  faturamentoHoje: number;
  faturamentoMes: number;
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
}

export const useDashboardFinanceiro = (filters?: FilterState) => {
  const [data, setData] = useState<DashboardFinanceiroData>({
    faturamentoHoje: 0,
    faturamentoMes: 0,
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
    conveniosList: []
  });
  const [loading, setLoading] = useState(true);
  const { clinica } = useClinica();

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Gerando dados demo do dashboard financeiro...');
      
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

      // Valores demo
      const faturamentoHoje = 2500.00;
      const faturamentoMes = 45000.00;
      const faturamentoTotal = 125000.00;
      const faturamentoPendente = 8750.00;
      const totalConsultas = 150;
      const consultasPagas = 120;
      const consultasPendentes = 30;
      const mediaValorConsulta = 250.00;

      // Transações recentes demo
      const transacoesRecentes = Array.from({ length: 10 }, (_, i) => ({
        id: `transacao-${i}`,
        data: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        paciente: `Paciente ${i + 1}`,
        medico: medicosDemo[i % medicosDemo.length].nome_completo,
        valor: Math.floor(Math.random() * 400) + 150,
        status: 'pago',
        tipo: 'Consulta'
      }));

      // Agendamentos futuros demo
      const agendamentosFuturos = Array.from({ length: 8 }, (_, i) => ({
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
      const pagamentosVencidos = Array.from({ length: 5 }, (_, i) => ({
        id: `vencido-${i}`,
        data_agendamento: new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000).toISOString(),
        paciente: `Paciente Vencido ${i + 1}`,
        medico: medicosDemo[i % medicosDemo.length].nome_completo,
        valor_devido: Math.floor(Math.random() * 400) + 200,
        dias_vencido: (i + 1) * 3,
        tipo_exame: 'Consulta'
      }));

      // Fluxo de caixa demo (últimos 6 meses)
      const fluxoCaixaData = Array.from({ length: 6 }, (_, i) => {
        const data = new Date();
        data.setMonth(data.getMonth() - (5 - i));
        return {
          periodo: data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          recebido: Math.floor(Math.random() * 30000) + 20000,
          aReceber: Math.floor(Math.random() * 15000) + 5000
        };
      });

      setData({
        faturamentoHoje,
        faturamentoMes,
        faturamentoTotal,
        faturamentoPendente,
        totalConsultas,
        consultasPagas,
        consultasPendentes,
        mediaValorConsulta,
        transacoesRecentes,
        agendamentosFuturos,
        pagamentosVencidos,
        fluxoCaixaData,
        medicosList: medicosDemo,
        conveniosList: conveniosDemo
      });

      console.log('Dados demo do dashboard financeiro carregados');

    } catch (error) {
      console.error('Erro ao gerar dados demo do dashboard financeiro:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    refetch: fetchDashboardData
  };
};