-- ===================================================================
-- MIGRAÇÃO PARA BANCO ADMINISTRATIVO CENTRAL
-- Database: tgydssyqgmifcuajacgo.supabase.co
-- 
-- Esta migração cria todas as tabelas administrativas no banco central
-- separando completamente a administração das operações das clínicas
-- ===================================================================

-- 1. TABELA CENTRAL DE CLÍNICAS
-- Registro master de todas as clínicas no sistema
CREATE TABLE IF NOT EXISTS public.clinicas_central (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clinica TEXT NOT NULL,
  cnpj TEXT,
  email_responsavel TEXT NOT NULL,
  telefone TEXT,
  subdominio TEXT NOT NULL UNIQUE,
  
  -- Configurações do banco específico da clínica
  database_name TEXT NOT NULL,
  database_user TEXT NOT NULL,
  database_password_encrypted TEXT NOT NULL,
  database_host TEXT DEFAULT 'localhost',
  database_port INTEGER DEFAULT 5432,
  database_url TEXT,
  database_created BOOLEAN DEFAULT false,
  
  -- Configurações operacionais
  plano_contratado TEXT NOT NULL DEFAULT 'basico',
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'suspensa', 'cancelada', 'pendente')),
  
  -- Configurações avançadas
  max_connections INTEGER DEFAULT 20,
  backup_enabled BOOLEAN DEFAULT true,
  backup_schedule TEXT DEFAULT 'daily',
  maintenance_window TEXT DEFAULT '02:00-04:00',
  ssl_certificate_url TEXT,
  schema_version TEXT DEFAULT '1.0.0',
  connection_string_template TEXT,
  
  -- Timestamps e metadados
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_suspensao TIMESTAMP WITH TIME ZONE,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. TABELA DE CLÍNICAS INOVAI
-- Informações básicas para novas clínicas em processo
CREATE TABLE IF NOT EXISTS public.clinicas_inovai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cnpj TEXT,
  endereco TEXT,
  subdominio TEXT NOT NULL UNIQUE,
  plano TEXT NOT NULL DEFAULT 'basico',
  valor_plano NUMERIC(10,2) DEFAULT 0.00,
  data_contratacao DATE DEFAULT CURRENT_DATE,
  responsavel_comercial TEXT,
  status_implementacao TEXT DEFAULT 'pendente' CHECK (status_implementacao IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. MONITORAMENTO DE CONEXÕES COM BANCOS
CREATE TABLE IF NOT EXISTS public.database_connections_monitor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_central_id UUID NOT NULL REFERENCES public.clinicas_central(id) ON DELETE CASCADE,
  database_name TEXT NOT NULL,
  connection_count INTEGER DEFAULT 0,
  active_connections INTEGER DEFAULT 0,
  max_connections_reached INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
  health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'warning', 'critical', 'unknown')),
  query_performance_avg NUMERIC(10,4) DEFAULT 0.0,
  database_size_bytes BIGINT DEFAULT 0,
  last_backup_at TIMESTAMP WITH TIME ZONE,
  backup_status TEXT DEFAULT 'unknown' CHECK (backup_status IN ('success', 'failed', 'in_progress', 'unknown')),
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. LOG DE OPERAÇÕES ADMINISTRATIVAS
CREATE TABLE IF NOT EXISTS public.admin_operacoes_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  operacao TEXT NOT NULL,
  clinica_central_id UUID REFERENCES public.clinicas_central(id),
  detalhes JSONB,
  sucesso BOOLEAN NOT NULL DEFAULT true,
  erro_mensagem TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. CONFIGURAÇÕES CENTRAIS DO SISTEMA
