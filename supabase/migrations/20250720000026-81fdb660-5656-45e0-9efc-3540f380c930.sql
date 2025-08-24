
-- Modificar a função para criar assinatura com 30 dias gratuitos
CREATE OR REPLACE FUNCTION public.processar_inscricao_clinica(
    inscricao_id uuid, 
    aprovada boolean DEFAULT true,
    senha_personalizada text DEFAULT NULL
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
    
    -- Definir senha (personalizada ou gerada)
    senha_final := COALESCE(senha_personalizada, 'clinica_' || substr(gen_random_uuid()::text, 1, 8));
    
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
    
    -- Criar configurações da clínica com senha definida
    INSERT INTO public.configuracoes_clinica (
        clinica_id,
        email_login_clinica,
        senha_acesso_clinica,
        codigo_acesso_clinica,
        codigo_acesso_funcionario
    ) VALUES (
        nova_clinica_id,
        inscricao_data.email_responsavel,
        senha_final,
        'clinica_' || substr(nova_clinica_id::text, 1, 8),
        'func_' || substr(nova_clinica_id::text, 1, 8)
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
        'trial', -- Status trial por 30 dias
        1,
        0.00, -- Valor zero para trial
        0.00,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days', -- 30 dias gratuitos
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
        'senha_temporaria', senha_final,
        'trial_dias', 30
    );
    
    RETURN resultado;
END;
$$;

-- Criar tabela para logs administrativos
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_session_id TEXT NOT NULL,
    acao TEXT NOT NULL,
    detalhes JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS na tabela de logs administrativos
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Política para logs administrativos
CREATE POLICY "Permitir inserção de logs administrativos"
ON public.admin_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir leitura de logs administrativos"
ON public.admin_logs
FOR SELECT
USING (true);

-- Criar tabela para controle de sessões administrativas 
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT UNIQUE NOT NULL,
    primeira_senha_alterada BOOLEAN DEFAULT false,
    nova_senha TEXT,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS na tabela de sessões administrativas
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para sessões administrativas
CREATE POLICY "Permitir gerenciamento de sessões administrativas"
ON public.admin_sessions
FOR ALL
USING (true);

-- Atualizar status das assinaturas existentes que devem ser trial
UPDATE public.assinaturas 
SET 
    status = 'trial',
    tipo_plano = 'trial',
    valor_original = 0.00,
    valor = 0.00,
    proximo_pagamento = data_inicio + INTERVAL '30 days'
WHERE 
    status = 'ativa' 
    AND data_inicio >= CURRENT_DATE - INTERVAL '30 days'
    AND valor = 150.00;
