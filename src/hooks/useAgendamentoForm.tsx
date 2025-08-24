import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useClinica } from "@/hooks/useClinica";
import { useTenantConnection } from "@/hooks/useTenantConnection";
import { format } from "date-fns";

interface UseAgendamentoFormProps {
  agendamento?: any;
  selectedDate?: Date;
  selectedTime?: string;
  onSuccess?: () => void;
}

interface FormData {
  paciente_id: string;
  medico_id: string;
  data_agendamento: string;
  horario: string;
  horario_fim: string;
  duracao_minutos: number;
  tipo_exame: string;
  observacoes: string;
  convenio_id: string;
  valor_exame: number;
  valor_convenio: number;
  valor_particular: number;
  desconto: number;
  forma_pagamento: string;
  status_pagamento: string;
  autorização_cartao: string;
  observacoes_pagamento: string;
  status: string;
}

export const useAgendamentoForm = ({ agendamento, selectedDate, selectedTime, onSuccess }: UseAgendamentoFormProps) => {
  const { clinica } = useClinica();
  const { query, isConnected } = useTenantConnection();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    paciente_id: '',
    medico_id: '',
    data_agendamento: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    horario: selectedTime || '',
    horario_fim: '',
    duracao_minutos: 30,
    tipo_exame: '',
    observacoes: '',
    convenio_id: '',
    valor_exame: 0,
    valor_convenio: 0,
    valor_particular: 0,
    desconto: 0,
    forma_pagamento: 'dinheiro',
    status_pagamento: 'pendente',
    autorização_cartao: '',
    observacoes_pagamento: '',
    status: 'agendado',
  });

  useEffect(() => {
    if (agendamento) {
      setFormData({
        paciente_id: agendamento.paciente_id || '',
        medico_id: agendamento.medico_id || '',
        data_agendamento: agendamento.data_agendamento ? format(new Date(agendamento.data_agendamento), 'yyyy-MM-dd') : '',
        horario: agendamento.horario || '',
        horario_fim: agendamento.horario_fim || '',
        duracao_minutos: agendamento.duracao_minutos || 30,
        tipo_exame: agendamento.tipo_exame || '',
        observacoes: agendamento.observacoes || '',
        convenio_id: agendamento.convenio_id || '',
        valor_exame: agendamento.valor_exame || 0,
        valor_convenio: agendamento.valor_convenio || 0,
        valor_particular: agendamento.valor_particular || 0,
        desconto: agendamento.desconto || 0,
        forma_pagamento: agendamento.forma_pagamento || 'dinheiro',
        status_pagamento: agendamento.status_pagamento || 'pendente',
        autorização_cartao: agendamento.autorização_cartao || '',
        observacoes_pagamento: agendamento.observacoes_pagamento || '',
        status: agendamento.status || 'agendado',
      });
    } else if (selectedDate && selectedTime) {
      setFormData(prev => ({
        ...prev,
        data_agendamento: format(selectedDate, 'yyyy-MM-dd'),
        horario: selectedTime,
      }));
    }
  }, [agendamento, selectedDate, selectedTime]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      medico_id: '',
      data_agendamento: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      horario: selectedTime || '',
      horario_fim: '',
      duracao_minutos: 30,
      tipo_exame: '',
      observacoes: '',
      convenio_id: '',
      valor_exame: 0,
      valor_convenio: 0,
      valor_particular: 0,
      desconto: 0,
      forma_pagamento: 'dinheiro',
      status_pagamento: 'pendente',
      autorização_cartao: '',
      observacoes_pagamento: '',
      status: 'agendado',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Sistema não conectado ao banco operacional");
      return;
    }
    
    if (!clinica?.id) {
      toast.error("Clínica não encontrada");
      return;
    }

    if (!formData.paciente_id || !formData.medico_id || !formData.data_agendamento || !formData.horario) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (formData.forma_pagamento === 'cartao' && !formData.autorização_cartao) {
      toast.error("Número da autorização é obrigatório para pagamento no cartão");
      return;
    }

    try {
      setLoading(true);

      // Preparar dados para inserção/atualização
      const dadosAgendamento = {
        paciente_id: formData.paciente_id,
        medico_id: formData.medico_id,
        data_agendamento: new Date(formData.data_agendamento).toISOString(),
        horario: formData.horario,
        horario_fim: formData.horario_fim,
        duracao_minutos: formData.duracao_minutos,
        tipo_exame: formData.tipo_exame,
        observacoes: formData.observacoes || null,
        convenio_id: formData.convenio_id || null,
        valor_exame: formData.valor_exame || 0,
        valor_convenio: formData.valor_convenio || 0,
        valor_particular: formData.valor_particular || 0,
        desconto: formData.desconto || 0,
        forma_pagamento: formData.forma_pagamento,
        status_pagamento: formData.status_pagamento || 'pendente',
        autorização_cartao: formData.autorização_cartao || null,
        observacoes_pagamento: formData.observacoes_pagamento || null,
        clinica_id: clinica.id,
        status: formData.status || 'agendado',
      };

      if (agendamento) {
        // Atualização
        const { error: updateError } = await query('agendamentos')
          .update(dadosAgendamento)
          .eq('id', agendamento.id);

        if (updateError) {
          console.error('Erro na atualização:', updateError);
          throw updateError;
        }

        console.log('Agendamento atualizado com sucesso');
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        // Inserção
        const { error: insertError } = await query('agendamentos')
          .insert([dadosAgendamento]);

        if (insertError) {
          console.error('Erro na inserção:', insertError);
          throw insertError;
        }

        console.log('Novo agendamento criado');
        toast.success("Agendamento criado com sucesso!");
      }

      // Chamada de sucesso
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Erro ao processar agendamento:', error);
      let errorMessage = 'Erro ao processar agendamento. Tente novamente.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    updateField,
    handleSubmit,
    resetForm,
  };
};