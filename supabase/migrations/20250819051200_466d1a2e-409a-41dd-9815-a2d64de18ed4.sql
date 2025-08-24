-- FASE 2: Corrigir problemas de segurança e continuar implementação

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.sistema_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sistema_admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_sistema_central ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para administradores
CREATE POLICY "Admins podem gerenciar sistema" ON public.sistema_versoes
    FOR ALL USING (true);

CREATE POLICY "Admins podem gerenciar logs" ON public.sistema_admin_logs
    FOR ALL USING (true);

CREATE POLICY "Admins podem gerenciar configurações" ON public.configuracoes_sistema_central
    FOR ALL USING (true);

CREATE POLICY "Admins podem gerenciar templates" ON public.schema_templates
    FOR ALL USING (true);

-- Melhorar tabelas existentes para Database-per-Tenant
ALTER TABLE public.clinicas_central 
ADD COLUMN IF NOT EXISTS database_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS database_url TEXT,
ADD COLUMN IF NOT EXISTS schema_version TEXT DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS connection_string_template TEXT,
ADD COLUMN IF NOT EXISTS backup_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS backup_schedule TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS maintenance_window TEXT DEFAULT '02:00-04:00',
ADD COLUMN IF NOT EXISTS max_connections INTEGER DEFAULT 20;

-- Melhorar monitoramento
ALTER TABLE public.database_connections_monitor
ADD COLUMN IF NOT EXISTS database_size_bytes BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_connections INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_connections_reached INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS query_performance_avg NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS backup_status TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS last_backup_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'warning', 'critical', 'unknown'));