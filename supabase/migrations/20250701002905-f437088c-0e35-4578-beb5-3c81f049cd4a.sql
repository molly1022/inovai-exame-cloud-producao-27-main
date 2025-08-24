
-- Remover a coluna email_teste que está causando confusão
ALTER TABLE public.configuracoes_email DROP COLUMN IF EXISTS email_teste;

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
    
    RETURN emails_limpos;
END;
$$ LANGUAGE plpgsql;

-- Criar função para buscar próximos agendamentos do dia seguinte
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
    AND a.data_agendamento = (CURRENT_DATE + INTERVAL '1 day')::DATE
    AND a.status IN ('agendado', 'confirmado')
    AND p.email IS NOT NULL
    AND p.email != ''
    AND validar_email(p.email) = true
    ORDER BY a.data_agendamento, a.horario;
END;
$$ LANGUAGE plpgsql;
