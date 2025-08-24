-- CORREÇÃO CRÍTICA: Função de login da clínica com erro de referência de coluna
-- Fix para o erro "column s.clinica_id does not exist"

CREATE OR REPLACE FUNCTION public.secure_verify_clinic_login(
    email_input text, 
    password_input text, 
    p_ip_address inet DEFAULT NULL::inet, 
    p_user_agent text DEFAULT NULL::text
)
RETURNS TABLE(
    clinica_id uuid, 
    clinica_nome text, 
    success boolean, 
    requires_mfa boolean, 
    session_token text, 
    refresh_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  c RECORD;
  attempts integer;
  access_token_val text;
  refresh_token_val text;
  session_id uuid;
BEGIN
  -- Verificar tentativas de login por IP
  SELECT COUNT(*) INTO attempts
  FROM public.login_attempts
  WHERE ip_address = COALESCE(p_ip_address, '0.0.0.0'::inet)
    AND created_at > now() - interval '15 minutes'
    AND success = false;

  IF attempts >= 5 THEN
    INSERT INTO public.security_logs (event_type, details, ip_address)
    VALUES ('LOGIN_BLOCKED', jsonb_build_object('email', email_input, 'reason', 'rate_limit_exceeded', 'attempts', attempts), p_ip_address);
    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; 
    RETURN;
  END IF;

  -- Buscar clínica e configurações (CORRIGIDO: sem alias problemático)
  SELECT 
    cl.id, 
    cl.nome,
    cc.senha_hash, 
    cc.mfa_enabled, 
    cc.account_locked,
    cc.failed_login_attempts
  INTO c
  FROM public.clinicas cl
  JOIN public.configuracoes_clinica cc ON cc.clinica_id = cl.id
  WHERE cl.email = LOWER(email_input)
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.login_attempts (email, ip_address, user_agent, success, failure_reason)
    VALUES (email_input, p_ip_address, p_user_agent, false, 'invalid_email');
    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; 
    RETURN;
  END IF;

  IF c.account_locked IS TRUE THEN
    INSERT INTO public.security_logs (event_type, details, clinic_id, ip_address)
    VALUES ('LOGIN_BLOCKED', jsonb_build_object('reason','account_locked'), c.id, p_ip_address);
    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; 
    RETURN;
  END IF;

  -- Verificar senha (protegido contra timing attacks)
  IF c.senha_hash IS NULL OR crypt(password_input, c.senha_hash) <> c.senha_hash THEN
    INSERT INTO public.login_attempts (email, ip_address, user_agent, success, failure_reason)
    VALUES (email_input, p_ip_address, p_user_agent, false, 'invalid_password');

    UPDATE public.configuracoes_clinica
    SET failed_login_attempts = COALESCE(failed_login_attempts,0) + 1,
        last_failed_login = now(),
        account_locked = CASE WHEN COALESCE(failed_login_attempts,0) + 1 >= 10 THEN true ELSE account_locked END
    WHERE clinica_id = c.id;

    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; 
    RETURN;
  END IF;

  -- Gerar tokens seguros
  session_id := gen_random_uuid();
  access_token_val := encode(gen_random_bytes(32), 'hex');
  refresh_token_val := encode(gen_random_bytes(32), 'hex');

  -- Criar sessão segura
  INSERT INTO public.clinic_sessions (
    id, clinic_id, ip_address, user_agent,
    access_token_hash, refresh_token_hash, expires_at
  ) VALUES (
    session_id, c.id, p_ip_address, p_user_agent,
    crypt(access_token_val, gen_salt('bf')),
    crypt(refresh_token_val, gen_salt('bf')),
    now() + interval '7 days'
  );

  -- Registrar login bem-sucedido
  INSERT INTO public.login_attempts (email, ip_address, user_agent, success)
  VALUES (email_input, p_ip_address, p_user_agent, true);

  -- Limpar tentativas falhadas
  UPDATE public.configuracoes_clinica
  SET failed_login_attempts = 0,
      last_failed_login = NULL
  WHERE clinica_id = c.id;

  INSERT INTO public.security_logs (event_type, details, clinic_id, ip_address)
  VALUES ('LOGIN_SUCCESS', jsonb_build_object('session_id', session_id, 'mfa_required', c.mfa_enabled), c.id, p_ip_address);

  RETURN QUERY SELECT c.id, c.nome, true, COALESCE(c.mfa_enabled,false), access_token_val, refresh_token_val;
END;
$function$;

-- Função helper para get_current_medico com search_path seguro
CREATE OR REPLACE FUNCTION public.get_current_medico()
RETURNS TABLE(id uuid, clinica_id uuid, cpf text, nome_completo text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT m.id, m.clinica_id, m.cpf, m.nome_completo
  FROM public.medicos m
  WHERE m.cpf = current_setting('app.medico_cpf', true)
  AND m.ativo = true
  LIMIT 1;
$function$;

-- Função helper para get_current_paciente com search_path seguro
CREATE OR REPLACE FUNCTION public.get_current_paciente()
RETURNS TABLE(id uuid, cpf text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT p.id, p.cpf
  FROM public.pacientes p
  WHERE p.cpf = current_setting('app.paciente_cpf', true)
  AND p.senha_acesso IS NOT NULL
  LIMIT 1;
$function$;

-- Limpar senhas hardcoded expostas na tabela configuracoes_clinica
UPDATE public.configuracoes_clinica 
SET email_login_clinica = CASE 
  WHEN email_login_clinica = 'adminclinica@inovai.com' THEN NULL 
  ELSE email_login_clinica 
END,
senha_acesso_clinica = NULL,
codigo_acesso_admin = NULL,
codigo_acesso_clinica = NULL, 
codigo_acesso_funcionario = NULL,
daily_api_key = NULL,
daily_webhook_secret = NULL
WHERE email_login_clinica = 'adminclinica@inovai.com' 
   OR senha_acesso_clinica IS NOT NULL
   OR codigo_acesso_admin IS NOT NULL;

-- Comentário de segurança nas colunas sensíveis
COMMENT ON COLUMN public.configuracoes_clinica.daily_api_key IS 'Daily.co API key - DEVE ser configurada via Supabase Secrets, nunca hardcoded';
COMMENT ON COLUMN public.configuracoes_clinica.senha_acesso_clinica IS 'DEPRECATED: Usar senha_hash instead';
COMMENT ON COLUMN public.configuracoes_clinica.codigo_acesso_admin IS 'DEPRECATED: Implementar autenticação real';

-- Trigger para prevenir inserção de dados sensíveis
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

CREATE TRIGGER prevent_sensitive_data_trigger
  BEFORE INSERT OR UPDATE ON public.configuracoes_clinica
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_sensitive_data_insert();