-- Corrigir política RLS da tabela atestados_medicos
DROP POLICY IF EXISTS "Atestados médicos isolados por clínica" ON public.atestados_medicos;

-- Criar nova política que permite inserção e manipulação por clínica
CREATE POLICY "Atestados isolados por clinica - admin/funcionario" 
ON public.atestados_medicos 
FOR ALL 
USING (clinica_id IN ( 
  SELECT clinicas.id 
  FROM clinicas 
  WHERE (clinicas.id = atestados_medicos.clinica_id)
))
WITH CHECK (clinica_id IN ( 
  SELECT clinicas.id 
  FROM clinicas 
  WHERE (clinicas.id = atestados_medicos.clinica_id)
));

-- Política para médicos verem seus atestados
CREATE POLICY "Medicos podem ver atestados da sua clinica" 
ON public.atestados_medicos 
FOR SELECT 
USING (clinica_id IN ( 
  SELECT m.clinica_id 
  FROM get_current_medico() m(id, clinica_id, cpf, nome_completo)
));

-- Política para médicos criarem atestados
CREATE POLICY "Medicos podem criar atestados na sua clinica" 
ON public.atestados_medicos 
FOR INSERT 
WITH CHECK (clinica_id IN ( 
  SELECT m.clinica_id 
  FROM get_current_medico() m(id, clinica_id, cpf, nome_completo)
) AND medico_id IN ( 
  SELECT m.id 
  FROM get_current_medico() m(id, clinica_id, cpf, nome_completo)
));