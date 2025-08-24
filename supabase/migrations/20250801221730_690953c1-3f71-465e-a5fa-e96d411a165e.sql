-- Fase 2: Habilitar RLS na tabela categorias_exames que tem política mas RLS desabilitado
ALTER TABLE categorias_exames ENABLE ROW LEVEL SECURITY;