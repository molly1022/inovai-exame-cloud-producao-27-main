
-- Melhorar a função de busca de próximos agendamentos
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
    -- Log para debug
    RAISE NOTICE 'Buscando agendamentos para clínica: % na data: %', clinica_uuid, (CURRENT_DATE + INTERVAL '1 day');
    
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
    ORDER BY a.horario NULLS LAST, a.created_at;
END;
$$ LANGUAGE plpgsql;

-- Melhorar a função de limpeza de emails antigos
CREATE OR REPLACE FUNCTION limpar_emails_antigos()
RETURNS INTEGER AS $$
DECLARE
    emails_limpos INTEGER;
BEGIN
    -- Marcar como cancelado emails com erro há mais de 24 horas
    UPDATE email_lembretes 
    SET status_envio = 'cancelado',
        updated_at = NOW()
    WHERE status_envio = 'erro' 
    AND created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS emails_limpos = ROW_COUNT;
    
    -- Log da operação
    INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
    VALUES ('limpeza_automatica', 'email_lembretes', 
            jsonb_build_object('emails_limpos', emails_limpos, 'executado_em', NOW()));
    
    -- Log para debug
    RAISE NOTICE 'Emails limpos: %', emails_limpos;
    
    RETURN emails_limpos;
END;
$$ LANGUAGE plpgsql;

-- Criar tabela para preferências do usuário (se não existir)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id),
    user_type TEXT NOT NULL DEFAULT 'admin',
    preference_key TEXT NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinica_id, user_type, preference_key)
);

-- Habilitar RLS na tabela user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir acesso apenas à própria clínica
CREATE POLICY "Users can manage their clinic preferences" 
    ON public.user_preferences 
    FOR ALL 
    USING (clinica_id IN (
        SELECT id FROM clinicas WHERE user_id = auth.uid()
        UNION ALL
        SELECT '00000000-0000-0000-0000-000000000001'::uuid
    ));
