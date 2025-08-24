
-- 1. Verificar e corrigir políticas RLS para médicos
DROP POLICY IF EXISTS "Clínicas podem gerenciar seus médicos" ON public.medicos;
CREATE POLICY "Clínicas podem gerenciar seus médicos"
ON public.medicos
FOR ALL
USING (clinica_id IN (
  SELECT id FROM public.clinicas WHERE id = clinica_id
));

-- 2. Corrigir políticas RLS para pacientes
DROP POLICY IF EXISTS "Clínicas podem gerenciar seus pacientes" ON public.pacientes;
CREATE POLICY "Clínicas podem gerenciar seus pacientes"
ON public.pacientes
FOR ALL
USING (clinica_id IN (
  SELECT id FROM public.clinicas WHERE id = clinica_id
));

-- 3. Verificar políticas de email_lembretes
DROP POLICY IF EXISTS "Clínicas podem ver seus próprios logs de email" ON public.email_lembretes;
CREATE POLICY "Clínicas podem ver seus próprios logs de email"
ON public.email_lembretes
FOR ALL
USING (clinica_id IN (
  SELECT id FROM public.clinicas WHERE id = clinica_id
));

-- 4. Corrigir políticas de exames
DROP POLICY IF EXISTS "Clínicas podem gerenciar seus exames" ON public.exames;
CREATE POLICY "Clínicas podem gerenciar seus exames"
ON public.exames
FOR ALL
USING (clinica_id IN (
  SELECT id FROM public.clinicas WHERE id = clinica_id
));

-- 5. Verificar políticas de categorias_exames
DROP POLICY IF EXISTS "Clínicas podem gerenciar suas categorias" ON public.categorias_exames;
CREATE POLICY "Clínicas podem gerenciar suas categorias"
ON public.categorias_exames
FOR ALL
USING (clinica_id IN (
  SELECT id FROM public.clinicas WHERE id = clinica_id
));

-- 6. Corrigir políticas de agendamentos
DROP POLICY IF EXISTS "Clínicas podem gerenciar seus agendamentos" ON public.agendamentos;
CREATE POLICY "Clínicas podem gerenciar seus agendamentos"
ON public.agendamentos
FOR ALL
USING (clinica_id IN (
  SELECT id FROM public.clinicas WHERE id = clinica_id
));

-- 7. Verificar políticas de convenios
DROP POLICY IF EXISTS "Clínicas podem gerenciar convênios" ON public.convenios;
CREATE POLICY "Clínicas podem gerenciar convênios"
ON public.convenios
FOR ALL
USING (clinica_id IN (
  SELECT id FROM public.clinicas WHERE id = clinica_id
));

-- 8. Corrigir políticas de funcionarios
DROP POLICY IF EXISTS "Funcionários podem ser visualizados pela clínica" ON public.funcionarios;
CREATE POLICY "Funcionários podem ser visualizados pela clínica"
ON public.funcionarios
FOR ALL
USING (clinica_id IN (
  SELECT id FROM public.clinicas WHERE id = clinica_id
));

-- 9. Verificar políticas de receitas_medicas
DROP POLICY IF EXISTS "Medicos podem ver suas receitas" ON public.receitas_medicas;
DROP POLICY IF EXISTS "Medicos podem criar receitas" ON public.receitas_medicas;
DROP POLICY IF EXISTS "Medicos podem atualizar suas receitas" ON public.receitas_medicas;
DROP POLICY IF EXISTS "Medicos podem deletar suas receitas" ON public.receitas_medicas;

CREATE POLICY "Receitas médicas isoladas por clínica"
ON public.receitas_medicas
FOR ALL
USING (clinica_id IN (
  SELECT id FROM public.clinicas WHERE id = clinica_id
));

-- 10. Melhorar função de busca de agendamentos para ser específica por clínica
CREATE OR REPLACE FUNCTION public.buscar_proximos_agendamentos_dia_seguinte(clinica_uuid uuid)
RETURNS TABLE(id uuid, paciente_nome text, paciente_email text, paciente_telefone text, data_agendamento date, horario text, tipo_exame text, medico_nome text, medico_crm text, medico_especialidade text, convenio_nome text, numero_convenio text, status_pagamento text, valor_exame numeric, valor_pago numeric, clinica_nome text, clinica_email text, clinica_telefone text, clinica_endereco text, observacoes_agendamento text)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Log para debug com validação de clínica
    RAISE NOTICE 'Buscando agendamentos ISOLADOS para clínica específica: % na data: %', clinica_uuid, (CURRENT_DATE + INTERVAL '1 day');
    
    RETURN QUERY
    SELECT 
        a.id,
        p.nome as paciente_nome,
        p.email as paciente_email,
        p.telefone as paciente_telefone,
        a.data_agendamento::DATE,
        COALESCE(a.horario, 'A definir') as horario,
        a.tipo_exame,
        COALESCE(m.nome_completo, 'Não definido') as medico_nome,
        COALESCE(m.crm, 'Não informado') as medico_crm,
        COALESCE(m.especialidade, 'Não informado') as medico_especialidade,
        COALESCE(cv.nome, 'Particular') as convenio_nome,
        COALESCE(p.numero_convenio, 'N/A') as numero_convenio,
        COALESCE(a.status_pagamento, 'pendente') as status_pagamento,
        COALESCE(a.valor_exame, 0.00) as valor_exame,
        COALESCE(a.valor_pago, 0.00) as valor_pago,
        cl.nome as clinica_nome,
        cl.email as clinica_email,
        COALESCE(cl.telefone, 'Não informado') as clinica_telefone,
        COALESCE(cl.endereco, 'Não informado') as clinica_endereco,
        COALESCE(a.observacoes, '') as observacoes_agendamento
    FROM agendamentos a
    LEFT JOIN pacientes p ON a.paciente_id = p.id AND p.clinica_id = clinica_uuid  -- ISOLAMENTO CRÍTICO
    LEFT JOIN medicos m ON a.medico_id = m.id AND m.clinica_id = clinica_uuid      -- ISOLAMENTO CRÍTICO
    LEFT JOIN convenios cv ON a.convenio_id = cv.id AND cv.clinica_id = clinica_uuid -- ISOLAMENTO CRÍTICO
    LEFT JOIN clinicas cl ON a.clinica_id = cl.id
    WHERE a.clinica_id = clinica_uuid  -- FILTRO PRINCIPAL
    AND p.clinica_id = clinica_uuid    -- FILTRO DUPLO PACIENTE
    AND a.data_agendamento::DATE = (CURRENT_DATE + INTERVAL '1 day')::DATE
    AND a.status IN ('agendado', 'confirmado')
    AND p.email IS NOT NULL
    AND p.email != ''
    AND p.email != 'N/A'
    AND p.email !~ '^[0-9]+$'
    AND p.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND p.email NOT ILIKE '%@teste%'
    AND p.email NOT ILIKE '%@example%'
    AND p.email NOT ILIKE '%@gmail.co'
    AND p.email NOT ILIKE '%@hotmail.co'
    AND NOT EXISTS (
        SELECT 1 FROM email_lembretes el 
        WHERE el.agendamento_id = a.id 
        AND el.email_paciente = p.email 
        AND el.status_envio = 'enviado'
        AND el.clinica_id = clinica_uuid  -- ISOLAMENTO CRÍTICO
    )
    ORDER BY a.horario NULLS LAST, a.created_at;
END;
$$;
