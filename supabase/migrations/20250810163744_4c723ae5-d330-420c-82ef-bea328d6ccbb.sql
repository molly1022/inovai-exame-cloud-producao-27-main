-- Remove daily_api_key hardcoded value from configuracoes_clinica table for security
UPDATE public.configuracoes_clinica 
SET daily_api_key = NULL 
WHERE daily_api_key IS NOT NULL;

-- Add security note in table comment
COMMENT ON COLUMN public.configuracoes_clinica.daily_api_key IS 'Daily.co API key - should be set via Supabase secrets, not stored directly';

-- Ensure no default value for daily_api_key
ALTER TABLE public.configuracoes_clinica 
ALTER COLUMN daily_api_key DROP DEFAULT;

-- Set proper search_path for all functions to prevent SQL injection
-- Update existing functions to use secure search_path

CREATE OR REPLACE FUNCTION public.admin_login(email_input text, password_input text)
RETURNS TABLE(success boolean, user_id uuid, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    admin_record public.admin_users%ROWTYPE;
    login_attempts INTEGER := 0;
    max_attempts INTEGER := 5;
    lockout_duration INTERVAL := '15 minutes';
BEGIN
    -- Find admin user by email (case-insensitive)
    SELECT * INTO admin_record
    FROM public.admin_users
    WHERE lower(email) = lower(email_input);
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::uuid, 'Credenciais inválidas'::text;
        RETURN;
    END IF;
    
    -- Check if account is locked
    IF admin_record.locked_until IS NOT NULL AND admin_record.locked_until > now() THEN
        RETURN QUERY SELECT false, NULL::uuid, 'Conta temporariamente bloqueada'::text;
        RETURN;
    END IF;
    
    -- Check if account is active
    IF NOT admin_record.is_active THEN
        RETURN QUERY SELECT false, NULL::uuid, 'Conta desativada'::text;
        RETURN;
    END IF;
    
    -- Verify password using crypt
    IF crypt(password_input, admin_record.password_hash) = admin_record.password_hash THEN
        -- Password is correct - reset failed attempts and update last login
        UPDATE public.admin_users 
        SET 
            failed_login_attempts = 0,
            locked_until = NULL,
            last_login_at = now()
        WHERE id = admin_record.id;
        
        RETURN QUERY SELECT true, admin_record.id, 'Login realizado com sucesso'::text;
    ELSE
        -- Password is incorrect - increment failed attempts
        login_attempts := admin_record.failed_login_attempts + 1;
        
        IF login_attempts >= max_attempts THEN
            -- Lock the account
            UPDATE public.admin_users 
            SET 
                failed_login_attempts = login_attempts,
                locked_until = now() + lockout_duration
            WHERE id = admin_record.id;
            
            RETURN QUERY SELECT false, NULL::uuid, 'Muitas tentativas incorretas. Conta bloqueada por 15 minutos'::text;
        ELSE
            -- Just increment the counter
            UPDATE public.admin_users 
            SET failed_login_attempts = login_attempts
            WHERE id = admin_record.id;
            
            RETURN QUERY SELECT false, NULL::uuid, 'Credenciais inválidas'::text;
        END IF;
    END IF;
END;
$function$;