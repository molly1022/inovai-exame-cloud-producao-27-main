-- Políticas finais para isolamento correto de médicos por clínica
-- Usar uma abordagem baseada no contexto da sessão

-- 1. Função para obter clinica_id do contexto da aplicação
CREATE OR REPLACE FUNCTION public.get_current_clinic_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- Esta função retorna o clinic_id que deve ser definido pela aplicação
  -- Por enquanto retorna o valor de um parâmetro de configuração
  SELECT current_setting('app.current_clinic_id', true)::uuid;
$$;

-- 2. Política corrigida para médicos com isolamento por clínica
DROP POLICY IF EXISTS "Medicos por clinica isolados" ON public.medicos;

CREATE POLICY "Medicos isolamento por clinica"
ON public.medicos
FOR ALL
USING (
  -- Verificar se a clínica_id do médico corresponde à clínica atual
  clinica_id = COALESCE(
    public.get_current_clinic_id(),
    '00000000-0000-0000-0000-000000000001'::uuid
  )
  OR 
  -- Permitir acesso se não houver restrição de contexto (para migration/admin)
  current_setting('app.current_clinic_id', true) IS NULL
)
WITH CHECK (
  clinica_id = COALESCE(
    public.get_current_clinic_id(),
    '00000000-0000-0000-0000-000000000001'::uuid
  )
);

-- 3. Aplicar mesmo padrão para outras tabelas sensíveis
DROP POLICY IF EXISTS "Categorias por clinica" ON public.categorias_exames;

CREATE POLICY "Categorias isolamento por clinica"
ON public.categorias_exames
FOR ALL
USING (
  clinica_id = COALESCE(
    public.get_current_clinic_id(),
    '00000000-0000-0000-0000-000000000001'::uuid
  )
  OR 
  current_setting('app.current_clinic_id', true) IS NULL
)
WITH CHECK (
  clinica_id = COALESCE(
    public.get_current_clinic_id(),
    '00000000-0000-0000-0000-000000000001'::uuid
  )
);

-- 4. Historico de agendamentos
DROP POLICY IF EXISTS "Historico agendamentos por clinica" ON public.agendamentos_historico;

CREATE POLICY "Historico agendamentos isolamento"
ON public.agendamentos_historico
FOR ALL
USING (
  agendamento_id IN (
    SELECT id FROM public.agendamentos 
    WHERE clinica_id = COALESCE(
      public.get_current_clinic_id(),
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  OR 
  current_setting('app.current_clinic_id', true) IS NULL
);