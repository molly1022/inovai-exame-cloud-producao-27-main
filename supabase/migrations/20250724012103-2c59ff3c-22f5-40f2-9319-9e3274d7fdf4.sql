-- Definir senha fixa para admin geral: maconheiro@321
-- Evitar que force a troca de senha

-- Atualizar todas as configurações existentes para usar a nova senha do admin
UPDATE public.configuracoes_clinica 
SET codigo_acesso_admin = 'maconheiro@321'
WHERE codigo_acesso_admin != 'maconheiro@321';

-- Marcar que a primeira senha já foi alterada para evitar o modal de troca
UPDATE public.admin_sessions 
SET primeira_senha_alterada = true
WHERE primeira_senha_alterada = false;