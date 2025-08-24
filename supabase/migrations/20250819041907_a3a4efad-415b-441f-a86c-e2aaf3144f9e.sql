-- Sistema Central de Controle - Migração para Database-per-Tenant (Corrigido)

-- Tabela central para registrar todas as clínicas do sistema
CREATE TABLE IF NOT EXISTS public.clinicas_central (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clinica TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email_responsavel TEXT NOT NULL,
  telefone TEXT,
  subdominio TEXT UNIQUE NOT NULL,
  database_name TEXT UNIQUE NOT NULL,
  database_host TEXT DEFAULT 'localhost',
  database_port INTEGER DEFAULT 5432,
  database_user TEXT NOT NULL,
  database_password_encrypted TEXT NOT NULL,
  ssl_certificate_url TEXT,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'suspensa', 'cancelada')),
  plano_contratado TEXT NOT NULL DEFAULT 'basico',
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_suspensao TIMESTAMP WITH TIME ZONE,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para log de operações administrativas
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

-- Habilitar RLS
ALTER TABLE public.clinicas_central ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_operacoes_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para acesso administrativo completo
CREATE POLICY "Admins têm acesso total às clínicas centrais" 
ON public.clinicas_central 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins têm acesso total aos logs de operações" 
ON public.admin_operacoes_log 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clinicas_central_subdominio ON public.clinicas_central(subdominio);
CREATE INDEX IF NOT EXISTS idx_clinicas_central_status ON public.clinicas_central(status);
CREATE INDEX IF NOT EXISTS idx_clinicas_central_database_name ON public.clinicas_central(database_name);

-- Função para criar nova clínica com banco de dados
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
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clinica_id UUID;
  v_database_name TEXT;
  v_database_user TEXT;
  v_database_password TEXT;
BEGIN
  -- Gerar nomes únicos
  v_clinica_id := gen_random_uuid();
  v_database_name := 'clinica_' || lower(replace(p_subdominio, '-', '_'));
  v_database_user := 'user_' || substring(v_clinica_id::text, 1, 8);
  v_database_password := generate_secure_password(16);
  
  -- Validar subdomínio único
  IF EXISTS (SELECT 1 FROM public.clinicas_central WHERE subdominio = p_subdominio) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Subdomínio já existe'::TEXT;
    RETURN;
  END IF;
  
  -- Inserir nova clínica
  INSERT INTO public.clinicas_central (
    id, nome_clinica, cnpj, email_responsavel, telefone,
    subdominio, database_name, database_user, database_password_encrypted, plano_contratado
  ) VALUES (
    v_clinica_id, p_nome_clinica, p_cnpj, p_email_responsavel, p_telefone,
    p_subdominio, v_database_name, v_database_user, crypt(v_database_password, gen_salt('bf'))::text, p_plano_contratado
  );
  
  -- Log da operação
  INSERT INTO public.admin_operacoes_log (
    admin_user_id, operacao, clinica_central_id, detalhes, sucesso
  ) VALUES (
    COALESCE(p_admin_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    'CRIAR_CLINICA_DATABASE',
    v_clinica_id,
    jsonb_build_object(
      'nome_clinica', p_nome_clinica,
      'subdominio', p_subdominio,
      'database_name', v_database_name,
      'plano', p_plano_contratado
    ),
    true
  );
  
  RETURN QUERY SELECT true, v_clinica_id, v_database_name, 'Clínica criada com sucesso'::TEXT;
END;
$$;