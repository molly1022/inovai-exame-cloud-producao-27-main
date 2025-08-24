
-- Primeiro, remover a constraint de unique em periodo_meses para permitir múltiplos planos com o mesmo período
ALTER TABLE planos_assinatura DROP CONSTRAINT IF EXISTS planos_assinatura_periodo_meses_key;

-- Adicionar campos se ainda não existirem
ALTER TABLE planos_assinatura ADD COLUMN IF NOT EXISTS limite_funcionarios integer NOT NULL DEFAULT 4;
ALTER TABLE planos_assinatura ADD COLUMN IF NOT EXISTS tipo_plano text NOT NULL DEFAULT 'basico';

-- Atualizar planos existentes para serem do tipo básico
UPDATE planos_assinatura 
SET tipo_plano = 'basico', 
    limite_funcionarios = 4,
    valor_base = CASE 
      WHEN periodo_meses = 1 THEN 250.00
      WHEN periodo_meses = 6 THEN 1350.00  
      WHEN periodo_meses = 12 THEN 2550.00
    END,
    percentual_desconto = CASE 
      WHEN periodo_meses = 1 THEN 0.00
      WHEN periodo_meses = 6 THEN 10.00
      WHEN periodo_meses = 12 THEN 15.00
    END
WHERE tipo_plano IS NULL OR tipo_plano = 'basico';

-- Inserir plano trimestral básico
INSERT INTO planos_assinatura (periodo_meses, valor_base, percentual_desconto, tipo_plano, limite_funcionarios, ativo)
SELECT 3, 750.00, 5.00, 'basico', 4, true
WHERE NOT EXISTS (
  SELECT 1 FROM planos_assinatura 
  WHERE periodo_meses = 3 AND tipo_plano = 'basico'
);

-- Inserir planos Intermediário (só se não existirem)
INSERT INTO planos_assinatura (periodo_meses, valor_base, percentual_desconto, tipo_plano, limite_funcionarios, ativo)
SELECT * FROM (VALUES 
  (1, 450.00, 0.00, 'intermediario', 8, true),
  (3, 1350.00, 5.00, 'intermediario', 8, true),
  (6, 2700.00, 10.00, 'intermediario', 8, true),
  (12, 5400.00, 15.00, 'intermediario', 8, true)
) AS v(periodo_meses, valor_base, percentual_desconto, tipo_plano, limite_funcionarios, ativo)
WHERE NOT EXISTS (
  SELECT 1 FROM planos_assinatura p 
  WHERE p.periodo_meses = v.periodo_meses AND p.tipo_plano = v.tipo_plano
);

-- Inserir planos Premium (só se não existirem)
INSERT INTO planos_assinatura (periodo_meses, valor_base, percentual_desconto, tipo_plano, limite_funcionarios, ativo)
SELECT * FROM (VALUES 
  (1, 680.00, 0.00, 'premium', 12, true),
  (3, 2040.00, 5.00, 'premium', 12, true),
  (6, 4080.00, 10.00, 'premium', 12, true),
  (12, 8160.00, 15.00, 'premium', 12, true)
) AS v(periodo_meses, valor_base, percentual_desconto, tipo_plano, limite_funcionarios, ativo)
WHERE NOT EXISTS (
  SELECT 1 FROM planos_assinatura p 
  WHERE p.periodo_meses = v.periodo_meses AND p.tipo_plano = v.tipo_plano
);

-- Adicionar campos na tabela assinaturas
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS tipo_plano text DEFAULT 'basico';
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS limite_funcionarios integer DEFAULT 4;

-- Atualizar assinaturas existentes
UPDATE assinaturas 
SET tipo_plano = CASE 
  WHEN valor <= 280 THEN 'basico'
  WHEN valor <= 500 THEN 'intermediario' 
  ELSE 'premium'
END,
limite_funcionarios = CASE 
  WHEN valor <= 280 THEN 4
  WHEN valor <= 500 THEN 8
  ELSE 12
END
WHERE tipo_plano IS NULL;

-- Criar nova constraint composta para permitir múltiplos planos com mesmo período mas tipos diferentes
ALTER TABLE planos_assinatura ADD CONSTRAINT planos_assinatura_periodo_tipo_unique UNIQUE (periodo_meses, tipo_plano);
