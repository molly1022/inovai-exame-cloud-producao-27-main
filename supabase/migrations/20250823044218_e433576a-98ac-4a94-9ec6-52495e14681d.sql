-- FASE 1: LIMPEZA DO BANCO MODELO
-- Remove tabelas administrativas que não devem estar no banco de clínicas individuais

-- 1. Remover tabelas administrativas
DROP TABLE IF EXISTS public.clinicas_central CASCADE;
DROP TABLE IF EXISTS public.admin_operacoes_log CASCADE;
DROP TABLE IF EXISTS public.admin_profiles CASCADE;
DROP TABLE IF EXISTS public.admin_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.database_connections_monitor CASCADE;
DROP TABLE IF EXISTS public.configuracoes_sistema_central CASCADE;

-- 2. Limpar dados de teste das tabelas operacionais (manter estrutura)
-- Manter apenas 1 clínica modelo para referência
DELETE FROM public.agendamentos;
DELETE FROM public.agendamentos_historico;
DELETE FROM public.anotacoes_medicas;
DELETE FROM public.atestados_medicos;
DELETE FROM public.exames;
DELETE FROM public.funcionarios_logs;
DELETE FROM public.funcionarios_sessoes;
DELETE FROM public.medicos_logs;
DELETE FROM public.medicos_sessoes;
DELETE FROM public.email_lembretes;
DELETE FROM public.logs_acesso;
DELETE FROM public.notificacoes_pagamento;
DELETE FROM public.codigos_recuperacao;

-- Limpar dados de médicos, funcionários e pacientes
DELETE FROM public.funcionarios_login;
DELETE FROM public.medicos_login;
DELETE FROM public.funcionarios;
DELETE FROM public.medicos_indisponibilidade;
DELETE FROM public.medicos;
DELETE FROM public.pacientes;

-- Limpar lista de espera
DELETE FROM public.lista_espera_agendamentos;

-- 3. Manter apenas estruturas de configuração padrão
-- Limpar assinaturas antigas
DELETE FROM public.assinaturas;

-- Manter apenas uma clínica modelo
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

-- 5. Criar configurações padrão
DELETE FROM public.configuracoes_email;
INSERT INTO public.configuracoes_email (
    clinica_id,
    ativo,
    remetente_nome,
    remetente_email,
    assunto_email,
    template_personalizado,
    horas_antecedencia,
    horario_envio
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    true,
    'Clínica Modelo',
    'noreply@clinicamodelo.com',
    'Lembrete: Consulta agendada para amanhã',
    'Prezado(a) {nome_paciente}, lembramos que você tem uma consulta agendada para amanhã às {horario} com Dr(a). {nome_medico}.',
    24,
    '18:00'::time
);

DELETE FROM public.configuracoes_automacao;
INSERT INTO public.configuracoes_automacao (
    clinica_id,
    ativo,
    dias_funcionamento,
    horario_inicio,
    horario_fim,
    auto_confirmacao_minutos,
    tolerancia_atraso_minutos,
    tempo_minimo_consulta_minutos
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    true,
    ARRAY[1,2,3,4,5], -- Segunda a Sexta
    '08:00'::time,
    '18:00'::time,
    30,
    15,
    10
);

-- 6. Criar categorias padrão
DELETE FROM public.categorias_exames;
INSERT INTO public.categorias_exames (clinica_id, nome, descricao, valor, ativo, cor) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Consulta Geral', 'Consulta médica geral', 150.00, true, '#3B82F6'),
('00000000-0000-0000-0000-000000000001'::uuid, 'Exame Laboratorial', 'Exames de laboratório', 80.00, true, '#10B981'),
('00000000-0000-0000-0000-000000000001'::uuid, 'Ultrassom', 'Exame de ultrassom', 200.00, true, '#8B5CF6');

-- 7. Criar convênios padrão
DELETE FROM public.convenios;
INSERT INTO public.convenios (clinica_id, nome, descricao, percentual_desconto, ativo, cor) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Particular', 'Pacientes particulares', 0.00, true, '#6B7280'),
('00000000-0000-0000-0000-000000000001'::uuid, 'Plano Saúde A', 'Convênio exemplo A', 10.00, true, '#EF4444'),
('00000000-0000-0000-0000-000000000001'::uuid, 'Plano Saúde B', 'Convênio exemplo B', 15.00, true, '#F59E0B');

-- 8. Sincronizar valores de exames
DELETE FROM public.exames_valores;
INSERT INTO public.exames_valores (clinica_id, tipo_exame, valor, descricao, ativo)
SELECT clinica_id, nome, valor, descricao, ativo
FROM public.categorias_exames
WHERE clinica_id = '00000000-0000-0000-0000-000000000001'::uuid;

-- 9. Log da limpeza
INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
VALUES ('LIMPEZA_BANCO_MODELO', 'sistema', jsonb_build_object(
    'operacao', 'limpeza_completa_banco_modelo',
    'data_limpeza', now(),
    'tabelas_removidas', ARRAY['clinicas_central', 'admin_operacoes_log', 'admin_profiles', 'admin_sessions', 'admin_users', 'database_connections_monitor', 'configuracoes_sistema_central'],
    'dados_limpos', true,
    'clinica_modelo_criada', true
));