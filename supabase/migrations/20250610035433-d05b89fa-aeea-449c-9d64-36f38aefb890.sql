
-- Primeiro, vamos garantir que os agendamentos estão ligados aos exames corretamente
-- e que as categorias de exames são utilizadas no sistema de agendamentos

-- Adicionar coluna categoria_id na tabela agendamentos para ligar às categorias de exames
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS categoria_id uuid REFERENCES public.categorias_exames(id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente_id ON public.agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON public.agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_exames_paciente_id ON public.exames(paciente_id);

-- Habilitar Row Level Security para agendamentos se ainda não estiver
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para agendamentos
DROP POLICY IF EXISTS "Users can view agendamentos from their clinic" ON public.agendamentos;
CREATE POLICY "Users can view agendamentos from their clinic" 
  ON public.agendamentos 
  FOR SELECT 
  USING (clinica_id IN (SELECT id FROM public.clinicas WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert agendamentos to their clinic" ON public.agendamentos;
CREATE POLICY "Users can insert agendamentos to their clinic" 
  ON public.agendamentos 
  FOR INSERT 
  WITH CHECK (clinica_id IN (SELECT id FROM public.clinicas WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update agendamentos from their clinic" ON public.agendamentos;
CREATE POLICY "Users can update agendamentos from their clinic" 
  ON public.agendamentos 
  FOR UPDATE 
  USING (clinica_id IN (SELECT id FROM public.clinicas WHERE user_id = auth.uid()));

-- Habilitar realtime para agendamentos
ALTER TABLE public.agendamentos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamentos;
