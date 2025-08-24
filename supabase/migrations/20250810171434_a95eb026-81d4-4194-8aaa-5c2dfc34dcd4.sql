-- Atualizar configurações das clínicas existentes com senhas padrão
UPDATE configuracoes_clinica 
SET 
  senha_acesso_clinica = 'clinica123',
  updated_at = now()
WHERE senha_acesso_clinica IS NULL AND senha_hash IS NULL;

-- Inserir configurações para clínicas que não têm registro na tabela configuracoes_clinica
INSERT INTO configuracoes_clinica (clinica_id, email_login_clinica, senha_acesso_clinica)
SELECT 
  c.id as clinica_id,
  c.email as email_login_clinica,
  'clinica123' as senha_acesso_clinica
FROM clinicas c
LEFT JOIN configuracoes_clinica cc ON c.id = cc.clinica_id
WHERE cc.clinica_id IS NULL;

-- Atualizar função de verificação de login seguro
CREATE OR REPLACE FUNCTION public.secure_verify_clinic_login_simple(
  email_input text, 
  password_input text
) RETURNS TABLE(
  clinica_id uuid, 
  clinica_nome text, 
  success boolean
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  config_record RECORD;
  clinic_record RECORD;
BEGIN
  -- Buscar configurações da clínica
  SELECT cc.clinica_id, cc.senha_acesso_clinica, cc.senha_hash
  INTO config_record
  FROM configuracoes_clinica cc
  WHERE cc.email_login_clinica = lower(trim(email_input))
  LIMIT 1;

  -- Se não encontrou configuração, retornar erro
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
    RETURN;
  END IF;

  -- Verificar senha (primeiro senha_acesso_clinica, depois senha_hash como fallback)
  IF (config_record.senha_acesso_clinica IS NOT NULL AND password_input = config_record.senha_acesso_clinica) OR
     (config_record.senha_hash IS NOT NULL AND password_input = config_record.senha_hash) THEN
    
    -- Buscar dados da clínica
    SELECT c.id, c.nome
    INTO clinic_record
    FROM clinicas c
    WHERE c.id = config_record.clinica_id;
    
    IF FOUND THEN
      RETURN QUERY SELECT clinic_record.id, clinic_record.nome, true;
    ELSE
      RETURN QUERY SELECT NULL::uuid, NULL::text, false;
    END IF;
  ELSE
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
  END IF;
END;
$$;