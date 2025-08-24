-- Atualizar valores para o novo modelo por médico (R$ 175 adicional)
UPDATE public.planos_assinatura 
SET valor_por_medico = CASE 
    WHEN tipo_plano = 'basico_medico' THEN 125.00
    WHEN tipo_plano = 'intermediario_medico' THEN 190.00
    WHEN tipo_plano = 'avancado_medico' THEN 299.00
    ELSE valor_por_medico
END
WHERE ativo = true AND modelo_cobranca = 'por_medico';

-- Definir funcionalidades por plano
UPDATE public.planos_assinatura 
SET funcionalidades_bloqueadas = CASE 
    WHEN tipo_plano = 'basico_medico' THEN ARRAY['telemedicina', 'monitoramento', 'relatorios_avancados']
    WHEN tipo_plano = 'intermediario_medico' THEN ARRAY['telemedicina', 'monitoramento']
    WHEN tipo_plano = 'avancado_medico' THEN ARRAY[]::text[]
    ELSE funcionalidades_bloqueadas
END
WHERE ativo = true AND modelo_cobranca = 'por_medico';

-- Inserir planos caso não existam
INSERT INTO public.planos_assinatura (
    tipo_plano, periodo_meses, valor_por_medico, modelo_cobranca, 
    limite_base_medicos, limite_base_usuarios, funcionalidades_bloqueadas, ativo
) VALUES 
    ('basico_medico', 1, 125.00, 'por_medico', 1, 1, ARRAY['telemedicina', 'monitoramento', 'relatorios_avancados'], true),
    ('intermediario_medico', 1, 190.00, 'por_medico', 1, 1, ARRAY['telemedicina', 'monitoramento'], true),
    ('avancado_medico', 1, 299.00, 'por_medico', 1, 1, ARRAY[]::text[], true)
ON CONFLICT (tipo_plano, periodo_meses) DO UPDATE SET
    valor_por_medico = EXCLUDED.valor_por_medico,
    funcionalidades_bloqueadas = EXCLUDED.funcionalidades_bloqueadas,
    modelo_cobranca = EXCLUDED.modelo_cobranca,
    ativo = EXCLUDED.ativo;