-- CORREÇÕES DE SEGURANÇA
-- Corrigir search_path de todas as funções criadas na migração anterior

-- 1. Corrigir função de login por subdomínio  
ALTER FUNCTION public.login_por_subdominio(text, text, text, inet) SET search_path = 'public';

-- 2. Corrigir função de busca por subdomínio
ALTER FUNCTION public.get_clinica_by_subdomain(text) SET search_path = 'public';

-- 3. Corrigir função de estatísticas de uso
ALTER FUNCTION public.get_clinic_usage_stats(uuid) SET search_path = 'public';

-- 4. Corrigir função de criação de banco tenant
ALTER FUNCTION public.create_tenant_database(uuid, boolean) SET search_path = 'public';

-- 5. Habilitar RLS na tabela de monitoramento se não estiver habilitado
ALTER TABLE public.database_connections_monitor ENABLE ROW LEVEL SECURITY;

-- 6. Criar constraint único para evitar duplicação
ALTER TABLE public.database_connections_monitor 
ADD CONSTRAINT unique_clinica_monitor UNIQUE (clinica_central_id);

-- Log da correção de segurança
INSERT INTO public.admin_operacoes_log (
  admin_user_id, operacao, detalhes, sucesso
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'SECURITY_FIXES_APPLIED',
  jsonb_build_object(
    'search_path_fixed_functions', 4,
    'rls_verified', true,
    'constraints_added', 1
  ),
  true
);