-- FASE 3.2: CORRIGIR FOREIGN KEYS E COMPLETAR MIGRAÇÃO

-- 1. LIDAR COM A TABELA TELECONSULTAS
-- Remover a foreign key constraint e a coluna clinica_id da tabela teleconsultas
ALTER TABLE teleconsultas DROP CONSTRAINT IF EXISTS teleconsultas_clinica_id_fkey;
ALTER TABLE teleconsultas DROP COLUMN IF EXISTS clinica_id CASCADE;

-- 2. VERIFICAR E REMOVER OUTRAS FOREIGN KEYS PARA CLINICAS SE EXISTIREM
-- Dropar outras constraints que possam existir
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Buscar todas as foreign keys que referenciam a tabela clinicas
    FOR constraint_record IN 
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints tc
        INNER JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        INNER JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'clinicas'
        AND tc.table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                      constraint_record.table_name, 
                      constraint_record.constraint_name);
    END LOOP;
END $$;

-- 3. CRIAR POLÍTICAS RLS PARA TELECONSULTAS SE EXISTIR
CREATE POLICY "Acesso total teleconsultas" ON teleconsultas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. LIMPAR DADOS DUPLICADOS
-- Manter apenas um registro de configuração
DELETE FROM configuracoes_clinica WHERE id NOT IN (SELECT id FROM configuracoes_clinica ORDER BY created_at LIMIT 1);

-- Manter apenas uma clínica
DELETE FROM clinicas WHERE id NOT IN (SELECT id FROM clinicas ORDER BY created_at LIMIT 1);

-- Manter apenas uma assinatura
DELETE FROM assinaturas WHERE id NOT IN (SELECT id FROM assinaturas ORDER BY created_at LIMIT 1);

-- 5. ATUALIZAR OS REGISTROS ÚNICOS
UPDATE configuracoes_clinica SET 
  nome_clinica = 'Clínica 1',
  subdominio = 'clinica-1',
  email_login_clinica = 'admin@clinica-1.com'
WHERE id IN (SELECT id FROM configuracoes_clinica ORDER BY created_at LIMIT 1);

UPDATE clinicas SET 
  nome = 'Clínica 1',
  subdominio = 'clinica-1',
  email = 'contato@clinica-1.com'
WHERE id IN (SELECT id FROM clinicas ORDER BY created_at LIMIT 1);

-- 6. CRIAR TABELA DE METADADOS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS clinica_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clinica TEXT NOT NULL DEFAULT 'Clínica 1',
  subdominio TEXT NOT NULL DEFAULT 'clinica-1',
  database_name TEXT NOT NULL DEFAULT 'clinica_1',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir metadados se não existir
INSERT INTO clinica_metadata (nome_clinica, subdominio, database_name)
SELECT 'Clínica 1', 'clinica-1', 'clinica_1'
WHERE NOT EXISTS (SELECT 1 FROM clinica_metadata);

-- 7. LOG DE SUCESSO
INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
  'DATABASE_RESTRUCTURE_SUCCESS',
  'sistema_completo',
  jsonb_build_object(
    'tipo', 'database_per_tenant_migration_completa',
    'clinica_alvo', 'clinica-1',
    'data_migracao', NOW(),
    'status', 'sucesso_total',
    'foreign_keys_removidas', true,
    'politicas_rls_criadas', true
  )
);