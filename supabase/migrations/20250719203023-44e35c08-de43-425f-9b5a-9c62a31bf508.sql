-- Corrigir função de processamento de inscrições
CREATE OR REPLACE FUNCTION public.processar_inscricao_clinica(inscricao_id uuid, aprovada boolean DEFAULT true)
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
    
    -- Criar configurações da clínica com senha personalizada
    INSERT INTO public.configuracoes_clinica (
        clinica_id,
        email_login_clinica,
        senha_acesso_clinica,
        codigo_acesso_clinica,
        codigo_acesso_funcionario
    ) VALUES (
        nova_clinica_id,
        inscricao_data.email_responsavel,
        'clinica_' || substr(nova_clinica_id::text, 1, 8),
        'clinica_' || substr(nova_clinica_id::text, 1, 8),
        'func_' || substr(nova_clinica_id::text, 1, 8)
    );
    
    -- Criar assinatura padrão (corrigindo o erro do plano_id)
    INSERT INTO public.assinaturas (
        clinica_id,
        status,
        periodo_meses,
        valor_original,
        valor,
        data_inicio,
        limite_funcionarios,
        limite_medicos,
        tipo_plano
    ) VALUES (
        nova_clinica_id,
        'ativa',
        1,
        150.00,
        150.00,
        CURRENT_DATE,
        4,
        5,
        'basico'
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
        'senha_temporaria', 'clinica_' || substr(nova_clinica_id::text, 1, 8)
    );
    
    RETURN resultado;
END;
$$;

-- Criar indexes para melhorar performance
CREATE INDEX IF NOT EXISTS idx_clinicas_subdominio ON clinicas(subdominio);
CREATE INDEX IF NOT EXISTS idx_configuracoes_clinica_id ON configuracoes_clinica(clinica_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_clinica_id ON assinaturas(clinica_id);

-- Inserir configurações para clínicas existentes que não têm
INSERT INTO public.configuracoes_clinica (
    clinica_id,
    email_login_clinica,
    senha_acesso_clinica,
    codigo_acesso_clinica,
    codigo_acesso_funcionario
)
SELECT 
    c.id,
    c.email,
    'clinica_' || substr(c.id::text, 1, 8),
    'clinica_' || substr(c.id::text, 1, 8),
    'func_' || substr(c.id::text, 1, 8)
FROM clinicas c
WHERE NOT EXISTS (
    SELECT 1 FROM configuracoes_clinica cc WHERE cc.clinica_id = c.id
);

-- Garantir que todas as clínicas tenham assinaturas
INSERT INTO public.assinaturas (
    clinica_id,
    status,
    periodo_meses,
    valor_original,
    valor,
    data_inicio,
    limite_funcionarios,
    limite_medicos,
    tipo_plano
)
SELECT 
    c.id,
    'ativa',
    1,
    150.00,
    150.00,
    CURRENT_DATE,
    4,
    5,
    'basico'
FROM clinicas c
WHERE NOT EXISTS (
    SELECT 1 FROM assinaturas a WHERE a.clinica_id = c.id
);