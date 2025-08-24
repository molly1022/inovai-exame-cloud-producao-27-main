-- Update subscription plan limits according to new requirements
UPDATE planos_assinatura 
SET 
  limite_funcionarios = 4,
  limite_medicos = 10
WHERE tipo_plano = 'basico';

UPDATE planos_assinatura 
SET 
  limite_funcionarios = 8,
  limite_medicos = 15
WHERE tipo_plano = 'intermediario';

UPDATE planos_assinatura 
SET 
  limite_funcionarios = 12,
  limite_medicos = 20
WHERE tipo_plano = 'premium';