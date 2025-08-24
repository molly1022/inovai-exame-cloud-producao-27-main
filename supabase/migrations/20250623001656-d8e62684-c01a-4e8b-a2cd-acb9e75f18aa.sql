
-- Adicionar coluna horario na tabela agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS horario text;

-- Comentário: Esta coluna permitirá salvar o horário do agendamento separadamente
