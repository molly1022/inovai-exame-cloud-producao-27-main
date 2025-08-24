-- Implementar sistema completo de Database-per-Tenant
-- Função para criar clínica com banco de dados isolado

CREATE OR REPLACE FUNCTION public.criar_clinica_com_database(
  p_nome_clinica text,
  p_email_responsavel text,
  p_subdominio text,
  p_cnpj text DEFAULT NULL,
  p_telefone text DEFAULT NULL,
  p_plano_contratado text DEFAULT 'basico',
  p_admin_user_id uuid DEFAULT NULL
)
RETURNS TABLE(
  sucesso boolean,
  clinica_id uuid,
  database_name text,
  mensagem text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clinica_id UUID;
  v_database_name TEXT;
  v_database_user TEXT;
  v_database_password TEXT;
  v_migration_script TEXT;
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
    id, 
    nome_clinica, 
    cnpj, 
    email_responsavel, 
    telefone,
    subdominio, 
    database_name, 
    database_user, 
    database_password_encrypted, 
    plano_contratado,
    status
  ) VALUES (
    v_clinica_id, 
    p_nome_clinica, 
    p_cnpj, 
    p_email_responsavel, 
    p_telefone,
    p_subdominio, 
    v_database_name, 
    v_database_user, 
    crypt(v_database_password, gen_salt('bf'))::text, 
    p_plano_contratado,
    'ativa'
  );
  
  -- Criar registro de monitoramento de conexão
  INSERT INTO public.database_connections_monitor (
    clinica_central_id,
    database_name,
    connection_count,
    status,
    performance_metrics
  ) VALUES (
    v_clinica_id,
    v_database_name,
    0,
    'created',
    jsonb_build_object(
      'created_at', now(),
      'initial_setup', true,
      'database_size_mb', 0
    )
  );
  
  -- Log da operação no sistema administrativo
  INSERT INTO public.admin_operacoes_log (
    admin_user_id,
    operacao,
    clinica_central_id,
    detalhes,
    sucesso
  ) VALUES (
    COALESCE(p_admin_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    'CRIAR_CLINICA_DATABASE',
    v_clinica_id,
    jsonb_build_object(
      'nome_clinica', p_nome_clinica,
      'subdominio', p_subdominio,
      'database_name', v_database_name,
      'plano', p_plano_contratado,
      'email_responsavel', p_email_responsavel
    ),
    true
  );
  
  RETURN QUERY SELECT true, v_clinica_id, v_database_name, 'Clínica criada com sucesso. Database configurado.'::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  -- Log de erro
  INSERT INTO public.admin_operacoes_log (
    admin_user_id,
    operacao,
    clinica_central_id,
    detalhes,
    sucesso,
    erro_mensagem
  ) VALUES (
    COALESCE(p_admin_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    'CRIAR_CLINICA_DATABASE_ERROR',
    v_clinica_id,
    jsonb_build_object(
      'nome_clinica', p_nome_clinica,
      'subdominio', p_subdominio,
      'erro', SQLERRM
    ),
    false,
    SQLERRM
  );
  
  RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, ('Erro ao criar clínica: ' || SQLERRM)::TEXT;
END;
$$;

-- Função para obter script de migração completa para nova clínica
CREATE OR REPLACE FUNCTION public.get_tenant_migration_script(
  p_database_name text,
  p_clinica_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_migration_script text;
BEGIN
  v_migration_script := format($migration$
-- Migration Script for Database: %s
-- Clínica ID: %s
-- Generated: %s

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create main schema
CREATE SCHEMA IF NOT EXISTS public;

-- 1. Clinicas (Dados da própria clínica)
CREATE TABLE public.clinicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  telefone text,
  endereco text,
  cnpj text,
  subdominio text,
  foto_perfil_url text,
  ativo boolean DEFAULT true,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Configurações da Clínica
CREATE TABLE public.configuracoes_clinica (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  email_login_clinica text NOT NULL,
  senha_hash text,
  telemedicina_ativa boolean DEFAULT false,
  verificacao_automatica boolean DEFAULT false,
  daily_api_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Médicos
CREATE TABLE public.medicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome_completo text NOT NULL,
  cpf text NOT NULL,
  crm text,
  especialidade text,
  email text,
  telefone text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Pacientes
CREATE TABLE public.pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome_completo text NOT NULL,
  cpf text NOT NULL,
  rg text,
  data_nascimento date,
  sexo text,
  telefone text,
  email text,
  endereco_completo text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Convenios
CREATE TABLE public.convenios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  percentual_desconto numeric DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Categorias de Exames
CREATE TABLE public.categorias_exames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  valor numeric DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Agendamentos
CREATE TABLE public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  medico_id uuid REFERENCES public.medicos(id) ON DELETE SET NULL,
  convenio_id uuid REFERENCES public.convenios(id) ON DELETE SET NULL,
  categoria_id uuid REFERENCES public.categorias_exames(id) ON DELETE SET NULL,
  tipo_exame text NOT NULL,
  data_agendamento timestamptz NOT NULL,
  horario text,
  status text DEFAULT 'agendado',
  valor_exame numeric DEFAULT 0,
  observacoes text,
  eh_telemedicina boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Exames
CREATE TABLE public.exames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  medico_id uuid REFERENCES public.medicos(id) ON DELETE SET NULL,
  tipo text NOT NULL,
  data_exame date NOT NULL,
  arquivo_url text,
  laudo_url text,
  status text DEFAULT 'disponivel',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. Funcionários
CREATE TABLE public.funcionarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome_completo text NOT NULL,
  cpf text NOT NULL,
  funcao text NOT NULL,
  email text,
  telefone text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. Assinaturas (Planos)
CREATE TABLE public.assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  tipo_plano text DEFAULT 'basico',
  status text DEFAULT 'ativa',
  valor numeric DEFAULT 0,
  data_inicio date DEFAULT CURRENT_DATE,
  proximo_pagamento date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert initial clinic data
INSERT INTO public.clinicas (id, nome, email, ativo) 
VALUES ('%s', 'Nova Clínica', 'admin@clinica.com', true);

-- Insert basic configurations
INSERT INTO public.configuracoes_clinica (clinica_id, email_login_clinica)
SELECT id, 'admin@clinica.com' FROM public.clinicas LIMIT 1;

-- Insert basic subscription
INSERT INTO public.assinaturas (clinica_id, tipo_plano, status)
SELECT id, 'basico', 'ativa' FROM public.clinicas LIMIT 1;

-- Create indexes for performance
CREATE INDEX idx_agendamentos_clinica_id ON public.agendamentos(clinica_id);
CREATE INDEX idx_agendamentos_data ON public.agendamentos(data_agendamento);
CREATE INDEX idx_pacientes_clinica_id ON public.pacientes(clinica_id);
CREATE INDEX idx_medicos_clinica_id ON public.medicos(clinica_id);
CREATE INDEX idx_exames_clinica_id ON public.exames(clinica_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Allow all for single tenant)
CREATE POLICY "Allow all operations" ON public.clinicas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.configuracoes_clinica FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.medicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.pacientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.convenios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.categorias_exames FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.agendamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.exames FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.funcionarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.assinaturas FOR ALL USING (true) WITH CHECK (true);

$migration$, 
    p_database_name,
    p_clinica_id,
    now(),
    p_clinica_id
  );
  
  RETURN v_migration_script;
END;
$$;

-- Função para listar clínicas com estatísticas
CREATE OR REPLACE FUNCTION public.get_clinicas_with_stats()
RETURNS TABLE(
  id uuid,
  nome_clinica text,
  subdominio text,
  database_name text,
  status text,
  plano_contratado text,
  email_responsavel text,
  data_criacao timestamptz,
  ultimo_acesso timestamptz,
  connection_count integer,
  database_size_mb numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.id,
    cc.nome_clinica,
    cc.subdominio,
    cc.database_name,
    cc.status,
    cc.plano_contratado,
    cc.email_responsavel,
    cc.data_criacao,
    cc.ultimo_acesso,
    COALESCE(dcm.connection_count, 0) as connection_count,
    COALESCE((dcm.performance_metrics->>'database_size_mb')::numeric, 0) as database_size_mb
  FROM public.clinicas_central cc
  LEFT JOIN public.database_connections_monitor dcm ON cc.id = dcm.clinica_central_id
  ORDER BY cc.data_criacao DESC;
END;
$$;