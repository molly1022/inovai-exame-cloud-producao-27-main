-- Atualizar senhas temporárias para o padrão correto
UPDATE public.medicos_login 
SET senha = LOWER(REPLACE(m.nome_completo, ' ', '')) || RIGHT(m.cpf, 4)
FROM public.medicos m
WHERE medicos_login.medico_id = m.id
AND medicos_login.senha = 'senha_temporaria';

-- Log da correção
INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
    'SENHAS_TEMPORARIAS_CORRIGIDAS',
    'medicos_login',
    jsonb_build_object(
        'data_correcao', now(),
        'observacao', 'Senhas temporárias convertidas para padrão automático'
    )
);