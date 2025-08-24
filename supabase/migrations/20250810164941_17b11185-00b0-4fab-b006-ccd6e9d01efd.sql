-- CORREÇÃO CRÍTICA DO SISTEMA DE LOGIN
-- Fase 1: Remover função existente e recriar com estrutura corrigida

-- Remover função problemática
DROP FUNCTION IF EXISTS public.secure_verify_clinic_login(text, text, inet, text);

-- Recriar função com estrutura correta e segura
CREATE OR REPLACE FUNCTION public.secure_verify_clinic_login(
    email_input text, 
    password_input text, 
    p_ip_address inet DEFAULT NULL::inet, 
    p_user_agent text DEFAULT NULL::text
)
RETURNS TABLE(
    clinic_id uuid, 
    clinic_name text, 
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
  clinic_record RECORD;
  attempts integer;
  access_token_val text;
  refresh_token_val text;
  session_id uuid;
BEGIN
  -- Rate limiting: verificar tentativas por IP
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

  -- Buscar clínica com configurações (SEM alias problemático)
  SELECT 
    cl.id, 
    cl.nome,
    cc.senha_hash, 
    cc.mfa_enabled, 
    cc.account_locked,
    cc.failed_login_attempts
  INTO clinic_record
  FROM public.clinicas cl
  JOIN public.configuracoes_clinica cc ON cc.clinica_id = cl.id
  WHERE LOWER(cl.email) = LOWER(email_input)
  LIMIT 1;

  -- Verificar se clínica existe
  IF NOT FOUND THEN
    INSERT INTO public.login_attempts (email, ip_address, user_agent, success, failure_reason)
    VALUES (email_input, p_ip_address, p_user_agent, false, 'invalid_email');
    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; 
    RETURN;
  END IF;

  -- Verificar se conta está bloqueada
  IF clinic_record.account_locked IS TRUE THEN
    INSERT INTO public.security_logs (event_type, details, clinic_id, ip_address)
    VALUES ('LOGIN_BLOCKED', jsonb_build_object('reason','account_locked'), clinic_record.id, p_ip_address);
    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; 
    RETURN;
  END IF;

  -- Verificar senha (protegido contra timing attacks)
  IF clinic_record.senha_hash IS NULL OR crypt(password_input, clinic_record.senha_hash) <> clinic_record.senha_hash THEN
    -- Registrar tentativa falhada
    INSERT INTO public.login_attempts (email, ip_address, user_agent, success, failure_reason)
    VALUES (email_input, p_ip_address, p_user_agent, false, 'invalid_password');

    -- Incrementar contador de falhas e bloquear se necessário
    UPDATE public.configuracoes_clinica
    SET failed_login_attempts = COALESCE(failed_login_attempts,0) + 1,
        last_failed_login = now(),
        account_locked = CASE WHEN COALESCE(failed_login_attempts,0) + 1 >= 10 THEN true ELSE account_locked END
    WHERE clinica_id = clinic_record.id;

    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; 
    RETURN;
  END IF;

  -- Login bem-sucedido: gerar tokens seguros
  session_id := gen_random_uuid();
  access_token_val := encode(gen_random_bytes(32), 'hex');
  refresh_token_val := encode(gen_random_bytes(32), 'hex');

  -- Criar sessão segura com tokens hasheados
  INSERT INTO public.clinic_sessions (
    id, clinic_id, ip_address, user_agent,
    access_token_hash, refresh_token_hash, expires_at
  ) VALUES (
    session_id, clinic_record.id, p_ip_address, p_user_agent,
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
  WHERE clinica_id = clinic_record.id;

  -- Log de segurança
  INSERT INTO public.security_logs (event_type, details, clinic_id, ip_address)
  VALUES ('LOGIN_SUCCESS', jsonb_build_object('session_id', session_id, 'mfa_required', clinic_record.mfa_enabled), clinic_record.id, p_ip_address);

  -- Retornar dados seguros
  RETURN QUERY SELECT 
    clinic_record.id, 
    clinic_record.nome, 
    true, 
    COALESCE(clinic_record.mfa_enabled,false), 
    access_token_val, 
    refresh_token_val;
END;
$function$;

-- Corrigir função verify_clinic_login para compatibilidade
CREATE OR REPLACE FUNCTION public.verify_clinic_login(email_input text, password_input text)
RETURNS TABLE(clinica_id uuid, clinica_nome text, success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Chamar função segura com IP e user agent NULL para compatibilidade
    RETURN QUERY
    SELECT s.clinic_id, s.clinic_name, s.success
    FROM public.secure_verify_clinic_login(
        email_input,
        password_input,
        NULL::inet,
        NULL::text
    ) s;
END;
$function$;