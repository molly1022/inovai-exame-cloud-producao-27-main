-- 1. Corrigir a função set_medico_context para garantir que funciona corretamente
CREATE OR REPLACE FUNCTION public.set_medico_context(medico_cpf text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se o médico existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.medicos 
    WHERE cpf = medico_cpf AND ativo = true
  ) THEN
    RAISE EXCEPTION 'Médico com CPF % não encontrado ou inativo', medico_cpf;
  END IF;
  
  -- Definir contexto do médico para a sessão atual
  PERFORM set_config('app.medico_cpf', medico_cpf, false);
  
  -- Log da operação
  INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
  VALUES (
    'MEDICO_CONTEXT_SET',
    'system',
    jsonb_build_object(
      'medico_cpf', medico_cpf,
      'timestamp', now(),
      'session_user', session_user
    )
  );
END;
$$;

-- 2. Criar função para obter médico logado
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
  
  IF medico_cpf_atual IS NULL OR medico_cpf_atual = '' THEN
    RETURN;
  END IF;
  
  -- Retornar dados do médico
  RETURN QUERY
  SELECT m.id, m.clinica_id, m.cpf, m.nome_completo
  FROM public.medicos m
  WHERE m.cpf = medico_cpf_atual AND m.ativo = true;
END;
$$;

-- 3. Atualizar política RLS para pacientes - permitir acesso a médicos da mesma clínica
DROP POLICY IF EXISTS "Medicos podem ver pacientes da sua clinica" ON public.pacientes;

CREATE POLICY "Medicos podem ver pacientes da sua clinica"
ON public.pacientes
FOR SELECT
TO authenticated
USING (
  clinica_id IN (
    SELECT m.clinica_id
    FROM public.get_current_medico() m
  )
);

-- 4. Atualizar política RLS para exames - permitir acesso a médicos da mesma clínica
DROP POLICY IF EXISTS "Medicos podem ver exames da sua clinica" ON public.exames;

CREATE POLICY "Medicos podem ver exames da sua clinica"
ON public.exames
FOR SELECT
TO authenticated
USING (
  clinica_id IN (
    SELECT m.clinica_id
    FROM public.get_current_medico() m
  )
);

-- 5. Atualizar política RLS para receitas médicas - permitir acesso a médicos da mesma clínica
DROP POLICY IF EXISTS "Medicos podem ver receitas da sua clinica" ON public.receitas_medicas;

CREATE POLICY "Medicos podem ver receitas da sua clinica"
ON public.receitas_medicas
FOR SELECT
TO authenticated
USING (
  clinica_id IN (
    SELECT m.clinica_id
    FROM public.get_current_medico() m
  )
);

-- 6. Política para médicos poderem inserir receitas médicas
CREATE POLICY "Medicos podem inserir receitas na sua clinica"
ON public.receitas_medicas
FOR INSERT
TO authenticated
WITH CHECK (
  clinica_id IN (
    SELECT m.clinica_id
    FROM public.get_current_medico() m
  )
  AND medico_id IN (
    SELECT m.id
    FROM public.get_current_medico() m
  )
);

-- 7. Política para agendamentos - médicos podem ver seus agendamentos
CREATE POLICY "Medicos podem ver seus agendamentos"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (
  medico_id IN (
    SELECT m.id
    FROM public.get_current_medico() m
  )
);

-- 8. Política para médicos poderem atualizar status de agendamentos
CREATE POLICY "Medicos podem atualizar seus agendamentos"
ON public.agendamentos
FOR UPDATE
TO authenticated
USING (
  medico_id IN (
    SELECT m.id
    FROM public.get_current_medico() m
  )
);