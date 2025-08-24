
-- Simplificar e corrigir a função para mostrar novos agendamentos
CREATE OR REPLACE FUNCTION buscar_proximos_agendamentos_dia_seguinte(clinica_uuid UUID)
RETURNS TABLE (
    id UUID,
    paciente_nome TEXT,
    paciente_email TEXT,
    data_agendamento DATE,
    horario TEXT,
    tipo_exame TEXT,
    medico_nome TEXT
) AS $$
BEGIN
    -- Log melhorado para debug
    RAISE NOTICE 'Buscando agendamentos para clínica: % na data: %', clinica_uuid, (CURRENT_DATE + INTERVAL '1 day')::DATE;
    
    RETURN QUERY
    SELECT 
        a.id,
        p.nome as paciente_nome,
        p.email as paciente_email,
        a.data_agendamento::DATE,
        COALESCE(a.horario, 'A definir') as horario,
        a.tipo_exame,
        COALESCE(m.nome_completo, 'Não definido') as medico_nome
    FROM agendamentos a
    LEFT JOIN pacientes p ON a.paciente_id = p.id
    LEFT JOIN medicos m ON a.medico_id = m.id
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
    -- Filtro mais específico: só ocultar se há lembrete enviado nas últimas 24h
    AND NOT EXISTS (
        SELECT 1 FROM email_lembretes el 
        WHERE el.agendamento_id = a.id 
        AND el.email_paciente = p.email 
        AND el.status_envio = 'enviado'
        AND el.clinica_id = clinica_uuid
        AND el.data_envio >= (CURRENT_TIMESTAMP - INTERVAL '24 hours') -- Só ocultar se enviado recentemente
    )
    ORDER BY a.horario NULLS LAST, a.created_at;
    
    -- Log do resultado
    GET DIAGNOSTICS result_count = ROW_COUNT;
    RAISE NOTICE 'Encontrados % agendamentos para envio', result_count;
END;
$$ LANGUAGE plpgsql;
