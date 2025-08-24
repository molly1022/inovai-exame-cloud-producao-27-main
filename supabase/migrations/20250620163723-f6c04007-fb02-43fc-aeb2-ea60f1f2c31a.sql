
-- Atualizar as credenciais padrão da clínica
UPDATE public.configuracoes_clinica 
SET 
  email_login_clinica = 'adminclinica@inovai.com',
  senha_acesso_clinica = 'inovaiadmin@321',
  updated_at = now()
WHERE clinica_id = '00000000-0000-0000-0000-000000000001';

-- Alterar os valores padrão das colunas para novos registros
ALTER TABLE public.configuracoes_clinica 
ALTER COLUMN email_login_clinica SET DEFAULT 'adminclinica@inovai.com';

ALTER TABLE public.configuracoes_clinica 
ALTER COLUMN senha_acesso_clinica SET DEFAULT 'inovaiadmin@321';
