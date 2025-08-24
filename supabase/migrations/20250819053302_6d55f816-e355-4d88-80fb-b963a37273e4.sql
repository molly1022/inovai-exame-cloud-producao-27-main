-- Criar tabela clinicas_inovai para gerenciar informações básicas de novas clínicas
CREATE TABLE public.clinicas_inovai (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  cnpj TEXT,
  endereco TEXT,
  subdominio TEXT NOT NULL UNIQUE,
  plano TEXT NOT NULL DEFAULT 'basico',
  ativo BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  data_contratacao DATE DEFAULT CURRENT_DATE,
  valor_plano NUMERIC(10,2) DEFAULT 0.00,
  responsavel_comercial TEXT,
  status_implementacao TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para otimizar consultas
CREATE INDEX idx_clinicas_inovai_subdominio ON public.clinicas_inovai(subdominio);
CREATE INDEX idx_clinicas_inovai_email ON public.clinicas_inovai(email);
CREATE INDEX idx_clinicas_inovai_ativo ON public.clinicas_inovai(ativo);
CREATE INDEX idx_clinicas_inovai_plano ON public.clinicas_inovai(plano);

-- Habilitar RLS
ALTER TABLE public.clinicas_inovai ENABLE ROW LEVEL SECURITY;

-- Política para administradores terem acesso total
CREATE POLICY "Admins têm acesso total às clínicas Inovai" 
ON public.clinicas_inovai 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_clinicas_inovai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_clinicas_inovai_updated_at
  BEFORE UPDATE ON public.clinicas_inovai
  FOR EACH ROW
  EXECUTE FUNCTION public.update_clinicas_inovai_updated_at();

-- Validação para garantir que subdomínio seja válido
ALTER TABLE public.clinicas_inovai 
ADD CONSTRAINT check_subdominio_valido 
CHECK (subdominio ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' AND LENGTH(subdominio) >= 3 AND LENGTH(subdominio) <= 63);

-- Validação para garantir que email seja válido
ALTER TABLE public.clinicas_inovai 
ADD CONSTRAINT check_email_valido 
CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Comentários nas colunas para documentação
COMMENT ON TABLE public.clinicas_inovai IS 'Tabela para gerenciar informações básicas de novas clínicas da Inovai';
COMMENT ON COLUMN public.clinicas_inovai.nome IS 'Nome da clínica';
COMMENT ON COLUMN public.clinicas_inovai.email IS 'Email de contato da clínica (único)';
COMMENT ON COLUMN public.clinicas_inovai.subdominio IS 'Subdomínio único da clínica';
COMMENT ON COLUMN public.clinicas_inovai.plano IS 'Plano contratado (basico, intermediario, avancado)';
COMMENT ON COLUMN public.clinicas_inovai.ativo IS 'Status ativo/inativo da clínica';
COMMENT ON COLUMN public.clinicas_inovai.status_implementacao IS 'Status da implementação (pendente, em_andamento, concluida)';
COMMENT ON COLUMN public.clinicas_inovai.valor_plano IS 'Valor mensal do plano contratado';