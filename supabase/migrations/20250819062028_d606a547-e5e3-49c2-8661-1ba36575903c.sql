-- CORREÇÃO ARQUITETURA DATABASE-PER-TENANT
-- Criar tabelas administrativas no banco central (atual)

-- 1. Tabela central de clínicas
CREATE TABLE IF NOT EXISTS public.clinicas_central (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clinica TEXT NOT NULL,
  cnpj TEXT,
  email_responsavel TEXT NOT NULL UNIQUE,
  telefone TEXT,
  subdominio TEXT NOT NULL UNIQUE,
  database_name TEXT NOT NULL,
  database_url TEXT,
  database_user TEXT,
  database_password_encrypted TEXT,
  database_created BOOLEAN DEFAULT false,
  schema_version TEXT DEFAULT '1.0.0',
  plano_contratado TEXT DEFAULT 'basico',
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'suspensa', 'inativa')),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  configuracoes_especiais JSONB DEFAULT '{}',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tabela de monitoramento de conexões
CREATE TABLE IF NOT EXISTS public.database_connections_monitor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_central_id UUID REFERENCES public.clinicas_central(id) ON DELETE CASCADE,
  database_name TEXT NOT NULL,
  connection_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'created')),
  health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'warning', 'critical', 'unknown')),
  active_connections INTEGER DEFAULT 0,
  performance_metrics JSONB DEFAULT '{}',
  error_logs TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Log de operações administrativas
CREATE TABLE IF NOT EXISTS public.admin_operacoes_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID,
  operacao TEXT NOT NULL,
  modulo TEXT DEFAULT 'system',
  clinica_central_id UUID REFERENCES public.clinicas_central(id),
  detalhes JSONB DEFAULT '{}',
  sucesso BOOLEAN DEFAULT true,
  erro_mensagem TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Inserir dados da primeira clínica (clinica-1)
INSERT INTO public.clinicas_central (
  nome_clinica,
  email_responsavel,
  subdominio,
  database_name,
  database_url,
  database_created,
  plano_contratado,
  status
) VALUES (
  'Clínica Memorial (Principal)',
  'admin@clinica-memorial.com',
  'clinica-1',
  'tgydssyqgmifcuajacgo',
  'https://tgydssyqgmifcuajacgo.supabase.co',
  true,
  'premium',
  'ativa'
) ON CONFLICT (subdominio) DO UPDATE SET
  nome_clinica = EXCLUDED.nome_clinica,
  database_url = EXCLUDED.database_url,
  updated_at = now();

-- 5. Criar registro de monitoramento para a primeira clínica
INSERT INTO public.database_connections_monitor (
  clinica_central_id,
  database_name,
  status,
  health_status,
  performance_metrics
) 
SELECT 
  cc.id,
  cc.database_name,
  'active',
  'healthy',
  jsonb_build_object(
    'initial_setup', true,
    'database_size_mb', 0,
    'created_at', now()
  )
FROM public.clinicas_central cc 
WHERE cc.subdominio = 'clinica-1'
ON CONFLICT (clinica_central_id) DO NOTHING;

-- 6. Políticas RLS para as tabelas administrativas
ALTER TABLE public.clinicas_central ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_connections_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_operacoes_log ENABLE ROW LEVEL SECURITY;

-- Política para administradores acessarem tudo
CREATE POLICY "Admins podem gerenciar clínicas centrais"
  ON public.clinicas_central FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar monitoramento"
  ON public.database_connections_monitor FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar logs"
  ON public.admin_operacoes_log FOR ALL
  USING (true)
  WITH CHECK (true);

-- 7. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinicas_central_updated_at
    BEFORE UPDATE ON public.clinicas_central
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_database_connections_monitor_updated_at
    BEFORE UPDATE ON public.database_connections_monitor
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();