-- Corrigir a função get_current_medico para funcionar corretamente
CREATE OR REPLACE FUNCTION public.get_current_medico()
RETURNS table(id uuid, clinica_id uuid, cpf text, nome_completo text)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  medico_cpf_atual text;
BEGIN
  -- Obter CPF do médico do contexto da sessão
  medico_cpf_atual := current_setting('app.medico_cpf', true);
  
  -- Debug log
  RAISE NOTICE 'Contexto médico atual: %', medico_cpf_atual;
  
  IF medico_cpf_atual IS NULL OR medico_cpf_atual = '' THEN
    RAISE NOTICE 'Nenhum contexto de médico encontrado';
    RETURN;
  END IF;
  
  -- Retornar dados do médico
  RETURN QUERY
  SELECT m.id, m.clinica_id, m.cpf, m.nome_completo
  FROM public.medicos m
  WHERE m.cpf = medico_cpf_atual AND m.ativo = true;
END;
$$;