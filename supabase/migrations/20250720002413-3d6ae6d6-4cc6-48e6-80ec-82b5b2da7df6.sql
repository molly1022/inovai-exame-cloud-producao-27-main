-- Atualizar senhas existentes no campo senha_escolhida baseado em dados_completos
UPDATE public.inscricoes_pendentes 
SET senha_escolhida = dados_completos->>'senha_personalizada'
WHERE dados_completos IS NOT NULL 
AND dados_completos->>'senha_personalizada' IS NOT NULL
AND senha_escolhida IS NULL;