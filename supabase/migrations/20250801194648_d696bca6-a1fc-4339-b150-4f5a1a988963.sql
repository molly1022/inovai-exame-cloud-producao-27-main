-- Corrigir médicos existentes sem login
-- Buscar médicos que não têm login e criar automaticamente
INSERT INTO public.medicos_login (medico_id, clinica_id, cpf, senha)
SELECT 
    m.id,
    m.clinica_id,
    m.cpf,
    LOWER(REPLACE(m.nome_completo, ' ', '')) || RIGHT(m.cpf, 4) as senha_automatica
FROM public.medicos m
LEFT JOIN public.medicos_login ml ON m.id = ml.medico_id
WHERE ml.medico_id IS NULL
AND m.ativo = true;

-- Log da correção
INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
SELECT 
    'LOGIN_MEDICO_CORRIGIDO',
    'medicos_login',
    jsonb_build_object(
        'medicos_corrigidos', count(*),
        'data_correcao', now()
    )
FROM public.medicos m
LEFT JOIN public.medicos_login ml ON m.id = ml.medico_id
WHERE ml.medico_id IS NULL
AND m.ativo = true;