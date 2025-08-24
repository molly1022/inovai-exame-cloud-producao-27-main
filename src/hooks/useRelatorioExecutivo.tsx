
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface FiltrosRelatorioExecutivo {
  dataInicio?: Date;
  dataFim?: Date;
  incluirGraficos?: boolean;
  incluirComparacao?: boolean;
  incluirProjecoes?: boolean;
  incluirKPIs?: boolean;
}

export interface DadosRelatorioExecutivo {
  resumo_executivo: {
    total_pacientes: number;
    consultas_realizadas: number;
    faturamento_periodo: number;
    crescimento_percentual: number;
    taxa_ocupacao: number;
    ticket_medio: number;
  };
  kpis_principais: {
    novos_pacientes: number;
    taxa_retorno: number;
    inadimplencia: number;
    satisfacao_cliente: number;
    produtividade_medica: number;
    eficiencia_operacional: number;
  };
  analise_temporal: Array<{
    periodo: string;
    consultas: number;
    faturamento: number;
    novos_pacientes: number;
  }>;
  ranking_desempenho: {
    medicos: Array<{
      nome: string;
      consultas: number;
      faturamento: number;
      avaliacao: number;
    }>;
    convenios: Array<{
      nome: string;
      volume: number;
      faturamento: number;
      margem: number;
    }>;
    procedimentos: Array<{
      nome: string;
      quantidade: number;
      faturamento: number;
      tendencia: string;
    }>;
  };
  insights_estrategicos: Array<{
    categoria: string;
    insight: string;
    impacto: 'alto' | 'medio' | 'baixo';
    acao_recomendada: string;
  }>;
}

