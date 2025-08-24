-- FASE 1: LIMPEZA DO BANCO MODELO (CORRIGIDA)
-- Remove tabelas administrativas que não devem estar no banco de clínicas individuais

-- 1. Primeiro limpar tabelas com foreign keys em ordem correta
DELETE FROM public.teleconsultas;
DELETE FROM public.teleconsulta_participantes;
DELETE FROM public.teleconsultas_uso_mensal;
DELETE FROM public.agendamentos_historico;
DELETE FROM public.anotacoes_medicas;
DELETE FROM public.atestados_medicos;
DELETE FROM public.receitas_medicas;
DELETE FROM public.agendamentos;
DELETE FROM public.exames;
DELETE FROM public.lista_espera_agendamentos;
DELETE FROM public.funcionarios_logs;
DELETE FROM public.funcionarios_sessoes;
DELETE FROM public.funcionarios_login;
DELETE FROM public.funcionarios;
DELETE FROM public.medicos_indisponibilidade;
DELETE FROM public.medicos_logs;
DELETE FROM public.medicos_sessoes;
DELETE FROM public.medicos_login;
DELETE FROM public.medicos;
DELETE FROM public.pacientes;
DELETE FROM public.email_lembretes;
DELETE FROM public.logs_acesso;
DELETE FROM public.notificacoes_pagamento;
DELETE FROM public.codigos_recuperacao;
DELETE FROM public.assinaturas;
DELETE FROM public.repasses_medicos;
DELETE FROM public.faturas_medicos_mensais;

-- 2. Remover tabelas administrativas
DROP TABLE IF EXISTS public.clinicas_central CASCADE;
DROP TABLE IF EXISTS public.admin_operacoes_log CASCADE;
DROP TABLE IF EXISTS public.admin_profiles CASCADE;
DROP TABLE IF EXISTS public.admin_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.database_connections_monitor CASCADE;
DROP TABLE IF EXISTS public.configuracoes_sistema_central CASCADE;

-- 3. Manter apenas uma clínica modelo
DELETE FROM public.clinicas WHERE nome != 'Clínica Modelo';
UPDATE public.clinicas 
SET 
    nome = 'Clínica Modelo',
    email = 'modelo@clinica.com',
    telefone = '(00) 0000-0000',
    endereco = 'Endereço Modelo',
    cnpj = '00.000.000/0001-00',
    subdominio = 'modelo',
    user_id = NULL,
    ativo = true,
    endereco_completo = 'Endereço Completo Modelo',
    foto_perfil_url = NULL
WHERE nome = 'Clínica Modelo';

-- Se não existe clínica modelo, criar uma
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
) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM public.clinicas WHERE nome = 'Clínica Modelo');

-- 4. Atualizar configurações da clínica modelo
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