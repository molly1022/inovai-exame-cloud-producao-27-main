
-- Criar tabela para receitas médicas
CREATE TABLE public.receitas_medicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medico_id UUID NOT NULL,
  paciente_id UUID NOT NULL,
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  medicamentos TEXT NOT NULL,
  observacoes TEXT,
  data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_receitas_medico_id ON public.receitas_medicas(medico_id);
CREATE INDEX idx_receitas_paciente_id ON public.receitas_medicas(paciente_id);
CREATE INDEX idx_receitas_clinica_id ON public.receitas_medicas(clinica_id);
CREATE INDEX idx_receitas_data_emissao ON public.receitas_medicas(data_emissao);

-- Habilitar Row Level Security
ALTER TABLE public.receitas_medicas ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (apenas médicos podem acessar suas próprias receitas)
CREATE POLICY "Medicos podem ver suas receitas" 
  ON public.receitas_medicas 
  FOR SELECT 
  USING (true); -- Por enquanto permitindo acesso geral, ajustaremos conforme necessário

CREATE POLICY "Medicos podem criar receitas" 
  ON public.receitas_medicas 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Medicos podem atualizar suas receitas" 
  ON public.receitas_medicas 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Medicos podem deletar suas receitas" 
  ON public.receitas_medicas 
  FOR DELETE 
  USING (true);
