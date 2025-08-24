-- Finalizar configuração do banco modelo limpo

-- Limpar dados restantes (se ainda existirem)
TRUNCATE TABLE public.agendamentos, public.agendamentos_historico, public.anotacoes_medicas, 
                public.atestados_medicos, public.exames, public.funcionarios_logs, 
                public.funcionarios_sessoes, public.funcionarios_login, public.funcionarios,
                public.medicos_indisponibilidade, public.medicos_logs, public.medicos_sessoes,
                public.medicos_login, public.medicos, public.pacientes, public.email_lembretes,
                public.logs_acesso, public.notificacoes_pagamento, public.codigos_recuperacao,
                public.assinaturas, public.lista_espera_agendamentos, public.teleconsultas,
                public.teleconsulta_participantes, public.teleconsultas_uso_mensal RESTART IDENTITY CASCADE;

-- Configurar clínica modelo
DELETE FROM public.clinicas;
INSERT INTO public.clinicas (
    id,
    nome,
    email,
    telefone,
    endereco,
    cnpj,
    subdominio,
    user_id,
    ativo,
    endereco_completo
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Clínica Modelo',
    'modelo@clinica.com',
    '(00) 0000-0000',
    'Endereço Modelo',
    '00.000.000/0001-00',
    'modelo',
    NULL,
    true,
    'Endereço Completo Modelo'
);

-- Configurar configurações da clínica modelo
DELETE FROM public.configuracoes_clinica;
INSERT INTO public.configuracoes_clinica (
    clinica_id,
    email_login_clinica,
    senha_hash_secure,
    codigo_acesso_admin,
    codigo_acesso_clinica,
    codigo_acesso_funcionario,
    verificacao_automatica,
    telemedicina_ativa,
    mfa_enabled,
    account_locked,
    email_verified,
    failed_login_attempts,
    requires_password_change
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@clinicamodelo.com',
    crypt('clinica@modelo2024', gen_salt('bf')),
    'admin_modelo',
    'clinica_modelo',
    'func_modelo',
    false,
    false,
    false,
    false,
    true,
    0,
    false
);

-- Log da limpeza completa
INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
VALUES ('LIMPEZA_BANCO_MODELO_COMPLETA', 'sistema', jsonb_build_object(
    'operacao', 'limpeza_completa_banco_modelo',
    'data_limpeza', now(),
    'status', 'sucesso',
    'banco_preparado_para_clonagem', true
));