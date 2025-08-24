-- Finalizar configuração do banco modelo limpo (sem triggers problemáticos)

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

-- Criar configurações padrão
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

-- Criar categorias padrão
DELETE FROM public.categorias_exames;
INSERT INTO public.categorias_exames (clinica_id, nome, descricao, valor, ativo, cor) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Consulta Geral', 'Consulta médica geral', 150.00, true, '#3B82F6'),
('00000000-0000-0000-0000-000000000001'::uuid, 'Exame Laboratorial', 'Exames de laboratório', 80.00, true, '#10B981'),
('00000000-0000-0000-0000-000000000001'::uuid, 'Ultrassom', 'Exame de ultrassom', 200.00, true, '#8B5CF6');

-- Criar convênios padrão
DELETE FROM public.convenios;
INSERT INTO public.convenios (clinica_id, nome, descricao, percentual_desconto, ativo, cor) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Particular', 'Pacientes particulares', 0.00, true, '#6B7280'),
('00000000-0000-0000-0000-000000000001'::uuid, 'Plano Saúde A', 'Convênio exemplo A', 10.00, true, '#EF4444'),
('00000000-0000-0000-0000-000000000001'::uuid, 'Plano Saúde B', 'Convênio exemplo B', 15.00, true, '#F59E0B');