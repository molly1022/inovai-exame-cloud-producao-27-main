
-- Adicionar campo de senha para a clínica na tabela configuracoes_clinica
ALTER TABLE public.configuracoes_clinica 
ADD COLUMN senha_acesso_clinica TEXT NOT NULL DEFAULT 'jackson@123';

-- Comentário para documentação
COMMENT ON COLUMN public.configuracoes_clinica.senha_acesso_clinica IS 'Senha de acesso para login da clínica';

-- Atualizar o registro existente com a senha padrão
UPDATE public.configuracoes_clinica 
SET senha_acesso_clinica = 'jackson@123' 
WHERE clinica_id = '00000000-0000-0000-0000-000000000001';
