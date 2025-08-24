-- Create helper functions for funcionarios logging
CREATE OR REPLACE FUNCTION public.insert_funcionario_log(
  p_funcionario_id uuid,
  p_clinica_id uuid,
  p_acao text,
  p_descricao text DEFAULT NULL,
  p_detalhes text DEFAULT NULL,
  p_tabela_afetada text DEFAULT NULL,
  p_registro_id text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO funcionarios_logs (
    funcionario_id, clinica_id, acao, descricao, detalhes, 
    tabela_afetada, registro_id, ip_address, user_agent
  ) VALUES (
    p_funcionario_id, p_clinica_id, p_acao, p_descricao, p_detalhes,
    p_tabela_afetada, p_registro_id, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_funcionario_sessao(
  p_funcionario_id uuid,
  p_clinica_id uuid,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sessao_id uuid;
BEGIN
  INSERT INTO funcionarios_sessoes (
    funcionario_id, clinica_id, ip_address, user_agent
  ) VALUES (
    p_funcionario_id, p_clinica_id, p_ip_address, p_user_agent
  ) RETURNING id INTO sessao_id;
  
  RETURN sessao_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_funcionario_sessao(
  p_funcionario_id uuid,
  p_clinica_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE funcionarios_sessoes
  SET logout_at = NOW(),
      ativa = false
  WHERE funcionario_id = p_funcionario_id
    AND clinica_id = p_clinica_id
    AND ativa = true;
    
  RETURN FOUND;
END;
$$;