-- Inserir configurações para clínicas que não têm registro na tabela configuracoes_clinica
-- Usando senha_hash em vez de senha em texto plano
INSERT INTO configuracoes_clinica (clinica_id, email_login_clinica, senha_hash)
SELECT 
  c.id as clinica_id,
  c.email as email_login_clinica,
  crypt('clinica123', gen_salt('bf')) as senha_hash
FROM clinicas c
LEFT JOIN configuracoes_clinica cc ON c.id = cc.clinica_id
WHERE cc.clinica_id IS NULL;

-- Atualizar configurações existentes com senha hasheada
UPDATE configuracoes_clinica 
SET 
  senha_hash = crypt('clinica123', gen_salt('bf')),
  updated_at = now()
WHERE senha_hash IS NULL;

-- Função de verificação de login melhorada
CREATE OR REPLACE FUNCTION public.verify_clinic_login_secure(
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
  SELECT cc.clinica_id, cc.senha_hash, cc.senha_acesso_clinica
  INTO config_record
  FROM configuracoes_clinica cc
  WHERE cc.email_login_clinica = lower(trim(email_input))
  LIMIT 1;

  -- Se não encontrou configuração, retornar erro
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
    RETURN;
  END IF;

  -- Verificar senha usando crypt() para senhas hasheadas
  IF (config_record.senha_hash IS NOT NULL AND crypt(password_input, config_record.senha_hash) = config_record.senha_hash) OR
     (config_record.senha_acesso_clinica IS NOT NULL AND password_input = config_record.senha_acesso_clinica) THEN
    
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