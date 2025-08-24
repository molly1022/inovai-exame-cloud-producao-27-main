-- CORREÇÃO ARQUITETURA DATABASE-PER-TENANT (Corrigido)
-- Criar tabelas administrativas no banco central (atual)

-- 1. Tabela central de clínicas
CREATE TABLE IF NOT EXISTS public.clinicas_central (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clinica TEXT NOT NULL,
  cnpj TEXT,
  email_responsavel TEXT NOT NULL,
  telefone TEXT,
  subdominio TEXT NOT NULL,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(subdominio),
  UNIQUE(email_responsavel)
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(clinica_central_id)
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
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.clinicas_central WHERE subdominio = 'clinica-1') THEN
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
    );
  END IF;
END $$;

-- 5. Criar registro de monitoramento para a primeira clínica
DO $$
DECLARE
  clinica_id UUID;
BEGIN
  SELECT id INTO clinica_id FROM public.clinicas_central WHERE subdominio = 'clinica-1';
  
  IF clinica_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.database_connections_monitor WHERE clinica_central_id = clinica_id) THEN
    INSERT INTO public.database_connections_monitor (
      clinica_central_id,
      database_name,
      status,
      health_status,
      performance_metrics
    ) VALUES (
      clinica_id,
      'tgydssyqgmifcuajacgo',
      'active',
      'healthy',
      jsonb_build_object(
        'initial_setup', true,
        'database_size_mb', 0,
        'created_at', now()
      )
    );
  END IF;
END $$;

-- 6. Políticas RLS para as tabelas administrativas
ALTER TABLE public.clinicas_central ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_connections_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_operacoes_log ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Admins podem gerenciar clínicas centrais" ON public.clinicas_central;
DROP POLICY IF EXISTS "Admins podem gerenciar monitoramento" ON public.database_connections_monitor;
DROP POLICY IF EXISTS "Admins podem gerenciar logs" ON public.admin_operacoes_log;

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