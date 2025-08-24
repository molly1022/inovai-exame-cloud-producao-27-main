
-- Adicionar campo limite_medicos na tabela planos_assinatura
ALTER TABLE planos_assinatura ADD COLUMN IF NOT EXISTS limite_medicos integer NOT NULL DEFAULT 5;

-- Atualizar os limites de médicos para cada tipo de plano
UPDATE planos_assinatura 
SET limite_medicos = CASE 
  WHEN tipo_plano = 'basico' THEN 5
  WHEN tipo_plano = 'intermediario' THEN 10
  WHEN tipo_plano = 'premium' THEN 15
  ELSE 5
END;

-- Adicionar campo limite_medicos na tabela assinaturas
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS limite_medicos integer DEFAULT 5;

-- Atualizar assinaturas existentes com os limites de médicos
UPDATE assinaturas 
SET limite_medicos = CASE 
  WHEN tipo_plano = 'basico' THEN 5
  WHEN tipo_plano = 'intermediario' THEN 10
  WHEN tipo_plano = 'premium' THEN 15
  ELSE 5
END
WHERE limite_medicos IS NULL OR limite_medicos = 5;
