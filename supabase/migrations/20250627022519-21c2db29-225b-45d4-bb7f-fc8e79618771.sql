
-- Criar tabela de convênios
CREATE TABLE public.convenios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#3B82F6',
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar campo convenio_id na tabela pacientes
ALTER TABLE public.pacientes 
ADD COLUMN convenio_id UUID REFERENCES public.convenios(id);

-- Adicionar campo convenio_id na tabela agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN convenio_id UUID REFERENCES public.convenios(id);

-- Adicionar campo convenio_id na tabela exames
ALTER TABLE public.exames 
ADD COLUMN convenio_id UUID REFERENCES public.convenios(id);

-- Índices para melhor performance
CREATE INDEX idx_convenios_clinica_id ON public.convenios(clinica_id);
CREATE INDEX idx_pacientes_convenio_id ON public.pacientes(convenio_id);
CREATE INDEX idx_agendamentos_convenio_id ON public.agendamentos(convenio_id);
CREATE INDEX idx_exames_convenio_id ON public.exames(convenio_id);
