
-- Adicionar campo senha_acesso na tabela medicos
ALTER TABLE public.medicos ADD COLUMN senha_acesso TEXT;

-- Criar tabela para login dos médicos
CREATE TABLE public.medicos_login (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medico_id UUID NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
  cpf TEXT NOT NULL,
  senha TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(medico_id),
  UNIQUE(cpf)
);

-- Comentários para documentação
COMMENT ON TABLE public.medicos_login IS 'Tabela para armazenar credenciais de login dos médicos';
COMMENT ON COLUMN public.medicos_login.medico_id IS 'Referência ao médico na tabela médicos';
COMMENT ON COLUMN public.medicos_login.cpf IS 'CPF usado como login do médico';
COMMENT ON COLUMN public.medicos_login.senha IS 'Senha de acesso do médico';

-- Índices para melhor performance
CREATE INDEX idx_medicos_login_cpf ON public.medicos_login(cpf);
CREATE INDEX idx_medicos_login_medico_id ON public.medicos_login(medico_id);

-- Criar tabela para sessões dos médicos
CREATE TABLE public.medicos_sessoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medico_id UUID NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
  clinica_id UUID NOT NULL,
  login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logout_at TIMESTAMP WITH TIME ZONE,
  ativa BOOLEAN NOT NULL DEFAULT true,
  duracao_sessao TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comentários para documentação
COMMENT ON TABLE public.medicos_sessoes IS 'Tabela para rastrear sessões dos médicos';
COMMENT ON COLUMN public.medicos_sessoes.medico_id IS 'ID do médico logado';
COMMENT ON COLUMN public.medicos_sessoes.clinica_id IS 'ID da clínica do médico';
COMMENT ON COLUMN public.medicos_sessoes.ativa IS 'Se a sessão está ativa';

-- Criar tabela para logs de acesso dos médicos
CREATE TABLE public.medicos_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medico_id UUID NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
  clinica_id UUID NOT NULL,
  acao TEXT NOT NULL,
  descricao TEXT,
  tabela_afetada TEXT,
  registro_id UUID,
  detalhes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comentários para documentação
COMMENT ON TABLE public.medicos_logs IS 'Tabela para logs de ações dos médicos';
COMMENT ON COLUMN public.medicos_logs.medico_id IS 'ID do médico que realizou a ação';
COMMENT ON COLUMN public.medicos_logs.acao IS 'Tipo de ação realizada';
COMMENT ON COLUMN public.medicos_logs.descricao IS 'Descrição da ação';

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.medicos_login ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permissivas para funcionamento inicial)
CREATE POLICY "Allow all operations on medicos_login" ON public.medicos_login FOR ALL USING (true);
CREATE POLICY "Allow all operations on medicos_sessoes" ON public.medicos_sessoes FOR ALL USING (true);
CREATE POLICY "Allow all operations on medicos_logs" ON public.medicos_logs FOR ALL USING (true);
