-- Criar tabela para gerenciar inscrições de novas clínicas
CREATE TABLE IF NOT EXISTS public.inscricoes_pendentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clinica TEXT NOT NULL,
  nome_responsavel TEXT,
  email_responsavel TEXT NOT NULL,
  cpf_responsavel TEXT,
  telefone TEXT,
  subdominio_solicitado TEXT UNIQUE NOT NULL,
  dados_completos JSONB,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  motivo_rejeicao TEXT,
  processada_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.inscricoes_pendentes ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo (sistema administrativo)
CREATE POLICY "Acesso total às inscrições pendentes" 
ON public.inscricoes_pendentes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON public.inscricoes_pendentes(status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_subdominio ON public.inscricoes_pendentes(subdominio_solicitado);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_inscricoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inscricoes_pendentes_updated_at
  BEFORE UPDATE ON public.inscricoes_pendentes
  FOR EACH ROW
  EXECUTE FUNCTION update_inscricoes_updated_at();