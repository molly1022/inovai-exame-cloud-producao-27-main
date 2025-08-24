-- FASE 1: LIMPEZA DAS INCONSISTÊNCIAS DO SISTEMA DATABASE-PER-TENANT
-- Remove tabelas administrativas duplicadas do banco memorial

-- 1. Remover tabelas administrativas que devem existir apenas no banco central
DROP TABLE IF EXISTS public.clinicas_central CASCADE;
DROP TABLE IF EXISTS public.admin_operacoes_log CASCADE; 
DROP TABLE IF EXISTS public.database_connections_monitor CASCADE;
DROP TABLE IF EXISTS public.clinicas_inovai CASCADE;

-- 2. Remover políticas RLS associadas às tabelas removidas (se existirem)
-- Estas políticas já não são necessárias pois as tabelas não existem mais

-- 3. Adicionar comentário explicativo sobre a arquitetura
COMMENT ON SCHEMA public IS 'Banco Memorial - Apenas dados operacionais das clínicas com RLS por tenant. Tabelas administrativas estão no banco central (adminSupabase).';

-- 4. Log da operação no sistema de logs (se a tabela existir)
INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
  'LIMPEZA_ARQUITETURA_TENANT', 
  'schema_cleanup', 
  jsonb_build_object(
    'operacao', 'remocao_tabelas_administrativas',
    'tabelas_removidas', ARRAY['clinicas_central', 'admin_operacoes_log', 'database_connections_monitor', 'clinicas_inovai'],
    'motivo', 'correção arquitetura database-per-tenant',
    'timestamp', now()
  )
);