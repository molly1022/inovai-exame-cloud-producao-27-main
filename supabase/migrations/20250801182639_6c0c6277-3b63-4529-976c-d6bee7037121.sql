-- Atualizar plano da clínica integrammedica123123 para avançado
UPDATE public.assinaturas 
SET tipo_plano = 'avancado_medico',
    valor = 350.00,
    limite_funcionarios = 20,
    limite_medicos = 20,
    updated_at = now()
WHERE clinica_id = '31df6d1a-2723-4d18-9a6e-9debaddee0c3';

-- Ativar telemedicina para a clínica
UPDATE public.configuracoes_clinica 
SET telemedicina_ativa = true,
    valor_adicional_telemedicina = 15.00,
    updated_at = now()
WHERE clinica_id = '31df6d1a-2723-4d18-9a6e-9debaddee0c3';

-- Criar plano avançado se não existir (sem valor_final que é calculado)
INSERT INTO public.planos_assinatura (
    tipo_plano,
    periodo_meses,
    valor_base,
    percentual_desconto,
    limite_funcionarios,
    limite_medicos,
    limite_teleconsultas_gratuitas,
    valor_pacote_adicional_teleconsulta,
    consultas_por_pacote_adicional,
    funcionalidades_bloqueadas,
    modelo_cobranca
) VALUES (
    'avancado_medico',
    1,
    350.00,
    0.00,
    20,
    20,
    50,
    75.00,
    20,
    ARRAY[]::text[],
    'por_medico'
) ON CONFLICT (tipo_plano, periodo_meses) DO UPDATE SET
    limite_teleconsultas_gratuitas = 50,
    valor_pacote_adicional_teleconsulta = 75.00,
    consultas_por_pacote_adicional = 20,
    funcionalidades_bloqueadas = ARRAY[]::text[];

-- Atualizar plano básico para bloquear telemedicina
UPDATE public.planos_assinatura 
SET funcionalidades_bloqueadas = ARRAY['telemedicina', 'relatorios_avancados']
WHERE tipo_plano = 'basico' AND periodo_meses = 1;