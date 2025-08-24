-- Registrar a clínica teste-1 no sistema central
INSERT INTO public.clinicas_central (
    id,
    nome_clinica,
    cnpj,
    email_responsavel,
    telefone,
    subdominio,
    database_name,
    database_user,
    database_password_encrypted,
    plano_contratado,
    status,
    database_created,
    database_url
) VALUES (
    gen_random_uuid(),
    'Clínica Teste 1',
    '12.345.678/0001-90',
    'admin@teste1.com',
    '(11) 99999-9999',
    'teste-1',
    'clinica_teste_1',
    'user_teste_1',
    crypt('senha_teste_1_secure', gen_salt('bf')),
    'basico',
    'ativa',
    true,
    'https://tgydssyqgmifcuajacgo.supabase.co'
)
ON CONFLICT (subdominio) DO UPDATE SET
    updated_at = now(),
    ultimo_acesso = now();

-- Criar registro de monitoramento para a clínica teste-1
INSERT INTO public.database_connections_monitor (
    clinica_central_id,
    database_name,
    connection_count,
    status,
    performance_metrics
) 
SELECT 
    cc.id,
    'clinica_teste_1',
    0,
    'active',
    jsonb_build_object(
        'created_at', now(),
        'initial_setup', true,
        'database_size_mb', 0,
        'test_clinic', true
    )
FROM public.clinicas_central cc 
WHERE cc.subdominio = 'teste-1'
ON CONFLICT (clinica_central_id) DO UPDATE SET
    updated_at = now(),
    last_activity = now();