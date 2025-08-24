-- FASE 1-2: Segurança mínima (tabelas + funções RPC + ajustes de schema)
-- Nota: Mantemos funções existentes e não removemos campos legados para evitar quebras

-- Extensão (usada por crypt/gen_random_bytes); geralmente já ativa
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Tabelas de segurança
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT false,
  failure_reason text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
-- Sem políticas: acesso negado por padrão
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created_at
  ON public.login_attempts (ip_address, created_at);

CREATE TABLE IF NOT EXISTS public.clinic_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  access_token_hash text NOT NULL,
  refresh_token_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_activity timestamptz DEFAULT now()
);
ALTER TABLE public.clinic_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_clinic_sessions_clinic_expires
  ON public.clinic_sessions (clinic_id, expires_at);

CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  clinic_id uuid REFERENCES public.clinicas(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_security_logs_clinic_created
  ON public.security_logs (clinic_id, created_at);

CREATE TABLE IF NOT EXISTS public.clinic_mfa (
  clinic_id uuid PRIMARY KEY REFERENCES public.clinicas(id) ON DELETE CASCADE,
  secret_key text,
  backup_codes text[],
  phone_number text,
  enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_used timestamptz
);
ALTER TABLE public.clinic_mfa ENABLE ROW LEVEL SECURITY;

-- 2) Ajustes de schema existentes (sem remover campos legados)
ALTER TABLE public.configuracoes_clinica
  ADD COLUMN IF NOT EXISTS senha_hash text,
  ADD COLUMN IF NOT EXISTS mfa_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_locked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_token text,
  ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS password_changed_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_failed_login timestamptz;

