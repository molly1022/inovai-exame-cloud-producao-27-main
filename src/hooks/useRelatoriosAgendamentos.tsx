
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClinica } from '@/hooks/useClinica';
import { useDebounce } from '@/hooks/useDebounce';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FiltrosAgendamentos {
  dataInicio?: Date;
  dataFim?: Date;
  status?: string;
  medicoId?: string;
  convenioId?: string;
  termoBusca?: string;
}

interface DadosAgendamentos {
  agendamentos: any[];
  totalAgendamentos: number;
  agendados: number;
  confirmados: number;
  concluidos: number;
  cancelados: number;
  totalFaturamento: number;
  totalRecebido: number;
  totalPendente: number;
  loading: boolean;
}

export const useRelatoriosAgendamentos = (filtros: FiltrosAgendamentos = {}) => {
  const [dados, setDados] = useState<DadosAgendamentos>({
    agendamentos: [],
    totalAgendamentos: 0,
    agendados: 0,
    confirmados: 0,
    concluidos: 0,
    cancelados: 0,
    totalFaturamento: 0,
    totalRecebido: 0,
    totalPendente: 0,
    loading: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { clinica } = useClinica();
  const debouncedTermoBusca = useDebounce(filtros.termoBusca || '', 300);

  const buscarDadosAgendamentos = async () => {
    if (!clinica?.id) return;

    try {
      setLoading(true);
      console.log('Demo: Buscando dados de agendamentos com filtros:', filtros);
      
      await new Promise(resolve => setTimeout(resolve, 800));

      // Demo: dados simulados de agendamentos
      const agendamentosDemo = [
        {
          id: '1',
          data_agendamento: '2024-01-15T10:00:00',
          horario: '10:00',
          tipo_exame: 'Consulta Clínica Geral',
          valor_exame: 150,
          valor_pago: 150,
          status: 'concluido',
          status_pagamento: 'pago',
          pacientes: { nome: 'João Silva', cpf: '123.456.789-00' },
          medicos: { nome_completo: 'Dr. Carlos Lima' },
          convenios: { nome: 'Unimed' }
        },
        {
          id: '2',
          data_agendamento: '2024-01-16T14:30:00',
          horario: '14:30',
          tipo_exame: 'Exame de Sangue',
          valor_exame: 80,
          valor_pago: 0,
          status: 'agendado',
          status_pagamento: 'pendente',
          pacientes: { nome: 'Maria Santos', cpf: '987.654.321-00' },
          medicos: { nome_completo: 'Dra. Ana Costa' },
          convenios: { nome: 'Bradesco Saúde' }
        },
        {
          id: '3',
          data_agendamento: '2024-01-17T09:00:00',
          horario: '09:00',
          tipo_exame: 'Consulta Cardiológica',
          valor_exame: 200,
          valor_pago: 200,
          status: 'confirmado',
          status_pagamento: 'pago',
          pacientes: { nome: 'Pedro Oliveira', cpf: '456.789.123-00' },
          medicos: { nome_completo: 'Dr. João Silva' },
          convenios: null
        },
        {
          id: '4',
          data_agendamento: '2024-01-18T16:00:00',
          horario: '16:00',
          tipo_exame: 'Ultrassonografia',
          valor_exame: 120,
          valor_pago: 120,
          status: 'concluido',
          status_pagamento: 'pago',
          pacientes: { nome: 'Ana Costa', cpf: '321.654.987-00' },
          medicos: { nome_completo: 'Dra. Maria Santos' },
          convenios: { nome: 'SulAmérica' }
        },
        {
          id: '5',
          data_agendamento: '2024-01-19T08:30:00',
          horario: '08:30',
          tipo_exame: 'Eletrocardiograma',
          valor_exame: 90,
          valor_pago: 0,
          status: 'cancelado',
          status_pagamento: 'cancelado',
          pacientes: { nome: 'Carlos Oliveira', cpf: '789.123.456-00' },
          medicos: { nome_completo: 'Dr. Carlos Lima' },
          convenios: { nome: 'Amil' }
        }
      ];

      let dadosFiltrados = [...agendamentosDemo];

      // Aplicar filtros demo
      if (filtros.status && filtros.status !== 'todos') {
        dadosFiltrados = dadosFiltrados.filter(a => a.status === filtros.status);
      }

      // Aplicar filtro de busca por paciente
      if (debouncedTermoBusca.trim()) {
        const termo = debouncedTermoBusca.toLowerCase().trim();
        dadosFiltrados = dadosFiltrados.filter(item =>
          item.pacientes?.nome?.toLowerCase().includes(termo) ||
          item.pacientes?.cpf?.includes(termo)
        );
      }

      // Calcular estatísticas demo
      const totalAgendamentos = dadosFiltrados.length;
      const agendados = dadosFiltrados.filter(a => a.status === 'agendado').length;
      const confirmados = dadosFiltrados.filter(a => a.status === 'confirmado').length;
      const concluidos = dadosFiltrados.filter(a => a.status === 'concluido').length;
      const cancelados = dadosFiltrados.filter(a => a.status === 'cancelado').length;
      
      const totalFaturamento = dadosFiltrados.reduce((sum, a) => sum + (a.valor_exame || 0), 0);
      const totalRecebido = dadosFiltrados.reduce((sum, a) => sum + (a.valor_pago || 0), 0);
      const totalPendente = totalFaturamento - totalRecebido;

      setDados({
        agendamentos: dadosFiltrados,
        totalAgendamentos,
        agendados,
        confirmados,
        concluidos,
        cancelados,
        totalFaturamento,
        totalRecebido,
        totalPendente,
        loading: false
      });

    } catch (error: any) {
      console.error('Erro ao buscar dados de agendamentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar dados de agendamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioPDF = async (filtrosCustom?: FiltrosAgendamentos) => {
    const filtrosParaUsar = filtrosCustom || filtros;
    
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
      console.log('Gerando PDF com filtros:', filtrosParaUsar);

      // Usar os dados já filtrados se disponíveis, senão buscar novamente
      const agendamentosParaPDF = dados.agendamentos.length > 0 ? dados.agendamentos : [];

      if (agendamentosParaPDF.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum agendamento encontrado para o período selecionado",
          variant: "default"
        });
        return;
      }

      // Criar o PDF
      const doc = new jsPDF('landscape');
      
      // Título
      doc.setFontSize(18);
      doc.text('Relatório Detalhado de Agendamentos', 14, 20);
      
      // Informações da clínica e filtros
      doc.setFontSize(12);
      doc.text(`Clínica: ${clinica.nome || 'Nome não disponível'}`, 14, 35);
      doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 45);
      
      if (filtrosParaUsar.dataInicio || filtrosParaUsar.dataFim) {
        let periodoTexto = 'Período: ';
        if (filtrosParaUsar.dataInicio) periodoTexto += `de ${filtrosParaUsar.dataInicio.toLocaleDateString('pt-BR')} `;
        if (filtrosParaUsar.dataFim) periodoTexto += `até ${filtrosParaUsar.dataFim.toLocaleDateString('pt-BR')}`;
        doc.text(periodoTexto, 14, 55);
      }

      // Preparar dados da tabela
      const tableData = agendamentosParaPDF.map(agendamento => [
        new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR'),
        agendamento.horario || '-',
        agendamento.pacientes?.nome || 'Paciente não informado',
        agendamento.pacientes?.cpf || '-',
        agendamento.tipo_exame || '-',
        agendamento.medicos?.nome_completo || 'Médico não informado',
        agendamento.status || 'Não informado',
        agendamento.convenios?.nome || 'Particular',
        `R$ ${(agendamento.valor_exame || 0).toFixed(2)}`,
        `R$ ${(agendamento.valor_pago || 0).toFixed(2)}`,
        agendamento.status_pagamento || 'Pendente',
        agendamento.metodo_pagamento || '-'
      ]);

      // Adicionar tabela
      autoTable(doc, {
        head: [['Data', 'Horário', 'Paciente', 'CPF', 'Exame', 'Médico', 'Status', 'Convênio', 'Valor', 'Pago', 'Status Pag.', 'Método Pag.']],
        body: tableData,
        startY: filtrosParaUsar.dataInicio || filtrosParaUsar.dataFim ? 65 : 55,
        styles: { fontSize: 6 },
        headStyles: { fillColor: [59, 130, 246] },
        margin: { top: 55 },
        columnStyles: {
          8: { halign: 'right' },
          9: { halign: 'right' },
        }
      });

      // Resumo
      const finalY = (doc as any).lastAutoTable.finalY || 55;
      
      doc.setFontSize(12);
      doc.text('Resumo:', 14, finalY + 20);
      doc.setFontSize(10);
      doc.text(`Total: ${dados.totalAgendamentos} | Concluídos: ${dados.concluidos} | Cancelados: ${dados.cancelados}`, 14, finalY + 30);
      doc.text(`Faturamento: R$ ${dados.totalFaturamento.toFixed(2)} | Recebido: R$ ${dados.totalRecebido.toFixed(2)}`, 14, finalY + 40);

      const fileName = `agendamentos-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Sucesso",
        description: "Relatório PDF gerado com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao gerar relatório PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinica?.id) {
      buscarDadosAgendamentos();
    }
  }, [clinica?.id, filtros.dataInicio, filtros.dataFim, filtros.status, filtros.medicoId, filtros.convenioId, debouncedTermoBusca]);

  return {
    dados,
    loading,
    gerarRelatorioPDF,
    refetch: buscarDadosAgendamentos
  };
};
