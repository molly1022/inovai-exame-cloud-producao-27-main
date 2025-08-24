-- Continuar limpeza após remoção dos triggers
-- Limpar dados das tabelas operacionais (manter estrutura)
DELETE FROM public.agendamentos;
DELETE FROM public.agendamentos_historico;
DELETE FROM public.anotacoes_medicas;
DELETE FROM public.atestados_medicos;
DELETE FROM public.receitas_medicas;
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