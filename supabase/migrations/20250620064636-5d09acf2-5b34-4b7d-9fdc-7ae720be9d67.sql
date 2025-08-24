
-- Criar tabela para logs de auditoria dos funcionários
CREATE TABLE public.funcionarios_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID NOT NULL,
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  acao TEXT NOT NULL,
  descricao TEXT,
  detalhes JSONB,
  tabela_afetada TEXT,
  registro_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_funcionarios_logs_funcionario_id ON public.funcionarios_logs(funcionario_id);
CREATE INDEX idx_funcionarios_logs_clinica_id ON public.funcionarios_logs(clinica_id);
CREATE INDEX idx_funcionarios_logs_acao ON public.funcionarios_logs(acao);
CREATE INDEX idx_funcionarios_logs_created_at ON public.funcionarios_logs(created_at);

-- Adicionar foreign key para funcionários
ALTER TABLE public.funcionarios_logs 
ADD CONSTRAINT fk_funcionarios_logs_funcionario 
FOREIGN KEY (funcionario_id) REFERENCES public.funcionarios(id) ON DELETE CASCADE;

-- Habilitar Row Level Security
ALTER TABLE public.funcionarios_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que funcionários vejam apenas seus próprios logs
CREATE POLICY "Funcionarios podem ver seus proprios logs" 
ON public.funcionarios_logs 
FOR SELECT 
USING (true); -- Por enquanto permitir acesso total, será refinado depois

-- Política para inserção de logs
CREATE POLICY "Permitir inserção de logs" 
ON public.funcionarios_logs 
FOR INSERT 
WITH CHECK (true);

-- Criar tabela para controle de sessões dos funcionários
CREATE TABLE public.funcionarios_sessoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID NOT NULL,
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logout_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  duracao_sessao INTERVAL GENERATED ALWAYS AS (logout_at - login_at) STORED,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para sessões
CREATE INDEX idx_funcionarios_sessoes_funcionario_id ON public.funcionarios_sessoes(funcionario_id);
CREATE INDEX idx_funcionarios_sessoes_ativa ON public.funcionarios_sessoes(ativa);
CREATE INDEX idx_funcionarios_sessoes_login_at ON public.funcionarios_sessoes(login_at);

-- Adicionar foreign key para sessões
ALTER TABLE public.funcionarios_sessoes 
ADD CONSTRAINT fk_funcionarios_sessoes_funcionario 
FOREIGN KEY (funcionario_id) REFERENCES public.funcionarios(id) ON DELETE CASCADE;

-- Habilitar RLS para sessões
ALTER TABLE public.funcionarios_sessoes ENABLE ROW LEVEL SECURITY;

-- Política para sessões
CREATE POLICY "Permitir acesso a sessoes" 
ON public.funcionarios_sessoes 
FOR ALL 
USING (true);
