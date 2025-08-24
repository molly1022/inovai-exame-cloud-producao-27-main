-- Limpeza completa do banco mantendo apenas a clínica Unimed (cd66c1b3-3684-4358-a0cf-b51d8b75041f)
-- Versão final corrigida respeitando todas as foreign key constraints

-- 1. Excluir registros da tabela usuarios primeiro
DELETE FROM public.usuarios 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

-- 2. Excluir user_preferences de outras clínicas
DELETE FROM public.user_preferences 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

-- 3. Excluir dados relacionados de todas as clínicas EXCETO a Unimed
DELETE FROM public.agendamentos_historico 
WHERE agendamento_id IN (
    SELECT id FROM public.agendamentos 
    WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f'
);

DELETE FROM public.repasses_medicos 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.atestados_medicos 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.teleconsulta_mensagens 
WHERE teleconsulta_id IN (
    SELECT id FROM public.teleconsultas 
    WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f'
);

DELETE FROM public.teleconsulta_participantes 
WHERE teleconsulta_id IN (
    SELECT id FROM public.teleconsultas 
    WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f'
);

DELETE FROM public.teleconsultas 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.teleconsultas_uso_mensal 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.exames 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.agendamentos 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.funcionarios_logs 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.medicos_logs 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.funcionarios_sessoes 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.medicos_sessoes 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.faturas_medicos_mensais 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.cobranca_detalhada 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.reagendamentos 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.notificacoes_pagamento 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.email_lembretes 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

-- 4. Excluir usuários de outras clínicas
DELETE FROM public.medicos_indisponibilidade 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.medicos_login 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.pacientes 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.medicos 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.funcionarios 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

-- 5. Excluir configurações de outras clínicas
DELETE FROM public.configuracoes_email 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.configuracoes_automacao 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.assinaturas 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.convenios 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.categorias_exames 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.exames_valores 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.configuracoes_clinica 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

-- 6. Excluir outras clínicas (manter apenas a Unimed)
DELETE FROM public.clinicas 
WHERE id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

-- 7. Limpar códigos de recuperação e logs antigos
DELETE FROM public.codigos_recuperacao 
WHERE clinica_id != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

DELETE FROM public.logs_acesso 
WHERE detalhes->>'clinic_id' != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f' 
AND detalhes->>'clinica_id' != 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

-- Log da operação de limpeza
INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
    'LIMPEZA_BANCO_DADOS',
    'sistema',
    jsonb_build_object(
        'clinica_mantida', 'cd66c1b3-3684-4358-a0cf-b51d8b75041f',
        'clinica_nome', 'Unimed',
        'executado_em', now(),
        'operacao', 'Limpeza completa mantendo apenas Unimed'
    )
);