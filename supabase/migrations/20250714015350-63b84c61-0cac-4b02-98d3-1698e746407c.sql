-- Criar tabela para reagendamentos
CREATE TABLE public.reagendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_original_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  agendamento_novo_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  motivo TEXT,
  data_reagendamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.reagendamentos ENABLE ROW LEVEL SECURITY;

-- Política para clínicas poderem gerenciar seus reagendamentos
CREATE POLICY "Clínicas podem gerenciar seus reagendamentos" 
ON public.reagendamentos 
FOR ALL 
USING (clinica_id IN (SELECT id FROM clinicas));

-- Índices para performance
CREATE INDEX idx_reagendamentos_clinica_id ON public.reagendamentos(clinica_id);
CREATE INDEX idx_reagendamentos_agendamento_original ON public.reagendamentos(agendamento_original_id);
CREATE INDEX idx_reagendamentos_data ON public.reagendamentos(data_reagendamento);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_reagendamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_reagendamentos_updated_at
BEFORE UPDATE ON public.reagendamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_reagendamentos_updated_at();