export const useRelatorioExecutivo = (filtros: FiltrosRelatorioExecutivo = {}) => {
  const [dados, setDados] = useState<DadosRelatorioExecutivo | null>(null);
  const [loading, setLoading] = useState(false);
  const { clinica } = useClinica();
  const { toast } = useToast();

  // Memorizar filtros para evitar loops infinitos
  const filtrosMemorized = useMemo(() => ({
    dataInicio: filtros.dataInicio,
    dataFim: filtros.dataFim,
    incluirGraficos: filtros.incluirGraficos,
    incluirComparacao: filtros.incluirComparacao,
    incluirProjecoes: filtros.incluirProjecoes,
    incluirKPIs: filtros.incluirKPIs
  }), [
    filtros.dataInicio,
    filtros.dataFim,
    filtros.incluirGraficos,
    filtros.incluirComparacao,
    filtros.incluirProjecoes,
    filtros.incluirKPIs
  ]);

  const buscarDadosExecutivos = useCallback(async () => {
    if (!clinica?.id) return;

    try {
      setLoading(true);

      // Demo: simular busca de dados executivos
      console.log('Demo: Gerando relatório executivo para clínica:', clinica.id);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo: dados simulados baseados no período
      const diasPeriodo = filtrosMemorized.dataInicio && filtrosMemorized.dataFim 
        ? Math.ceil((filtrosMemorized.dataFim.getTime() - filtrosMemorized.dataInicio.getTime()) / (1000 * 60 * 60 * 24)) 
        : 30;

      // Métricas executivas demo
      const totalPacientes = 248;
      const consultasRealizadas = Math.floor(Math.random() * 150) + 100;
      const faturamentoPeriodo = Math.floor(Math.random() * 50000) + 25000;
      const crescimentoPercentual = Math.floor(Math.random() * 30) + 5;
      const capacidadeMaxima = diasPeriodo * 8 * 2; // 8 horas, 2 consultas por hora
      const taxaOcupacao = Math.min((consultasRealizadas / capacidadeMaxima) * 100, 95);
      const ticketMedio = consultasRealizadas > 0 ? faturamentoPeriodo / consultasRealizadas : 0;

      // KPIs principais demo
      const novosPacientes = Math.floor(Math.random() * 50) + 20;
      const taxaRetorno = Math.floor(Math.random() * 40) + 60;
      const inadimplencia = Math.floor(Math.random() * 10) + 5;
      const satisfacaoCliente = 4.2 + (Math.random() * 0.6);
      const produtividadeMedica = Math.floor(Math.random() * 20) + 75;
      const eficienciaOperacional = Math.floor(Math.random() * 25) + 70;

      // Ranking de médicos demo
      const medicosDemo = [
        { nome: 'Dr. João Silva', consultas: 45, faturamento: 18000, avaliacao: 4.8 },
        { nome: 'Dra. Maria Santos', consultas: 38, faturamento: 15200, avaliacao: 4.6 },
        { nome: 'Dr. Carlos Lima', consultas: 32, faturamento: 12800, avaliacao: 4.5 },
        { nome: 'Dra. Ana Costa', consultas: 28, faturamento: 11200, avaliacao: 4.7 },
        { nome: 'Dr. Pedro Oliveira', consultas: 25, faturamento: 10000, avaliacao: 4.4 }
      ];

      // Ranking de convênios demo
      const conveniosDemo = [
        { nome: 'Unimed', volume: 68, faturamento: 27200, margem: 0.22 },
        { nome: 'Bradesco Saúde', volume: 45, faturamento: 18000, margem: 0.25 },
        { nome: 'SulAmérica', volume: 32, faturamento: 12800, margem: 0.28 },
        { nome: 'Particular', volume: 28, faturamento: 14000, margem: 0.35 },
        { nome: 'Amil', volume: 22, faturamento: 8800, margem: 0.20 }
      ];

      // Procedimentos mais realizados demo
      const procedimentosDemo = [
        { nome: 'Consulta Clínica Geral', quantidade: 85, faturamento: 12750, tendencia: 'crescente' },
        { nome: 'Exame de Sangue', quantidade: 62, faturamento: 9300, tendencia: 'estável' },
        { nome: 'Eletrocardiograma', quantidade: 48, faturamento: 4800, tendencia: 'crescente' },
        { nome: 'Ultrassonografia', quantidade: 35, faturamento: 7000, tendencia: 'decrescente' },
        { nome: 'Consulta Cardiológica', quantidade: 28, faturamento: 8400, tendencia: 'estável' }
      ];

      // Análise temporal demo (últimos 6 meses)
      const analiseTemporalDemo = [];
      for (let i = 5; i >= 0; i--) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        analiseTemporalDemo.push({
          periodo: data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' }),
          consultas: Math.floor(Math.random() * 50) + 80,
          faturamento: Math.floor(Math.random() * 15000) + 20000,
          novos_pacientes: Math.floor(Math.random() * 20) + 15
        });
      }

      // Insights estratégicos demo
      const insights = [
        {
          categoria: 'Faturamento',
          insight: `Faturamento de R$ ${faturamentoPeriodo.toLocaleString('pt-BR')} representa crescimento de ${crescimentoPercentual}%`,
          impacto: 'alto' as const,
          acao_recomendada: 'Manter estratégias atuais e expandir horários de maior demanda'
        },
        {
          categoria: 'Ocupação',
          insight: `Taxa de ocupação de ${taxaOcupacao.toFixed(1)}% indica ${taxaOcupacao > 80 ? 'alta' : 'média'} demanda`,
          impacto: taxaOcupacao > 80 ? 'alto' as const : 'medio' as const,
          acao_recomendada: taxaOcupacao < 70 ? 'Aumentar marketing e captação de pacientes' : 'Considerar expandir capacidade de atendimento'
        },
        {
          categoria: 'Satisfação',
          insight: `Satisfação média de ${satisfacaoCliente.toFixed(1)}/5 demonstra boa qualidade no atendimento`,
          impacto: 'medio' as const,
          acao_recomendada: 'Implementar programa de melhoria contínua baseado em feedback'
        },
        {
          categoria: 'Inadimplência',
          insight: `${inadimplencia} casos de inadimplência requerem atenção especial`,
          impacto: inadimplencia > 10 ? 'alto' as const : 'baixo' as const,
          acao_recomendada: 'Revisar política de cobrança e implementar lembretes automáticos'
        }
      ];

      const dadosExecutivos: DadosRelatorioExecutivo = {
        resumo_executivo: {
          total_pacientes: totalPacientes,
          consultas_realizadas: consultasRealizadas,
          faturamento_periodo: faturamentoPeriodo,
          crescimento_percentual: crescimentoPercentual,
          taxa_ocupacao: taxaOcupacao,
          ticket_medio: ticketMedio
        },
        kpis_principais: {
          novos_pacientes: novosPacientes,
          taxa_retorno: taxaRetorno,
          inadimplencia: inadimplencia,
          satisfacao_cliente: satisfacaoCliente,
          produtividade_medica: produtividadeMedica,
          eficiencia_operacional: eficienciaOperacional
        },
        analise_temporal: analiseTemporalDemo,
        ranking_desempenho: {
          medicos: medicosDemo,
          convenios: conveniosDemo,
          procedimentos: procedimentosDemo
        },
        insights_estrategicos: insights
      };

      setDados(dadosExecutivos);

    } catch (error: any) {
      console.error('Erro ao buscar dados executivos:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar dados executivos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [clinica?.id, filtrosMemorized, toast]);

  const gerarRelatorioPDF = useCallback(async () => {
    if (!dados || !clinica?.id) {
      toast({
        title: "Erro",
        description: "Dados não disponíveis para gerar relatório",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Relatório Executivo Completo', 14, 20);
      
      // Informações da clínica
      doc.setFontSize(12);
      doc.text(`Clínica: ${clinica.nome || 'Nome não disponível'}`, 14, 35);
      doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 45);

      if (filtrosMemorized.dataInicio || filtrosMemorized.dataFim) {
        const periodo = `Período: ${filtrosMemorized.dataInicio?.toLocaleDateString('pt-BR') || 'Início'} - ${filtrosMemorized.dataFim?.toLocaleDateString('pt-BR') || 'Atual'}`;
        doc.text(periodo, 14, 55);
      }

      let yPosition = 75;

      // Resumo Executivo
      doc.setFontSize(16);
      doc.text('RESUMO EXECUTIVO', 14, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.text(`Total de Pacientes: ${dados.resumo_executivo.total_pacientes}`, 14, yPosition);
      yPosition += 10;
      doc.text(`Consultas Realizadas: ${dados.resumo_executivo.consultas_realizadas}`, 14, yPosition);
      yPosition += 10;
      doc.text(`Faturamento do Período: R$ ${dados.resumo_executivo.faturamento_periodo.toFixed(2)}`, 14, yPosition);
      yPosition += 10;
      doc.text(`Crescimento: ${dados.resumo_executivo.crescimento_percentual.toFixed(1)}%`, 14, yPosition);
      yPosition += 10;
      doc.text(`Taxa de Ocupação: ${dados.resumo_executivo.taxa_ocupacao.toFixed(1)}%`, 14, yPosition);
      yPosition += 10;
      doc.text(`Ticket Médio: R$ ${dados.resumo_executivo.ticket_medio.toFixed(2)}`, 14, yPosition);
      yPosition += 20;

      // KPIs Principais
      doc.setFontSize(14);
      doc.text('KPIs PRINCIPAIS', 14, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.text(`Novos Pacientes: ${dados.kpis_principais.novos_pacientes}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Taxa de Retorno: ${dados.kpis_principais.taxa_retorno.toFixed(1)}%`, 14, yPosition);
      yPosition += 8;
      doc.text(`Inadimplência: ${dados.kpis_principais.inadimplencia}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Satisfação do Cliente: ${dados.kpis_principais.satisfacao_cliente.toFixed(1)}/5`, 14, yPosition);
      yPosition += 8;
      doc.text(`Produtividade Médica: ${dados.kpis_principais.produtividade_medica}%`, 14, yPosition);
      yPosition += 8;
      doc.text(`Eficiência Operacional: ${dados.kpis_principais.eficiencia_operacional}%`, 14, yPosition);
      yPosition += 20;

      // Ranking de Médicos
      if (dados.ranking_desempenho.medicos.length > 0) {
        const tableDataMedicos = dados.ranking_desempenho.medicos.map(medico => [
          medico.nome,
          medico.consultas.toString(),
          `R$ ${medico.faturamento.toFixed(2)}`,
          medico.avaliacao.toFixed(1)
        ]);

        autoTable(doc, {
          head: [['Médico', 'Consultas', 'Faturamento', 'Avaliação']],
          body: tableDataMedicos,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Insights Estratégicos
      doc.setFontSize(14);
      doc.text('INSIGHTS ESTRATÉGICOS', 14, yPosition);
      yPosition += 15;

      dados.insights_estrategicos.forEach((insight, index) => {
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${insight.categoria}: ${insight.insight}`, 14, yPosition);
        yPosition += 8;
        doc.text(`   Ação: ${insight.acao_recomendada}`, 14, yPosition);
        yPosition += 12;
      });

      const fileName = `relatorio-executivo-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Sucesso",
        description: "Relatório executivo gerado com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao gerar relatório executivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório executivo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [dados, clinica, filtrosMemorized, toast]);

  useEffect(() => {
    if (clinica?.id) {
      buscarDadosExecutivos();
    }
  }, [buscarDadosExecutivos]);

  return {
    dados,
    loading,
    gerarRelatorioPDF,
    refetch: buscarDadosExecutivos
  };
};