-- 3) Funções auxiliares
-- Verificação simples de MFA usando backup_codes (placeholder seguro)
CREATE OR REPLACE FUNCTION public.verify_mfa_code(p_clinic_id uuid, p_mfa_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mfa_record RECORD;
BEGIN
  SELECT * INTO mfa_record
  FROM public.clinic_mfa
  WHERE clinic_id = p_clinic_id;

  IF NOT FOUND OR mfa_record.enabled IS DISTINCT FROM true THEN
    RETURN true; -- MFA não habilitado
  END IF;

  IF p_mfa_code IS NULL OR length(p_mfa_code) = 0 THEN
    RETURN false;
  END IF;

  -- Validação simples via backup_codes (TOTP não implementado aqui)
  IF mfa_record.backup_codes IS NOT NULL AND p_mfa_code = ANY(mfa_record.backup_codes) THEN
    UPDATE public.clinic_mfa SET last_used = now() WHERE clinic_id = p_clinic_id;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Refresh do access token a partir do refresh token
CREATE OR REPLACE FUNCTION public.refresh_access_token(p_refresh_token text)
RETURNS TABLE(access_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sess RECORD;
  new_access text;
BEGIN
  IF p_refresh_token IS NULL OR length(p_refresh_token) = 0 THEN
    RETURN; -- retorna vazio
  END IF;

  SELECT * INTO sess
  FROM public.clinic_sessions s
  WHERE s.revoked_at IS NULL
    AND s.expires_at > now()
    AND crypt(p_refresh_token, s.refresh_token_hash) = s.refresh_token_hash
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN; -- token inválido/expirado
  END IF;

  new_access := encode(gen_random_bytes(32), 'hex');

  UPDATE public.clinic_sessions
  SET access_token_hash = crypt(new_access, gen_salt('bf')),
      last_activity = now()
  WHERE id = sess.id;

  RETURN QUERY SELECT new_access;
END;
$$;

-- 4) Registro seguro de clínica (adaptado ao schema atual)
CREATE OR REPLACE FUNCTION public.secure_register_clinic(
  clinic_name text,
  clinic_email text,
  clinic_phone text DEFAULT NULL,
  password_input text,
  terms_accepted boolean DEFAULT false
)
RETURNS TABLE(success boolean, clinic_id uuid, message text, verification_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  password_hash text;
  vtoken text;
  existing_count integer;
BEGIN
  IF NOT terms_accepted THEN
    RETURN QUERY SELECT false, NULL::uuid, 'Termos de uso devem ser aceitos', NULL::text; RETURN;
  END IF;

  -- Validação de email (usa função existente validar_email)
  IF NOT public.validar_email(clinic_email) THEN
    RETURN QUERY SELECT false, NULL::uuid, 'Email inválido', NULL::text; RETURN;
  END IF;

  -- Força de senha mínima
  IF password_input IS NULL OR length(password_input) < 12
     OR password_input !~ '[A-Z]'
     OR password_input !~ '[a-z]'
     OR password_input !~ '[0-9]'
     OR password_input !~ '[^A-Za-z0-9]'
  THEN
    RETURN QUERY SELECT false, NULL::uuid, 'Senha fraca: mínimo 12 caracteres com maiúscula, minúscula, número e símbolo', NULL::text; RETURN;
  END IF;

  -- Duplicidade de email
  SELECT COUNT(*) INTO existing_count FROM public.clinicas WHERE email = LOWER(clinic_email);
  IF existing_count > 0 THEN
    RETURN QUERY SELECT false, NULL::uuid, 'Email já cadastrado', NULL::text; RETURN;
  END IF;

  password_hash := crypt(password_input, gen_salt('bf', 12));
  vtoken := encode(gen_random_bytes(32), 'hex');

  INSERT INTO public.clinicas (id, nome, email, telefone, created_at, updated_at)
  VALUES (gen_random_uuid(), clinic_name, LOWER(clinic_email), clinic_phone, now(), now())
  RETURNING id INTO new_id;

  INSERT INTO public.configuracoes_clinica (
    clinica_id, email_login_clinica, senha_hash, mfa_enabled, account_locked,
    email_verified, verification_token, verification_expires_at, password_changed_at, failed_login_attempts
  ) VALUES (
    new_id, LOWER(clinic_email), password_hash, false, false,
    false, vtoken, now() + interval '24 hours', now(), 0
  );

  INSERT INTO public.security_logs (event_type, clinic_id, details)
  VALUES ('CLINIC_REGISTERED', new_id, jsonb_build_object('clinic_name', clinic_name, 'verification_token_sent', true));

  RETURN QUERY SELECT true, new_id, 'Clínica registrada com sucesso. Verifique seu email.', vtoken;
END;
$$;

-- 5) Login seguro (bcrypt + sessões)
CREATE OR REPLACE FUNCTION public.secure_verify_clinic_login(
  email_input text,
  password_input text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
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
SET search_path = public
AS $$
DECLARE
  c RECORD;
  attempts integer;
  access_token_val text;
  refresh_token_val text;
  session_id uuid;
BEGIN
  -- Rate limiting por IP (últimos 15 min)
  SELECT COUNT(*) INTO attempts
  FROM public.login_attempts
  WHERE ip_address = COALESCE(p_ip_address, '0.0.0.0'::inet)
    AND created_at > now() - interval '15 minutes'
    AND success = false;

  IF attempts >= 5 THEN
    INSERT INTO public.security_logs (event_type, details, ip_address)
    VALUES ('LOGIN_BLOCKED', jsonb_build_object('email', email_input, 'reason', 'rate_limit_exceeded', 'attempts', attempts), p_ip_address);
    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; RETURN;
  END IF;

  -- Buscar clínica e hash
  SELECT c.id, c.nome,
         cc.senha_hash, cc.mfa_enabled, cc.account_locked,
         cc.failed_login_attempts
  INTO c
  FROM public.clinicas c
  JOIN public.configuracoes_clinica cc ON cc.clinica_id = c.id
  WHERE c.email = LOWER(email_input)
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.login_attempts (email, ip_address, user_agent, success, failure_reason)
    VALUES (email_input, p_ip_address, p_user_agent, false, 'invalid_email');
    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; RETURN;
  END IF;

  IF c.account_locked IS TRUE THEN
    INSERT INTO public.security_logs (event_type, details, clinic_id, ip_address)
    VALUES ('LOGIN_BLOCKED', jsonb_build_object('reason','account_locked'), c.id, p_ip_address);
    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; RETURN;
  END IF;

  IF c.senha_hash IS NULL OR crypt(password_input, c.senha_hash) <> c.senha_hash THEN
    INSERT INTO public.login_attempts (email, ip_address, user_agent, success, failure_reason)
    VALUES (email_input, p_ip_address, p_user_agent, false, 'invalid_password');

    UPDATE public.configuracoes_clinica
    SET failed_login_attempts = COALESCE(failed_login_attempts,0) + 1,
        last_failed_login = now(),
        account_locked = CASE WHEN COALESCE(failed_login_attempts,0) + 1 >= 10 THEN true ELSE account_locked END
    WHERE clinica_id = c.id;

    RETURN QUERY SELECT NULL::uuid, NULL::text, false, false, NULL::text, NULL::text; RETURN;
  END IF;

  -- Sucesso: gerar tokens e sessão
  session_id := gen_random_uuid();
  access_token_val := encode(gen_random_bytes(32), 'hex');
  refresh_token_val := encode(gen_random_bytes(32), 'hex');

  INSERT INTO public.clinic_sessions (
    id, clinic_id, ip_address, user_agent,
    access_token_hash, refresh_token_hash, expires_at
  ) VALUES (
    session_id, c.id, p_ip_address, p_user_agent,
    crypt(access_token_val, gen_salt('bf')),
    crypt(refresh_token_val, gen_salt('bf')),
    now() + interval '7 days'
  );

  INSERT INTO public.login_attempts (email, ip_address, user_agent, success)
  VALUES (email_input, p_ip_address, p_user_agent, true);

  INSERT INTO public.security_logs (event_type, details, clinic_id, ip_address)
  VALUES ('LOGIN_SUCCESS', jsonb_build_object('session_id', session_id, 'mfa_required', c.mfa_enabled), c.id, p_ip_address);

  RETURN QUERY SELECT c.id, c.nome, true, COALESCE(c.mfa_enabled,false), access_token_val, refresh_token_val;
END;
$$;
