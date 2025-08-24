-- Criar registro da clínica teste-1 na tabela principal
-- Primeiro verificar se já existe, se não inserir
DO $$
BEGIN
    -- Inserir na tabela clinicas
    INSERT INTO public.clinicas (
        id,
        nome,
        email,
        telefone,
        subdominio,
        ativo,
        created_at,
        updated_at
    ) VALUES (
        '189bf3a1-2557-4ec5-8306-fd357a773602',
        'Clínica Teste 1',
        'admin@teste1.com',
        '(11) 99999-9999',
        'teste-1',
        true,
        now(),
        now()
    );
EXCEPTION WHEN unique_violation THEN
    -- Se já existe, apenas atualizar
    UPDATE public.clinicas SET
        nome = 'Clínica Teste 1',
        email = 'admin@teste1.com',
        telefone = '(11) 99999-9999',
        subdominio = 'teste-1',
        updated_at = now()
    WHERE id = '189bf3a1-2557-4ec5-8306-fd357a773602';
END $$;

-- Inserir configurações de login
DO $$
BEGIN
    INSERT INTO public.configuracoes_clinica (
        clinica_id,
        email_login_clinica,
        senha_acesso_clinica,
        senha_hash_secure,
        codigo_acesso_admin,
        email_verified,
        requires_password_change,
        mfa_enabled,
        account_locked,
        failed_login_attempts,
        created_at,
        updated_at
    ) VALUES (
        '189bf3a1-2557-4ec5-8306-fd357a773602',
        'admin@teste1.com',
        'teste123',
        crypt('teste123', gen_salt('bf')),
        'admin_teste1',
        true,
        false,
        false,
        false,
        0,
        now(),
        now()
    );
EXCEPTION WHEN unique_violation THEN
    -- Se já existe, apenas atualizar
    UPDATE public.configuracoes_clinica SET
        email_login_clinica = 'admin@teste1.com',
        senha_acesso_clinica = 'teste123',
        senha_hash_secure = crypt('teste123', gen_salt('bf')),
        updated_at = now()
    WHERE clinica_id = '189bf3a1-2557-4ec5-8306-fd357a773602';
END $$;

-- Inserir assinatura trial
DO $$
BEGIN
    INSERT INTO public.assinaturas (
        clinica_id,
        tipo_plano,
        periodo_meses,
        valor,
        status,
        data_inicio,
        proximo_pagamento,
        created_at,
        updated_at
    ) VALUES (
        '189bf3a1-2557-4ec5-8306-fd357a773602',
        'trial',
        1,
        0.00,
        'trial',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        now(),
        now()
    );
EXCEPTION WHEN unique_violation THEN
    -- Se já existe, apenas atualizar
    UPDATE public.assinaturas SET
        status = 'trial',
        updated_at = now()
    WHERE clinica_id = '189bf3a1-2557-4ec5-8306-fd357a773602';
END $$;