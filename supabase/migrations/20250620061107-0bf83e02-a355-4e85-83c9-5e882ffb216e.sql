
-- Criar tabela para configurações da clínica
CREATE TABLE public.configuracoes_clinica (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  codigo_acesso_admin TEXT NOT NULL DEFAULT 'admin2024',
  codigo_acesso_clinica TEXT NOT NULL DEFAULT 'clinica2024',
  codigo_acesso_funcionario TEXT NOT NULL DEFAULT 'funcionario2024',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinica_id)
);

-- Comentários para documentação
COMMENT ON TABLE public.configuracoes_clinica IS 'Tabela para armazenar configurações de segurança da clínica';
COMMENT ON COLUMN public.configuracoes_clinica.clinica_id IS 'ID da clínica (sempre o UUID fixo)';
COMMENT ON COLUMN public.configuracoes_clinica.codigo_acesso_admin IS 'Código de acesso ao painel administrativo';
COMMENT ON COLUMN public.configuracoes_clinica.codigo_acesso_clinica IS 'Código de acesso ao painel da clínica';
COMMENT ON COLUMN public.configuracoes_clinica.codigo_acesso_funcionario IS 'Código de acesso ao painel dos funcionários';

-- Inserir configuração padrão
INSERT INTO public.configuracoes_clinica (
  clinica_id,
  codigo_acesso_admin,
  codigo_acesso_clinica,
  codigo_acesso_funcionario
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin2024',
  'clinica2024',
  'funcionario2024'
) ON CONFLICT (clinica_id) DO NOTHING;
