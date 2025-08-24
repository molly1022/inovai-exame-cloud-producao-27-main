
-- Adicionar campos para múltiplas imagens e laudo separado na tabela exames
ALTER TABLE public.exames 
ADD COLUMN imagens_urls text[], 
ADD COLUMN imagens_nomes text[],
ADD COLUMN laudo_url text,
ADD COLUMN laudo_nome text;

-- Atualizar dados existentes para migrar arquivo_url para imagens_urls
UPDATE public.exames 
SET imagens_urls = CASE 
    WHEN arquivo_url IS NOT NULL THEN ARRAY[arquivo_url] 
    ELSE ARRAY[]::text[] 
END,
imagens_nomes = CASE 
    WHEN arquivo_nome IS NOT NULL THEN ARRAY[arquivo_nome] 
    ELSE ARRAY[]::text[] 
END
WHERE arquivo_url IS NOT NULL OR arquivo_nome IS NOT NULL;

-- Comentário: Mantemos os campos antigos por compatibilidade, mas agora usaremos os novos campos array para imagens múltiplas e campo específico para laudo
