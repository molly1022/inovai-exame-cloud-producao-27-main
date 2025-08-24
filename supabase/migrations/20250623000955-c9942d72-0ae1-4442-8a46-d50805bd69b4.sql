
-- Adicionar colunas para múltiplas imagens e laudos na tabela exames
ALTER TABLE public.exames 
ADD COLUMN IF NOT EXISTS imagens_urls text[],
ADD COLUMN IF NOT EXISTS imagens_nomes text[],
ADD COLUMN IF NOT EXISTS laudo_url text,
ADD COLUMN IF NOT EXISTS laudo_nome text;

-- Comentário: Essas colunas permitirão salvar múltiplas imagens e laudos separadamente
