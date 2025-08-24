-- Corrigir o limite de teleconsultas do plano avançado que ainda está incorreto
UPDATE public.planos_assinatura 
SET 
    limite_teleconsultas_gratuitas = 20,
    valor_pacote_adicional_teleconsulta = 50.00,
    consultas_por_pacote_adicional = 10,
    updated_at = now()
WHERE tipo_plano = 'avancado_medico';

-- Verificar se os outros planos estão corretos
UPDATE public.planos_assinatura 
SET 
    limite_teleconsultas_gratuitas = CASE 
        WHEN tipo_plano LIKE '%basico%' THEN 0
        WHEN tipo_plano LIKE '%intermediario%' THEN 12
        WHEN tipo_plano LIKE '%avancado%' THEN 20
        ELSE limite_teleconsultas_gratuitas
    END,
    updated_at = now()
WHERE tipo_plano IN ('basico', 'intermediario', 'avancado', 'basico_medico', 'intermediario_medico', 'avancado_medico');

-- Log da correção
INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
    'LIMITES_TELECONSULTAS_CORRIGIDOS',
    'planos_assinatura',
    jsonb_build_object(
        'plano_avancado_medico_corrigido', 'limite alterado de 50 para 20',
        'executado_em', now()
    )
);