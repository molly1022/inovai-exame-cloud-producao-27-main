
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClinica } from '@/hooks/useClinica';
import jsPDF from 'jspdf';

export const useComprovanteAgendamento = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { clinica } = useClinica();

  const gerarComprovante = async (agendamento: any) => {
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
      console.log('Gerando comprovante para agendamento:', agendamento.id);

      // Criar o PDF
      const doc = new jsPDF();
      
      // Configurar cores
      const primaryColor = [41, 128, 185] as const; // Azul
      const secondaryColor = [52, 73, 94] as const; // Cinza escuro
      const accentColor = [231, 76, 60] as const; // Vermelho para destaque

      // Cabeçalho com dados da clínica
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text(clinica.nome || 'Clínica', 20, 25);
      
      if (clinica.telefone) {
        doc.setFontSize(10);
        doc.text(`Tel: ${clinica.telefone}`, 20, 32);
      }
      
      if (clinica.endereco) {
        doc.setFontSize(10);
        doc.text(clinica.endereco, 20, 37);
      }

      // Título do documento
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(18);
      doc.text('COMPROVANTE DE AGENDAMENTO', 20, 60);

      // Número do comprovante
      doc.setFontSize(10);
      doc.text(`Nº ${agendamento.id.slice(-8).toUpperCase()}`, 150, 60);

      // Linha separadora
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 65, 190, 65);

      // Dados do paciente
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('DADOS DO PACIENTE', 20, 80);
      
      doc.setFontSize(11);
      doc.text(`Nome: ${agendamento.pacientes?.nome || 'Não informado'}`, 20, 90);
      doc.text(`CPF: ${agendamento.pacientes?.cpf || 'Não informado'}`, 20, 97);
      
      if (agendamento.pacientes?.numero_convenio) {
        doc.text(`Convênio: ${agendamento.pacientes.numero_convenio}`, 20, 104);
      }

      // Dados da consulta - DESTACADO
      doc.setFillColor(248, 249, 250);
      doc.rect(15, 115, 180, 45, 'F');
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(1);
      doc.rect(15, 115, 180, 45);

      doc.setFontSize(14);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('INFORMAÇÕES DA CONSULTA', 20, 128);

      doc.setFontSize(12);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Tipo de Exame: ${agendamento.tipo_exame}`, 20, 138);
      doc.text(`Médico: ${agendamento.medicos?.nome_completo || 'Não informado'}`, 20, 145);
      
      // Data e horário destacados
      const dataFormatada = new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR');
      const horario = agendamento.horario || new Date(agendamento.data_agendamento).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      doc.setFontSize(13);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`Data: ${dataFormatada}`, 20, 152);
      doc.text(`Horário: ${horario}`, 100, 152);

      // Informações de pagamento
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('INFORMAÇÕES DE PAGAMENTO', 20, 175);

      doc.setFontSize(11);
      const valorExame = agendamento.valor_exame || 0;
      const valorPago = agendamento.valor_pago || 0;
      const statusPagamento = agendamento.status_pagamento || 'pendente';
      
      doc.text(`Valor do Exame: R$ ${valorExame.toFixed(2)}`, 20, 185);
      doc.text(`Valor Pago: R$ ${valorPago.toFixed(2)}`, 20, 192);
      doc.text(`Status: ${statusPagamento.toUpperCase()}`, 20, 199);
      
      if (agendamento.metodo_pagamento) {
        doc.text(`Método de Pagamento: ${agendamento.metodo_pagamento}`, 20, 206);
      }

      if (valorExame > valorPago) {
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(`Saldo Devedor: R$ ${(valorExame - valorPago).toFixed(2)}`, 20, 213);
      }

      // Observações se houver
      if (agendamento.observacoes) {
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFontSize(10);
        doc.text('Observações:', 20, 225);
        const observacoes = doc.splitTextToSize(agendamento.observacoes, 170);
        doc.text(observacoes, 20, 232);
      }

      // Rodapé
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.line(20, 270, 190, 270);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Comprovante gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 280);
      doc.text('Este comprovante não possui valor fiscal', 20, 285);

      // Salvar o PDF
      const nomeArquivo = `comprovante-${agendamento.pacientes?.nome?.replace(/\s+/g, '-') || 'agendamento'}-${dataFormatada.replace(/\//g, '-')}.pdf`;
      doc.save(nomeArquivo);

      toast({
        title: "Comprovante gerado!",
        description: "PDF do comprovante foi baixado com sucesso",
      });
      
    } catch (error) {
      console.error('Erro ao gerar comprovante:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar comprovante. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    gerarComprovante,
    loading
  };
};
