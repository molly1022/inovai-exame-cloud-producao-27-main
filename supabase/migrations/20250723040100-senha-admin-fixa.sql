-- Atualizar a senha do admin geral para maconheiro@321
UPDATE public.configuracoes_clinica 
SET 
  email_login_clinica = 'adminclinica@inovai.com',
  senha_acesso_clinica = 'maconheiro@321',
  updated_at = now()
WHERE clinica_id = '00000000-0000-0000-0000-000000000001';

-- Alterar o valor padrão da senha para novos registros
ALTER TABLE public.configuracoes_clinica 
ALTER COLUMN senha_acesso_clinica SET DEFAULT 'maconheiro@321';

-- Log da operação
DO $$
BEGIN
  RAISE NOTICE 'Senha do admin geral atualizada para: maconheiro@321';
END $$;