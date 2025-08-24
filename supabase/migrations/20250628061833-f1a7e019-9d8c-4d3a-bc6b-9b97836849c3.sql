
-- Adicionar campo categoria_trabalho como array de texto na tabela medicos
ALTER TABLE medicos ADD COLUMN categoria_trabalho TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Tornar o campo crm opcional (nullable)
ALTER TABLE medicos ALTER COLUMN crm DROP NOT NULL;

-- Criar índice para melhor performance nas buscas por categoria
CREATE INDEX idx_medicos_categoria_trabalho ON medicos USING GIN (categoria_trabalho);

-- Atualizar comentários das colunas para documentação
COMMENT ON COLUMN medicos.categoria_trabalho IS 'Categorias de trabalho do médico (array de strings)';
COMMENT ON COLUMN medicos.coren IS 'Número do Conselho Regional de Enfermagem (opcional)';
COMMENT ON COLUMN medicos.crm IS 'Número do Conselho Regional de Medicina (opcional)';
