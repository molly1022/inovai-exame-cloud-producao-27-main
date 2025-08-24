-- Atualizar clínica inovaiexibe@gmail.com para plano avançado
UPDATE public.assinaturas 
SET 
  tipo_plano = 'avancado_medico',
  limite_funcionarios = 10,
  limite_medicos = 15,
  valor = 399.00,
  valor_original = 450.00,
  percentual_desconto = 11.11,
  updated_at = now()
WHERE clinica_id = (
  SELECT id FROM public.clinicas WHERE email = 'inovaiexibe@gmail.com'
);

-- Desativar completamente o plano empresarial na tabela de planos
-- Como não existe registro, vamos garantir que não seja criado acidentalmente
INSERT INTO public.planos_assinatura (
  tipo_plano,
  periodo_meses,
  valor_base,
  percentual_desconto,
  valor_final,
  limite_funcionarios,
  limite_medicos,
  ativo,
  limite_teleconsultas_gratuitas,
  valor_pacote_adicional_teleconsulta,
  consultas_por_pacote_adicional,
  funcionalidades_bloqueadas
) VALUES (
  'empresarial',
  1,
  0.00,
  0.00,
  0.00,
  0,
  0,
  false, -- DESATIVADO
  0,
  0.00,
  0,
  ARRAY['todos']::text[] -- Bloqueia todas as funcionalidades
) ON CONFLICT (tipo_plano, periodo_meses) 
DO UPDATE SET 
  ativo = false,
  funcionalidades_bloqueadas = ARRAY['todos']::text[],
  limite_teleconsultas_gratuitas = 0,
  limite_funcionarios = 0,
  limite_medicos = 0,
  valor_final = 0.00;

-- Verificar se o plano avançado existe e ajustar conforme necessário
INSERT INTO public.planos_assinatura (
  tipo_plano,
  periodo_meses,
  valor_base,
  percentual_desconto,
  valor_final,
  limite_funcionarios,
  limite_medicos,
  ativo,
  limite_teleconsultas_gratuitas,
  valor_pacote_adicional_teleconsulta,
  consultas_por_pacote_adicional,
  funcionalidades_bloqueadas
) VALUES (
  'avancado_medico',
  1,
  450.00,
  11.11,
  399.00,
  10,
  15,
  true,
  20, -- 20 teleconsultas gratuitas
  50.00,
  10,
  ARRAY[]::text[] -- Sem bloqueios
) ON CONFLICT (tipo_plano, periodo_meses) 
DO UPDATE SET 
  ativo = true,
  funcionalidades_bloqueadas = ARRAY[]::text[],
  limite_teleconsultas_gratuitas = 20,
  limite_funcionarios = 10,
  limite_medicos = 15,
  valor_final = 399.00;