CREATE TABLE IF NOT EXISTS public.configuracoes_sistema_central (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'geral',
  descricao TEXT,
  editavel BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===================================================================
-- ÍNDICES PARA PERFORMANCE
-- ===================================================================

-- Índices para clinicas_central
CREATE INDEX IF NOT EXISTS idx_clinicas_central_subdominio ON public.clinicas_central(subdominio);
CREATE INDEX IF NOT EXISTS idx_clinicas_central_email ON public.clinicas_central(email_responsavel);
CREATE INDEX IF NOT EXISTS idx_clinicas_central_status ON public.clinicas_central(status);
CREATE INDEX IF NOT EXISTS idx_clinicas_central_plano ON public.clinicas_central(plano_contratado);

-- Índices para clinicas_inovai
CREATE INDEX IF NOT EXISTS idx_clinicas_inovai_subdominio ON public.clinicas_inovai(subdominio);
CREATE INDEX IF NOT EXISTS idx_clinicas_inovai_email ON public.clinicas_inovai(email);
CREATE INDEX IF NOT EXISTS idx_clinicas_inovai_status ON public.clinicas_inovai(status_implementacao);

-- Índices para monitoramento
CREATE INDEX IF NOT EXISTS idx_db_monitor_clinica ON public.database_connections_monitor(clinica_central_id);
CREATE INDEX IF NOT EXISTS idx_db_monitor_status ON public.database_connections_monitor(status);
CREATE INDEX IF NOT EXISTS idx_db_monitor_health ON public.database_connections_monitor(health_status);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user ON public.admin_operacoes_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_clinica ON public.admin_operacoes_log(clinica_central_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_operacao ON public.admin_operacoes_log(operacao);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_operacoes_log(created_at);

-- ===================================================================
-- RLS POLICIES - SEGURANÇA ADMINISTRATIVA
-- ===================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.clinicas_central ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicas_inovai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_connections_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_operacoes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_sistema_central ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores - acesso total
CREATE POLICY "Admins têm acesso total às clínicas centrais"
  ON public.clinicas_central FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins têm acesso total às clínicas Inovai"
  ON public.clinicas_inovai FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Monitor conexões admin access"
  ON public.database_connections_monitor FOR ALL
  USING (true);

CREATE POLICY "Admins têm acesso total aos logs de operações"
  ON public.admin_operacoes_log FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar configurações"
  ON public.configuracoes_sistema_central FOR ALL
  USING (true);

-- ===================================================================
-- TRIGGERS E FUNÇÕES
-- ===================================================================

-- Trigger para updated_at em clinicas_central
CREATE OR REPLACE FUNCTION update_clinicas_central_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_clinicas_central_updated_at
  BEFORE UPDATE ON public.clinicas_central
  FOR EACH ROW EXECUTE FUNCTION update_clinicas_central_updated_at();

-- Trigger para updated_at em clinicas_inovai  
CREATE TRIGGER trigger_update_clinicas_inovai_updated_at
  BEFORE UPDATE ON public.clinicas_inovai
  FOR EACH ROW EXECUTE FUNCTION update_clinicas_inovai_updated_at();

-- Trigger para updated_at em database_connections_monitor
CREATE OR REPLACE FUNCTION update_db_monitor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_db_monitor_updated_at
  BEFORE UPDATE ON public.database_connections_monitor
  FOR EACH ROW EXECUTE FUNCTION update_db_monitor_updated_at();

-- ===================================================================
-- FUNÇÃO PARA CRIAR CLÍNICA COM DATABASE - VERSÃO CENTRAL
-- ===================================================================

CREATE OR REPLACE FUNCTION public.criar_clinica_com_database(
  p_nome_clinica TEXT,
  p_email_responsavel TEXT, 
  p_subdominio TEXT,
  p_cnpj TEXT DEFAULT NULL,
  p_telefone TEXT DEFAULT NULL,
  p_plano_contratado TEXT DEFAULT 'basico',
  p_admin_user_id UUID DEFAULT NULL
)
RETURNS TABLE(sucesso BOOLEAN, clinica_id UUID, database_name TEXT, mensagem TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_clinica_id UUID;
  v_database_name TEXT;
  v_database_user TEXT;
  v_database_password TEXT;
BEGIN
  -- Gerar IDs únicos
  v_clinica_id := gen_random_uuid();
  v_database_name := 'clinica_' || lower(replace(p_subdominio, '-', '_'));
  v_database_user := 'user_' || substring(v_clinica_id::text, 1, 8);
  v_database_password := generate_secure_password(16);
  
  -- Validar subdomínio único
  IF EXISTS (SELECT 1 FROM public.clinicas_central WHERE subdominio = p_subdominio) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Subdomínio já existe'::TEXT;
    RETURN;
  END IF;
  
  -- Validar email único
  IF EXISTS (SELECT 1 FROM public.clinicas_central WHERE email_responsavel = p_email_responsavel) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Email já cadastrado'::TEXT;
    RETURN;
  END IF;
  
  -- Inserir nova clínica no sistema central
  INSERT INTO public.clinicas_central (
    id, nome_clinica, cnpj, email_responsavel, telefone, subdominio, 
    database_name, database_user, database_password_encrypted, 
    plano_contratado, status
  ) VALUES (
    v_clinica_id, p_nome_clinica, p_cnpj, p_email_responsavel, p_telefone, p_subdominio, 
    v_database_name, v_database_user, crypt(v_database_password, gen_salt('bf'))::text, 
    p_plano_contratado, 'ativa'
  );
  
  -- Criar registro de monitoramento
  INSERT INTO public.database_connections_monitor (
    clinica_central_id, database_name, connection_count, status, performance_metrics
  ) VALUES (
    v_clinica_id, v_database_name, 0, 'created', 
    jsonb_build_object('created_at', now(), 'initial_setup', true, 'database_size_mb', 0)
  );
  
  -- Log da operação
  INSERT INTO public.admin_operacoes_log (
    admin_user_id, operacao, clinica_central_id, detalhes, sucesso
  ) VALUES (
    COALESCE(p_admin_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    'CRIAR_CLINICA_DATABASE', v_clinica_id,
    jsonb_build_object(
      'nome_clinica', p_nome_clinica, 'subdominio', p_subdominio,
      'database_name', v_database_name, 'plano', p_plano_contratado,
      'email_responsavel', p_email_responsavel
    ), true
  );
  
  RETURN QUERY SELECT true, v_clinica_id, v_database_name, 'Clínica criada com sucesso. Database configurado.'::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  -- Log de erro
  INSERT INTO public.admin_operacoes_log (
    admin_user_id, operacao, clinica_central_id, detalhes, sucesso, erro_mensagem
  ) VALUES (
    COALESCE(p_admin_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    'CRIAR_CLINICA_DATABASE_ERROR', v_clinica_id,
    jsonb_build_object('nome_clinica', p_nome_clinica, 'subdominio', p_subdominio, 'erro', SQLERRM),
    false, SQLERRM
  );
  
  RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, ('Erro ao criar clínica: ' || SQLERRM)::TEXT;
END;
$$;

-- ===================================================================
-- FUNÇÃO PARA LISTAR CLÍNICAS COM ESTATÍSTICAS
-- ===================================================================

CREATE OR REPLACE FUNCTION public.get_clinicas_with_stats()
RETURNS TABLE(
  id UUID, nome_clinica TEXT, subdominio TEXT, database_name TEXT, 
  status TEXT, plano_contratado TEXT, email_responsavel TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE, ultimo_acesso TIMESTAMP WITH TIME ZONE,
  connection_count INTEGER, database_size_mb NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.id, cc.nome_clinica, cc.subdominio, cc.database_name,
    cc.status, cc.plano_contratado, cc.email_responsavel,
    cc.data_criacao, cc.ultimo_acesso,
    COALESCE(dcm.connection_count, 0) as connection_count,
    COALESCE((dcm.performance_metrics->>'database_size_mb')::numeric, 0) as database_size_mb
  FROM public.clinicas_central cc
  LEFT JOIN public.database_connections_monitor dcm ON cc.id = dcm.clinica_central_id
  ORDER BY cc.data_criacao DESC;
END;
$$;

-- ===================================================================
-- INSERIR CONFIGURAÇÕES PADRÃO DO SISTEMA
-- ===================================================================

INSERT INTO public.configuracoes_sistema_central (chave, valor, categoria, descricao) VALUES
  ('sistema.versao', '2.0.0', 'sistema', 'Versão atual do sistema multi-tenant'),
  ('database.max_connections_default', '20', 'database', 'Número máximo padrão de conexões por banco'),
  ('backup.schedule_default', 'daily', 'backup', 'Cronograma padrão de backup'),
  ('maintenance.window_default', '02:00-04:00', 'maintenance', 'Janela de manutenção padrão'),
  ('planos.basico.limite_medicos', '5', 'planos', 'Limite de médicos para plano básico'),
  ('planos.basico.limite_funcionarios', '4', 'planos', 'Limite de funcionários para plano básico')
ON CONFLICT (chave) DO NOTHING;

-- ===================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ===================================================================

COMMENT ON TABLE public.clinicas_central IS 'Registro central de todas as clínicas no sistema multi-tenant';
COMMENT ON TABLE public.clinicas_inovai IS 'Informações básicas de novas clínicas em processo de implementação';
COMMENT ON TABLE public.database_connections_monitor IS 'Monitoramento de performance e saúde dos bancos das clínicas';
COMMENT ON TABLE public.admin_operacoes_log IS 'Log de todas as operações administrativas do sistema';
COMMENT ON TABLE public.configuracoes_sistema_central IS 'Configurações globais do sistema multi-tenant';

COMMENT ON COLUMN public.clinicas_central.database_name IS 'Nome do banco de dados específico da clínica';
COMMENT ON COLUMN public.clinicas_central.database_created IS 'Flag indicando se o banco físico foi criado';
COMMENT ON COLUMN public.clinicas_central.status IS 'Status operacional da clínica (ativa, suspensa, cancelada, pendente)';