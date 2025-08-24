-- FASE 2: CORREÇÕES DE SEGURANÇA CRÍTICAS
-- Remover senhas e chaves expostas + implementar funções seguras

-- Limpar dados sensíveis expostos
UPDATE public.configuracoes_clinica 
SET senha_acesso_clinica = NULL,
    codigo_acesso_admin = NULL,
    codigo_acesso_clinica = NULL, 
    codigo_acesso_funcionario = NULL,
    daily_api_key = NULL,
    daily_webhook_secret = NULL;

-- Corrigir funções críticas com search_path seguro
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

CREATE OR REPLACE FUNCTION public.get_current_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT current_setting('app.current_clinic_id', true)::uuid;
$function$;

-- Função para sanitização de inputs
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remover caracteres perigosos e scripts
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(input_text, '<[^>]*>', '', 'gi'),  -- Remove HTML tags
      '[<>"\'';&|`]', '', 'g'),                         -- Remove caracteres perigosos
    '\s+', ' ', 'g'                                     -- Normaliza espaços
  );
END;
$function$;

-- Função para validação de CPF
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  cpf_clean text;
  sum1 integer := 0;
  sum2 integer := 0;
  digit1 integer;
  digit2 integer;
  i integer;
BEGIN
  -- Limpar CPF
  cpf_clean := regexp_replace(cpf_input, '[^0-9]', '', 'g');
  
  -- Verificar se tem 11 dígitos
  IF length(cpf_clean) != 11 THEN
    RETURN false;
  END IF;
  
  -- Verificar sequências inválidas
  IF cpf_clean IN ('00000000000', '11111111111', '22222222222', '33333333333',
                   '44444444444', '55555555555', '66666666666', '77777777777',
                   '88888888888', '99999999999') THEN
    RETURN false;
  END IF;
  
  -- Calcular primeiro dígito
  FOR i IN 1..9 LOOP
    sum1 := sum1 + substring(cpf_clean, i, 1)::integer * (11 - i);
  END LOOP;
  
  digit1 := 11 - (sum1 % 11);
  IF digit1 >= 10 THEN
    digit1 := 0;
  END IF;
  
  -- Calcular segundo dígito
  FOR i IN 1..10 LOOP
    sum2 := sum2 + substring(cpf_clean, i, 1)::integer * (12 - i);
  END LOOP;
  
  digit2 := 11 - (sum2 % 11);
  IF digit2 >= 10 THEN
    digit2 := 0;
  END IF;
  
  -- Verificar dígitos
  RETURN substring(cpf_clean, 10, 1)::integer = digit1 AND 
         substring(cpf_clean, 11, 1)::integer = digit2;
END;
$function$;

-- Função para criptografia segura de senhas
CREATE OR REPLACE FUNCTION public.secure_password_hash(password_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validar força da senha
  IF password_input IS NULL OR length(password_input) < 8 THEN
    RAISE EXCEPTION 'Senha deve ter pelo menos 8 caracteres';
  END IF;
  
  -- Gerar hash seguro com bcrypt
  RETURN crypt(password_input, gen_salt('bf', 12));
END;
$function$;

-- Função para verificação segura de senha
CREATE OR REPLACE FUNCTION public.verify_password(password_input text, password_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF password_input IS NULL OR password_hash IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN crypt(password_input, password_hash) = password_hash;
END;
$function$;

-- Trigger para sanitização automática em pacientes
CREATE OR REPLACE FUNCTION public.sanitize_patient_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Sanitizar campos de texto
  NEW.nome := public.sanitize_text_input(NEW.nome);
  NEW.email := lower(trim(NEW.email));
  NEW.endereco_completo := public.sanitize_text_input(NEW.endereco_completo);
  NEW.cidade := public.sanitize_text_input(NEW.cidade);
  NEW.bairro := public.sanitize_text_input(NEW.bairro);
  NEW.nome_pai := public.sanitize_text_input(NEW.nome_pai);
  NEW.nome_mae := public.sanitize_text_input(NEW.nome_mae);
  NEW.observacoes := public.sanitize_text_input(NEW.observacoes);
  
  -- Validar CPF
  IF NEW.cpf IS NOT NULL AND NOT public.validate_cpf(NEW.cpf) THEN
    RAISE EXCEPTION 'CPF inválido: %', NEW.cpf;
  END IF;
  
  -- Normalizar CPF
  NEW.cpf := regexp_replace(NEW.cpf, '[^0-9]', '', 'g');
  
  RETURN NEW;
END;
$function$;

-- Aplicar trigger de sanitização
DROP TRIGGER IF EXISTS sanitize_patient_trigger ON public.pacientes;
CREATE TRIGGER sanitize_patient_trigger
  BEFORE INSERT OR UPDATE ON public.pacientes
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_patient_data();

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

CREATE POLICY "Security logs admin only" ON public.security_logs
  FOR ALL USING (false);  -- Apenas funções do sistema podem acessar