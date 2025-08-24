
-- 1. Corrigir valores dos planos básicos no banco de dados (apenas valor_base, valor_final é calculado automaticamente)
UPDATE planos_assinatura 
SET valor_base = 1500.00 
WHERE tipo_plano = 'basico' AND periodo_meses = 6;

UPDATE planos_assinatura 
SET valor_base = 3000.00 
WHERE tipo_plano = 'basico' AND periodo_meses = 12;

-- 2. Migrar assinatura legacy da clínica de R$ 150 para R$ 250
UPDATE assinaturas 
SET 
  valor = 250.00,
  valor_original = 250.00,
  updated_at = NOW()
WHERE clinica_id = '00000000-0000-0000-0000-000000000001' 
  AND valor = 150.00;

-- 3. Corrigir limite de médicos para planos básicos (4, não 5)
UPDATE planos_assinatura 
SET limite_medicos = 4 
WHERE tipo_plano = 'basico';

-- 4. Também atualizar a assinatura existente para ter o limite correto de médicos
UPDATE assinaturas 
SET limite_medicos = 4 
WHERE clinica_id = '00000000-0000-0000-0000-000000000001' 
  AND tipo_plano = 'basico';

-- Verificar os dados atualizados
SELECT tipo_plano, periodo_meses, valor_base, valor_final, percentual_desconto, limite_funcionarios, limite_medicos 
FROM planos_assinatura 
WHERE ativo = true 
ORDER BY tipo_plano, periodo_meses;

SELECT * FROM assinaturas WHERE clinica_id = '00000000-0000-0000-0000-000000000001';
