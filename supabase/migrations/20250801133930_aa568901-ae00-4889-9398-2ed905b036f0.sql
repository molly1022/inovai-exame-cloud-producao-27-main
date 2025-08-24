-- Padronizar planos de assinatura - remover duplicatas e inconsistências
-- Primeiro, deletar registros duplicados mantendo apenas os corretos
DELETE FROM public.planos_assinatura 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY tipo_plano, periodo_meses 
      ORDER BY created_at DESC
    ) as rn
    FROM public.planos_assinatura
  ) t 
  WHERE t.rn > 1
);

-- Atualizar planos para garantir configurações corretas de telemedicina
UPDATE public.planos_assinatura 
SET 
  limite_teleconsultas_gratuitas = 0,
  funcionalidades_bloqueadas = ARRAY['telemedicina']::text[]
WHERE tipo_plano = 'basico_medico';

UPDATE public.planos_assinatura 
SET 
  limite_teleconsultas_gratuitas = 12,
  valor_pacote_adicional_teleconsulta = 50.00,
  consultas_por_pacote_adicional = 10,
  funcionalidades_bloqueadas = ARRAY[]::text[]
WHERE tipo_plano = 'intermediario_medico';

UPDATE public.planos_assinatura 
SET 
  limite_teleconsultas_gratuitas = 20,
  valor_pacote_adicional_teleconsulta = 50.00,
  consultas_por_pacote_adicional = 10,
  funcionalidades_bloqueadas = ARRAY[]::text[]
WHERE tipo_plano = 'avancado_medico';

UPDATE public.planos_assinatura 
SET 
  limite_teleconsultas_gratuitas = 999999,
  valor_pacote_adicional_teleconsulta = 0.00,
  consultas_por_pacote_adicional = 0,
  funcionalidades_bloqueadas = ARRAY[]::text[]
WHERE tipo_plano = 'empresarial';