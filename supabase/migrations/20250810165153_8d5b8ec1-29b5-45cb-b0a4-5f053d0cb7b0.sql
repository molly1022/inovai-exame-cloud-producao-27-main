-- CORREÇÃO: Remover restrições NOT NULL de campos sensíveis e limpar dados
-- Tornar campos opcionais para permitir remoção de dados sensíveis

-- Remover restrições NOT NULL de campos que contêm dados sensíveis
ALTER TABLE public.configuracoes_clinica 
  ALTER COLUMN senha_acesso_clinica DROP NOT NULL,
  ALTER COLUMN codigo_acesso_admin DROP NOT NULL,
  ALTER COLUMN codigo_acesso_clinica DROP NOT NULL,
  ALTER COLUMN codigo_acesso_funcionario DROP NOT NULL;

-- Agora limpar os dados sensíveis expostos
UPDATE public.configuracoes_clinica 
SET senha_acesso_clinica = NULL,
    codigo_acesso_admin = NULL,
    codigo_acesso_clinica = NULL, 
    codigo_acesso_funcionario = NULL,
    daily_api_key = NULL,
    daily_webhook_secret = NULL;

-- Adicionar comentários de segurança
COMMENT ON COLUMN public.configuracoes_clinica.daily_api_key IS 'Daily.co API key - DEVE ser configurada via Supabase Secrets, nunca hardcoded';
COMMENT ON COLUMN public.configuracoes_clinica.senha_acesso_clinica IS 'DEPRECATED: Usar senha_hash instead';
COMMENT ON COLUMN public.configuracoes_clinica.codigo_acesso_admin IS 'DEPRECATED: Implementar autenticação real';

-- Criar trigger para prevenir inserção de dados sensíveis
CREATE OR REPLACE FUNCTION public.prevent_sensitive_data_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevenir códigos de acesso padrão
  IF NEW.codigo_acesso_admin IN ('admin2024', 'clinica2024', 'funcionario2024') THEN
    RAISE EXCEPTION 'Códigos de acesso padrão não são permitidos por motivos de segurança';
  END IF;
  
  -- Prevenir senhas em texto plano
  IF NEW.senha_acesso_clinica IS NOT NULL AND LENGTH(NEW.senha_acesso_clinica) < 50 THEN
    RAISE EXCEPTION 'Use senha_hash para armazenar senhas, nunca texto plano';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Aplicar trigger
DROP TRIGGER IF EXISTS prevent_sensitive_data_trigger ON public.configuracoes_clinica;
CREATE TRIGGER prevent_sensitive_data_trigger
  BEFORE INSERT OR UPDATE ON public.configuracoes_clinica
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_sensitive_data_insert();

-- Criar tabela de security_logs se não existir
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  clinic_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS para security_logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Policy restritiva para security_logs (apenas sistema)
DROP POLICY IF EXISTS "Security logs admin only" ON public.security_logs;
CREATE POLICY "Security logs admin only" ON public.security_logs
  FOR ALL USING (false);  -- Apenas funções do sistema podem acessar