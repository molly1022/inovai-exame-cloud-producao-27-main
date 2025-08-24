-- 1. CRÍTICO: Habilitar RLS na tabela atestados_medicos que tem políticas criadas mas RLS desabilitado
ALTER TABLE public.atestados_medicos ENABLE ROW LEVEL SECURITY;

-- 2. Corrigir políticas RLS para médicos verem pacientes da sua clínica
-- A política atual está muito restritiva, vamos criar políticas mais específicas para médicos

-- Dropar e recriar política para pacientes que permite acesso aos médicos da clínica
DROP POLICY IF EXISTS "Pacientes isolamento total por clinica" ON public.pacientes;

CREATE POLICY "Pacientes isolamento por clinica - admin/funcionario" 
ON public.pacientes 
FOR ALL 
USING (clinica_id IN (
  SELECT clinicas.id FROM clinicas WHERE clinicas.id = pacientes.clinica_id
));

-- Nova política específica para médicos verem pacientes da sua clínica
CREATE POLICY "Medicos podem ver pacientes da sua clinica" 
ON public.pacientes 
FOR SELECT 
USING (
  clinica_id IN (
    SELECT medicos.clinica_id 
    FROM medicos 
    WHERE medicos.cpf = (current_setting('app.medico_cpf', true))
    AND medicos.ativo = true
  )
);

-- 3. Política para exames - médicos podem ver exames da sua clínica
DROP POLICY IF EXISTS "Exames isolados por clinica" ON public.exames;

CREATE POLICY "Exames isolados por clinica - admin/funcionario" 
ON public.exames 
FOR ALL 
USING (clinica_id IN (
  SELECT clinicas.id FROM clinicas WHERE clinicas.id = exames.clinica_id
));

CREATE POLICY "Medicos podem ver exames da sua clinica" 
ON public.exames 
FOR SELECT 
USING (
  clinica_id IN (
    SELECT medicos.clinica_id 
    FROM medicos 
    WHERE medicos.cpf = (current_setting('app.medico_cpf', true))
    AND medicos.ativo = true
  )
);

-- 4. Política para receitas médicas - médicos podem ver receitas da sua clínica
DROP POLICY IF EXISTS "Receitas médicas isoladas por clínica" ON public.receitas_medicas;

CREATE POLICY "Receitas medicas isoladas por clinica - admin/funcionario" 
ON public.receitas_medicas 
FOR ALL 
USING (clinica_id IN (
  SELECT clinicas.id FROM clinicas WHERE clinicas.id = receitas_medicas.clinica_id
));

CREATE POLICY "Medicos podem ver receitas da sua clinica" 
ON public.receitas_medicas 
FOR SELECT 
USING (
  clinica_id IN (
    SELECT medicos.clinica_id 
    FROM medicos 
    WHERE medicos.cpf = (current_setting('app.medico_cpf', true))
    AND medicos.ativo = true
  )
);

-- 5. Criar função para definir contexto do médico logado
CREATE OR REPLACE FUNCTION public.set_medico_context(medico_cpf text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Definir contexto do médico para a sessão atual
  PERFORM set_config('app.medico_cpf', medico_cpf, false);
END;
$$;