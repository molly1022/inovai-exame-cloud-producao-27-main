
-- Adicionar campo de email de login para a clínica na tabela configuracoes_clinica
ALTER TABLE public.configuracoes_clinica 
ADD COLUMN email_login_clinica TEXT NOT NULL DEFAULT 'adminclinica@gmail.com';

-- Comentário para documentação
COMMENT ON COLUMN public.configuracoes_clinica.email_login_clinica IS 'Email de login para acesso da clínica';

-- Atualizar o registro existente com o email padrão
UPDATE public.configuracoes_clinica 
SET email_login_clinica = 'adminclinica@gmail.com' 
WHERE clinica_id = '00000000-0000-0000-0000-000000000001';
