-- Ensure required extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Create admin_users table required by admin_login RPC
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_unique ON public.admin_users (lower(email));

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER trg_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Normalize/Unify clinic login RPC: create a wrapper with the legacy signature that delegates to the secure function
CREATE OR REPLACE FUNCTION public.verify_clinic_login(email_input text, password_input text)
RETURNS TABLE(clinica_id uuid, clinica_nome text, success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT v.clinic_id::uuid AS clinica_id,
         v.clinic_name::text AS clinica_nome,
         v.success::boolean AS success
  FROM public.secure_verify_clinic_login(email_input, password_input, NULL::inet, NULL::text) AS v
  LIMIT 1;
END;
$function$;