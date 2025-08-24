-- Dropar função existente e recriar com dados completos
DROP FUNCTION IF EXISTS public.buscar_proximos_agendamentos_dia_seguinte(uuid);

-- Criar função nova com todos os dados necessários para emails elegantes
CREATE OR REPLACE FUNCTION public.buscar_proximos_agendamentos_dia_seguinte(clinica_uuid uuid)
 RETURNS TABLE(
    id uuid, 
    paciente_nome text, 
    paciente_email text, 
    paciente_telefone text,
    data_agendamento date, 
    horario text, 
    tipo_exame text, 
    medico_nome text,
    medico_crm text,
    medico_especialidade text,
    convenio_nome text,
    numero_convenio text,
    status_pagamento text,
    valor_exame numeric,
    valor_pago numeric,
    clinica_nome text,
    clinica_email text,
    clinica_telefone text,
    clinica_endereco text,
    observacoes_agendamento text
 )
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Log para debug
    RAISE NOTICE 'Buscando agendamentos completos para clínica: % na data: %', clinica_uuid, (CURRENT_DATE + INTERVAL '1 day');
    
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
    LEFT JOIN pacientes p ON a.paciente_id = p.id
    LEFT JOIN medicos m ON a.medico_id = m.id
    LEFT JOIN convenios cv ON a.convenio_id = cv.id
    LEFT JOIN clinicas cl ON a.clinica_id = cl.id
    WHERE a.clinica_id = clinica_uuid
    AND a.data_agendamento::DATE = (CURRENT_DATE + INTERVAL '1 day')::DATE
    AND a.status IN ('agendado', 'confirmado')
    AND p.email IS NOT NULL
    AND p.email != ''
    AND p.email != 'N/A'
    AND p.email !~ '^[0-9]+$'  -- Não números puros
    AND p.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'  -- Formato básico de email
    AND p.email NOT ILIKE '%@teste%'
    AND p.email NOT ILIKE '%@example%'
    AND p.email NOT ILIKE '%@gmail.co'
    AND p.email NOT ILIKE '%@hotmail.co'
    -- Filtrar agendamentos que JÁ TÊM lembretes enviados com sucesso
    AND NOT EXISTS (
        SELECT 1 FROM email_lembretes el 
        WHERE el.agendamento_id = a.id 
        AND el.email_paciente = p.email 
        AND el.status_envio = 'enviado'
        AND el.clinica_id = clinica_uuid
    )
    ORDER BY a.horario NULLS LAST, a.created_at;
END;
$function$;