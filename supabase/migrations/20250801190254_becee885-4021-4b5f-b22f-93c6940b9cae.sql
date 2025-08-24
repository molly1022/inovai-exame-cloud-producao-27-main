-- Atualizar assinatura da clínica Unimed para plano avançado
UPDATE public.assinaturas 
SET 
    tipo_plano = 'avancado_medico',
    valor = 299.00,
    status = 'ativa',
    periodo_meses = 1,
    limite_funcionarios = 10,
    limite_medicos = 15,
    proximo_pagamento = CURRENT_DATE + INTERVAL '1 month',
    updated_at = now()
WHERE clinica_id = 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

-- Ativar telemedicina nas configurações da clínica Unimed
UPDATE public.configuracoes_clinica 
SET 
    telemedicina_ativa = true,
    updated_at = now()
WHERE clinica_id = 'cd66c1b3-3684-4358-a0cf-b51d8b75041f';

-- Configurar uso mensal de teleconsultas para o plano avançado (50 consultas gratuitas)
INSERT INTO public.teleconsultas_uso_mensal (
    clinica_id,
    mes_referencia,
    total_utilizadas,
    pacotes_adicionais_comprados,
    valor_total_pacotes
) VALUES (
    'cd66c1b3-3684-4358-a0cf-b51d8b75041f',
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    0,
    0,
    0.00
)
ON CONFLICT (clinica_id, mes_referencia) 
DO UPDATE SET 
    updated_at = now();