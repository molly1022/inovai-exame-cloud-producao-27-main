-- Adicionar campo senha_escolhida na tabela inscricoes_pendentes
ALTER TABLE public.inscricoes_pendentes 
ADD COLUMN IF NOT EXISTS senha_escolhida TEXT;

-- Adicionar campo para controle de verificação automática
ALTER TABLE public.configuracoes_clinica 
ADD COLUMN IF NOT EXISTS verificacao_automatica BOOLEAN DEFAULT false;

-- Modificar função para usar senha escolhida pela clínica
CREATE OR REPLACE FUNCTION public.processar_inscricao_clinica(
    inscricao_id uuid, 
    aprovada boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    inscricao_data RECORD;
    nova_clinica_id UUID;
    resultado JSON;
BEGIN
    -- Buscar dados da inscrição
    SELECT * INTO inscricao_data 
    FROM public.inscricoes_pendentes 
    WHERE id = inscricao_id AND status = 'pendente';
    
    IF NOT FOUND THEN
        RETURN '{"success": false, "error": "Inscrição não encontrada ou já processada"}';
    END IF;
    
    IF NOT aprovada THEN
        -- Rejeitar inscrição
        UPDATE public.inscricoes_pendentes 
        SET status = 'rejeitada', 
            processada_em = now(),
            updated_at = now()
        WHERE id = inscricao_id;
        
        RETURN '{"success": true, "action": "rejeitada"}';
    END IF;
    
    -- Criar nova clínica
    nova_clinica_id := gen_random_uuid();
    
    INSERT INTO public.clinicas (
        id, nome, email, telefone, subdominio, created_at, updated_at
    ) VALUES (
        nova_clinica_id,
        inscricao_data.nome_clinica,
        inscricao_data.email_responsavel,
        inscricao_data.telefone,
        inscricao_data.subdominio_solicitado,
        now(),
        now()
    );
    
    -- Usar senha escolhida pela clínica ou gerar uma padrão
    INSERT INTO public.configuracoes_clinica (
        clinica_id,
        email_login_clinica,
        senha_acesso_clinica,
        codigo_acesso_clinica,
        codigo_acesso_funcionario,
        verificacao_automatica
    ) VALUES (
        nova_clinica_id,
        inscricao_data.email_responsavel,
        COALESCE(inscricao_data.senha_escolhida, 'clinica_' || substr(nova_clinica_id::text, 1, 8)),
        'clinica_' || substr(nova_clinica_id::text, 1, 8),
        'func_' || substr(nova_clinica_id::text, 1, 8),
        false
    );
    
    -- Criar assinatura com 30 dias gratuitos de trial
    INSERT INTO public.assinaturas (
        clinica_id,
        status,
        periodo_meses,
        valor_original,
        valor,
        data_inicio,
        proximo_pagamento,
        limite_funcionarios,
        limite_medicos,
        tipo_plano
    ) VALUES (
        nova_clinica_id,
        'trial',
        1,
        0.00,
        0.00,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        4,
        5,
        'trial'
    );
    
    -- Marcar inscrição como aprovada
    UPDATE public.inscricoes_pendentes 
    SET status = 'aprovada', 
        processada_em = now(),
        updated_at = now()
    WHERE id = inscricao_id;
    
    resultado := json_build_object(
        'success', true,
        'action', 'aprovada',
        'clinica_id', nova_clinica_id,
        'subdominio', inscricao_data.subdominio_solicitado,
        'email', inscricao_data.email_responsavel,
        'senha_escolhida', COALESCE(inscricao_data.senha_escolhida, 'clinica_' || substr(nova_clinica_id::text, 1, 8)),
        'trial_dias', 30
    );
    
    RETURN resultado;
END;
$$;

-- Função para obter estatísticas financeiras do admin
CREATE OR REPLACE FUNCTION public.obter_estatisticas_financeiras()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_trial INTEGER;
    total_pagas INTEGER;
    faturamento_mensal NUMERIC;
    resultado JSON;
BEGIN
    -- Contar clínicas em trial
    SELECT COUNT(*) INTO total_trial
    FROM public.assinaturas
    WHERE status = 'trial' AND tipo_plano = 'trial';
    
    -- Contar clínicas pagantes
    SELECT COUNT(*) INTO total_pagas
    FROM public.assinaturas
    WHERE status = 'ativa' AND tipo_plano != 'trial';
    
    -- Calcular faturamento mensal
    SELECT COALESCE(SUM(valor), 0) INTO faturamento_mensal
    FROM public.assinaturas
    WHERE status = 'ativa' AND tipo_plano != 'trial';
    
    resultado := json_build_object(
        'total_trial', total_trial,
        'total_pagas', total_pagas,
        'faturamento_mensal', faturamento_mensal
    );
    
    RETURN resultado;
END;
$$;