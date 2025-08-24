import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FiltrosConvenios {
  dataInicio?: Date;
  dataFim?: Date;
  convenioId?: string;
  termoBusca?: string;
}

interface DesempenhoConvenio {
  convenio_id: string;
  convenio_nome: string;
  cor: string;
  total_consultas: number;
  faturamento_total: number;
  ticket_medio: number;
  pacientes_unicos: number;
  consultas_pagas: number;
  consultas_pendentes: number;
  consultas_parciais: number;
  percentual_desconto: number;
  procedimentos_mais_realizados: Array<{
    tipo_exame: string;
    quantidade: number;
    faturamento: number;
  }>;
}

interface ComparativoConvenios {
  total_convenios: number;
  total_particulares: number;
  faturamento_convenios: number;
  faturamento_particulares: number;
  ticket_medio_convenios: number;
  ticket_medio_particulares: number;
  ranking_volume: Array<{
    convenio_nome: string;
    total_consultas: number;
  }>;
  ranking_faturamento: Array<{
    convenio_nome: string;
    faturamento_total: number;
  }>;
}

export const useRelatoriosConvenios = (filtros: FiltrosConvenios = {}) => {
  const [desempenhoConvenios, setDesempenhoConvenios] = useState<DesempenhoConvenio[]>([]);
  const [comparativoConvenios, setComparativoConvenios] = useState<ComparativoConvenios | null>(null);
  const [loading, setLoading] = useState(false);
  const { clinica } = useClinica();
  const { toast } = useToast();

  const buscarDesempenhoConvenios = async () => {
    if (!clinica?.id) return;

    try {
      setLoading(true);
      
      console.log('Demo: Buscando desempenho de convênios com filtros:', filtros);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Demo: dados simulados de convênios
      const conveniosDemo = [
        { id: '1', nome: 'Unimed', cor: '#00a651', percentual_desconto: 0.15 },
        { id: '2', nome: 'Bradesco Saúde', cor: '#e60000', percentual_desconto: 0.12 },
        { id: '3', nome: 'SulAmérica', cor: '#0066cc', percentual_desconto: 0.18 },
        { id: '4', nome: 'Amil', cor: '#ff6600', percentual_desconto: 0.10 },
        { id: '5', nome: 'NotreDame', cor: '#8b0000', percentual_desconto: 0.14 }
      ];

      const desempenho: DesempenhoConvenio[] = [];

      // Para cada convênio, gerar estatísticas demo
      for (const convenio of conveniosDemo) {
        // Simular dados de agendamentos para o convênio
        const totalConsultas = Math.floor(Math.random() * 50) + 20;
        const consultasRealizadas = Math.floor(totalConsultas * 0.8);
        const faturamentoTotal = totalConsultas * (Math.floor(Math.random() * 100) + 50);
        const ticketMedio = totalConsultas > 0 ? faturamentoTotal / totalConsultas : 0;
        
        // Simular pacientes únicos
        const pacientesUnicos = Math.floor(totalConsultas * 0.7);
        
        // Simular status de pagamentos
        const consultasPagas = Math.floor(totalConsultas * 0.6);
        const consultasPendentes = Math.floor(totalConsultas * 0.3);
        const consultasParciais = totalConsultas - consultasPagas - consultasPendentes;

        // Simular tipos de exame mais solicitados
        const tiposExameDemo = [
          { tipo_exame: 'Consulta Clínica Geral', quantidade: Math.floor(Math.random() * 20) + 5, faturamento: Math.floor(Math.random() * 3000) + 1000 },
          { tipo_exame: 'Exame de Sangue', quantidade: Math.floor(Math.random() * 15) + 3, faturamento: Math.floor(Math.random() * 1500) + 500 },
          { tipo_exame: 'Ultrassonografia', quantidade: Math.floor(Math.random() * 10) + 2, faturamento: Math.floor(Math.random() * 2000) + 800 },
          { tipo_exame: 'Eletrocardiograma', quantidade: Math.floor(Math.random() * 8) + 1, faturamento: Math.floor(Math.random() * 800) + 300 },
          { tipo_exame: 'Consulta Cardiológica', quantidade: Math.floor(Math.random() * 6) + 1, faturamento: Math.floor(Math.random() * 1200) + 600 }
        ].slice(0, 3);

        desempenho.push({
          convenio_id: convenio.id,
          convenio_nome: convenio.nome,
          cor: convenio.cor,
          total_consultas: totalConsultas,
          faturamento_total: faturamentoTotal,
          ticket_medio: ticketMedio,
          pacientes_unicos: pacientesUnicos,
          consultas_pagas: consultasPagas,
          consultas_pendentes: consultasPendentes,
          consultas_parciais: consultasParciais,
          percentual_desconto: convenio.percentual_desconto,
          procedimentos_mais_realizados: tiposExameDemo
        });
      }

      setDesempenhoConvenios(desempenho);
    } catch (error: any) {
      console.error('Demo: Erro ao buscar desempenho dos convênios:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarComparativoConvenios = async () => {
    if (!clinica?.id) return;

    try {
      console.log('Demo: Buscando comparativo de convênios');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Demo: dados comparativos simulados
      const comparativoDemo = [
        { convenio: 'Unimed', total_faturamento: 45000, porcentagem: 35 },
        { convenio: 'Bradesco Saúde', total_faturamento: 32000, porcentagem: 25 },
        { convenio: 'SulAmérica', total_faturamento: 28000, porcentagem: 22 },
        { convenio: 'Particular', total_faturamento: 15000, porcentagem: 12 },
        { convenio: 'Amil', total_faturamento: 8000, porcentagem: 6 }
      ];

      setComparativoConvenios({
        total_convenios: 238,
        total_particulares: 85,
        faturamento_convenios: 128000,
        faturamento_particulares: 23000,
        ticket_medio_convenios: 537.82,
        ticket_medio_particulares: 270.59,
        ranking_volume: [
          { convenio_nome: 'Unimed', total_consultas: 68 },
          { convenio_nome: 'Bradesco Saúde', total_consultas: 45 },
          { convenio_nome: 'SulAmérica', total_consultas: 32 },
          { convenio_nome: 'Amil', total_consultas: 28 },
          { convenio_nome: 'NotreDame', total_consultas: 22 }
        ],
        ranking_faturamento: [
          { convenio_nome: 'Unimed', faturamento_total: 45000 },
          { convenio_nome: 'Bradesco Saúde', faturamento_total: 32000 },
          { convenio_nome: 'SulAmérica', faturamento_total: 28000 },
          { convenio_nome: 'Amil', faturamento_total: 15000 },
          { convenio_nome: 'NotreDame', faturamento_total: 8000 }
        ]
      });

    } catch (error: any) {
      console.error('Demo: Erro ao buscar comparativo de convênios:', error);
    }
  };

  const gerarRelatorioPDF = async () => {
    if (!clinica?.id) {
      toast({
        title: "Erro",
        description: "Clínica não encontrada",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Gerando relatório de convênios PDF...');

      // Criar o PDF
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Relatório de Convênios', 14, 20);
      
      // Informações da clínica
      doc.setFontSize(12);
      doc.text(`Clínica: ${clinica.nome || 'Nome não disponível'}`, 14, 35);
      doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 45);

      if (filtros.dataInicio || filtros.dataFim) {
        const periodo = `Período: ${filtros.dataInicio?.toLocaleDateString('pt-BR') || 'Início'} - ${filtros.dataFim?.toLocaleDateString('pt-BR') || 'Atual'}`;
        doc.text(periodo, 14, 55);
      }

      let yPosition = 70;

      // Resumo Comparativo
      if (comparativoConvenios) {
        doc.setFontSize(14);
        doc.text('RESUMO COMPARATIVO', 14, yPosition);
        yPosition += 15;
        
        doc.setFontSize(10);
        doc.text(`Total Consultas Convênios: ${comparativoConvenios.total_convenios}`, 14, yPosition);
        yPosition += 10;
        doc.text(`Total Consultas Particulares: ${comparativoConvenios.total_particulares}`, 14, yPosition);
        yPosition += 10;
        doc.text(`Faturamento Convênios: ${comparativoConvenios.faturamento_convenios.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, yPosition);
        yPosition += 10;
        doc.text(`Faturamento Particulares: ${comparativoConvenios.faturamento_particulares.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, yPosition);
        yPosition += 20;
      }

      // Tabela de Desempenho por Convênio
      if (desempenhoConvenios.length > 0) {
        const tableData = desempenhoConvenios.map(convenio => [
          convenio.convenio_nome,
          convenio.total_consultas.toString(),
          `R$ ${convenio.faturamento_total.toFixed(2)}`,
          `R$ ${convenio.ticket_medio.toFixed(2)}`,
          convenio.pacientes_unicos.toString(),
          convenio.consultas_pagas.toString(),
          convenio.consultas_pendentes.toString(),
          `${convenio.percentual_desconto}%`
        ]);

        autoTable(doc, {
          head: [['Convênio', 'Consultas', 'Faturamento', 'Ticket Médio', 'Pacientes', 'Pagas', 'Pendentes', 'Desconto']],
          body: tableData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 20 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 18 },
            6: { cellWidth: 18 },
            7: { cellWidth: 20 }
          }
        });
      }

      // Salvar o PDF
      const fileName = `relatorio-convenios-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      console.log('PDF de convênios gerado com sucesso!');
      toast({
        title: "Sucesso",
        description: "Relatório de convênios PDF gerado com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao gerar relatório de convênios PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório de convênios PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinica?.id) {
      buscarDesempenhoConvenios();
      buscarComparativoConvenios();
    }
  }, [clinica?.id, filtros]);

  return {
    desempenhoConvenios,
    comparativoConvenios,
    loading,
    gerarRelatorioPDF,
    refetch: () => {
      buscarDesempenhoConvenios();
      buscarComparativoConvenios();
    }
  };
};
