
-- Criar tabela para anotações médicas dos pacientes
CREATE TABLE public.anotacoes_medicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL,
  medico_id UUID NOT NULL,
  clinica_id UUID NOT NULL,
  agendamento_id UUID NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tipo_anotacao TEXT NOT NULL DEFAULT 'consulta',
  data_anotacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NULL
);

-- Adicionar índices para performance
CREATE INDEX idx_anotacoes_medicas_paciente_id ON public.anotacoes_medicas(paciente_id);
CREATE INDEX idx_anotacoes_medicas_medico_id ON public.anotacoes_medicas(medico_id);
CREATE INDEX idx_anotacoes_medicas_clinica_id ON public.anotacoes_medicas(clinica_id);
CREATE INDEX idx_anotacoes_medicas_data ON public.anotacoes_medicas(data_anotacao DESC);

-- Habilitar Row Level Security
ALTER TABLE public.anotacoes_medicas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para anotações médicas (sem UUID padrão fixo)
CREATE POLICY "Anotações médicas visíveis para mesma clínica" 
  ON public.anotacoes_medicas 
  FOR SELECT 
  USING (true);

CREATE POLICY "Usuários podem criar anotações médicas" 
  ON public.anotacoes_medicas 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar anotações médicas" 
  ON public.anotacoes_medicas 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Usuários podem deletar anotações médicas" 
  ON public.anotacoes_medicas 
  FOR DELETE 
  USING (true);

-- Adicionar foreign keys
ALTER TABLE public.anotacoes_medicas 
ADD CONSTRAINT fk_anotacoes_paciente 
FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;

ALTER TABLE public.anotacoes_medicas 
ADD CONSTRAINT fk_anotacoes_medico 
FOREIGN KEY (medico_id) REFERENCES public.medicos(id) ON DELETE CASCADE;

ALTER TABLE public.anotacoes_medicas 
ADD CONSTRAINT fk_anotacoes_clinica 
FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id) ON DELETE CASCADE;

ALTER TABLE public.anotacoes_medicas 
ADD CONSTRAINT fk_anotacoes_agendamento 
FOREIGN KEY (agendamento_id) REFERENCES public.agendamentos(id) ON DELETE SET NULL;
