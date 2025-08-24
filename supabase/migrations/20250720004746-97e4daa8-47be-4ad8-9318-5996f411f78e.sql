
-- Corrigir função duplicada de processamento de inscrições
DROP FUNCTION IF EXISTS public.processar_inscricao_clinica(uuid, boolean, text);

-- Manter apenas a função que usa senha_escolhida da clínica
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
    senha_final TEXT;
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
    
    -- Usar senha escolhida pela clínica ou gerar uma padrão
    senha_final := COALESCE(inscricao_data.senha_escolhida, 'clinica_' || substr(gen_random_uuid()::text, 1, 8));
    
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
    
    -- Criar configurações da clínica com senha escolhida
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
        senha_final,
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
        'senha_escolhida', senha_final,
        'trial_dias', 30
    );
    
    RETURN resultado;
END;
$$;

-- Criar tabela para configurações de verificação automática
CREATE TABLE IF NOT EXISTS public.configuracoes_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verificacao_automatica_ativa BOOLEAN DEFAULT false,
    tempo_verificacao_minutos INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.configuracoes_sistema (verificacao_automatica_ativa) 
VALUES (false) 
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Política para configurações do sistema
CREATE POLICY "Permitir acesso total às configurações do sistema"
ON public.configuracoes_sistema
FOR ALL
USING (true);

-- Criar tabela para notificações de pagamento
CREATE TABLE IF NOT EXISTS public.notificacoes_pagamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID NOT NULL,
    tipo_notificacao TEXT NOT NULL CHECK (tipo_notificacao IN ('7_dias', '3_dias', '1_dia', 'vencido')),
    data_vencimento DATE NOT NULL,
    status_envio TEXT DEFAULT 'pendente' CHECK (status_envio IN ('pendente', 'enviado', 'erro')),
    tentativas INTEGER DEFAULT 0,
    ultimo_erro TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notificacoes_pagamento ENABLE ROW LEVEL SECURITY;

-- Política para notificações
CREATE POLICY "Permitir acesso total às notificações"
ON public.notificacoes_pagamento
FOR ALL
USING (true);

-- Função para obter métricas financeiras completas
CREATE OR REPLACE FUNCTION public.obter_metricas_financeiras_completas()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_trial INTEGER;
    total_pagas INTEGER;
    faturamento_atual NUMERIC;
    faturamento_projetado NUMERIC;
    conversao_rate NUMERIC;
    churn_rate NUMERIC;
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
    
    -- Faturamento atual mensal
    SELECT COALESCE(SUM(valor), 0) INTO faturamento_atual
    FROM public.assinaturas
    WHERE status = 'ativa' AND tipo_plano != 'trial';
    
    -- Faturamento projetado (incluindo trials que podem converter)
    SELECT COALESCE(SUM(150.00), 0) INTO faturamento_projetado
    FROM public.assinaturas
    WHERE status IN ('trial', 'ativa');
    
    -- Taxa de conversão (aproximada)
    IF total_trial > 0 THEN
        conversao_rate := (total_pagas::NUMERIC / (total_trial + total_pagas)) * 100;
    ELSE
        conversao_rate := 0;
    END IF;
    
    -- Taxa de cancelamento (estimativa simples)
    churn_rate := 5.0; -- Placeholder - seria calculado com dados históricos
    
    resultado := json_build_object(
        'total_trial', total_trial,
        'total_pagas', total_pagas,
        'faturamento_atual', faturamento_atual,
        'faturamento_projetado', faturamento_projetado,
        'conversao_rate', conversao_rate,
        'churn_rate', churn_rate,
        'crescimento_mensal', ((faturamento_projetado - faturamento_atual) / NULLIF(faturamento_atual, 0)) * 100
    );
    
    RETURN resultado;
END;
$$;

-- Função para obter clínicas próximas do vencimento
CREATE OR REPLACE FUNCTION public.obter_clinicas_vencimento()
RETURNS TABLE(
    clinica_id UUID,
    nome_clinica TEXT,
    email_clinica TEXT,
    data_vencimento DATE,
    dias_restantes INTEGER,
    valor_assinatura NUMERIC,
    status_assinatura TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nome,
        c.email,
        a.proximo_pagamento,
        (a.proximo_pagamento - CURRENT_DATE)::INTEGER,
        a.valor,
        a.status
    FROM public.clinicas c
    JOIN public.assinaturas a ON c.id = a.clinica_id
    WHERE a.proximo_pagamento <= CURRENT_DATE + INTERVAL '30 days'
    AND a.status IN ('ativa', 'trial')
    ORDER BY a.proximo_pagamento ASC;
END;
$$;

-- Função para processar verificação automática
CREATE OR REPLACE FUNCTION public.processar_verificacao_automatica()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    config_record RECORD;
    inscricao_record RECORD;
    processadas INTEGER := 0;
    resultado JSON;
BEGIN
    -- Verificar se a verificação automática está ativa
    SELECT * INTO config_record 
    FROM public.configuracoes_sistema 
    LIMIT 1;
    
    IF NOT FOUND OR NOT config_record.verificacao_automatica_ativa THEN
        RETURN '{"success": false, "message": "Verificação automática não está ativa"}';
    END IF;
    
    -- Processar todas as inscrições pendentes
    FOR inscricao_record IN 
        SELECT id FROM public.inscricoes_pendentes 
        WHERE status = 'pendente'
        ORDER BY created_at ASC
    LOOP
        -- Processar cada inscrição
        PERFORM public.processar_inscricao_clinica(inscricao_record.id, true);
        processadas := processadas + 1;
    END LOOP;
    
    resultado := json_build_object(
        'success', true,
        'processadas', processadas,
        'timestamp', now()
    );
    
    RETURN resultado;
END;
$$;
