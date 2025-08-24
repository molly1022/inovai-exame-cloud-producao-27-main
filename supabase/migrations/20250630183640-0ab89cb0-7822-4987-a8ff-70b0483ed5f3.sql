
-- Adicionar campo tipo_receita na tabela receitas_medicas
ALTER TABLE receitas_medicas 
ADD COLUMN tipo_receita text NOT NULL DEFAULT 'basica';

-- Adicionar constraint para validar apenas os valores permitidos
ALTER TABLE receitas_medicas 
ADD CONSTRAINT receitas_medicas_tipo_receita_check 
CHECK (tipo_receita IN ('basica', 'controle_especial'));

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN receitas_medicas.tipo_receita IS 'Tipo da receita: basica ou controle_especial';
