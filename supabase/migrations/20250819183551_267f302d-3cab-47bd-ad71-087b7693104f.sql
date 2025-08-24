-- FASE 3.1: CORRIGIR ESTRUTURA E CRIAR POLÍTICAS

-- 1. ADICIONAR COLUNAS NECESSÁRIAS SE NÃO EXISTIREM
ALTER TABLE configuracoes_clinica ADD COLUMN IF NOT EXISTS nome_clinica TEXT DEFAULT 'Clínica 1';
ALTER TABLE configuracoes_clinica ADD COLUMN IF NOT EXISTS subdominio TEXT DEFAULT 'clinica-1';

-- 2. CRIAR POLÍTICAS RLS SIMPLIFICADAS PARA BANCO ÚNICO
CREATE POLICY "Acesso total agendamentos" ON agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total pacientes" ON pacientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total medicos" ON medicos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total funcionarios" ON funcionarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total exames" ON exames FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total atestados" ON atestados_medicos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total anotacoes" ON anotacoes_medicas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total categorias" ON categorias_exames FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total valores_exames" ON exames_valores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total convenios" ON convenios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total lista_espera" ON lista_espera_agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total indisponibilidade" ON medicos_indisponibilidade FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total config_automacao" ON configuracoes_automacao FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total config_email" ON configuracoes_email FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total email_lembretes" ON email_lembretes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total funcionarios_logs" ON funcionarios_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total funcionarios_sessoes" ON funcionarios_sessoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total medicos_login" ON medicos_login FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total funcionarios_login" ON funcionarios_login FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total codigos_recuperacao" ON codigos_recuperacao FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total assinaturas" ON assinaturas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total agendamentos_historico" ON agendamentos_historico FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. ATUALIZAR CONFIGURAÇÕES
DELETE FROM configuracoes_clinica WHERE id NOT IN (SELECT id FROM configuracoes_clinica LIMIT 1);
UPDATE configuracoes_clinica SET 
  nome_clinica = 'Clínica 1',
  subdominio = 'clinica-1',
  email_login_clinica = 'admin@clinica-1.com'
WHERE id IN (SELECT id FROM configuracoes_clinica LIMIT 1);

-- 4. ATUALIZAR CLINICAS
DELETE FROM clinicas WHERE id NOT IN (SELECT id FROM clinicas LIMIT 1);
UPDATE clinicas SET 
  nome = 'Clínica 1',
  subdominio = 'clinica-1',
  email = 'contato@clinica-1.com'
WHERE id IN (SELECT id FROM clinicas LIMIT 1);

-- 5. MANTER APENAS UMA ASSINATURA
DELETE FROM assinaturas WHERE id NOT IN (SELECT id FROM assinaturas LIMIT 1);

-- 6. CRIAR TABELA DE METADADOS
CREATE TABLE IF NOT EXISTS clinica_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clinica TEXT NOT NULL DEFAULT 'Clínica 1',
  subdominio TEXT NOT NULL DEFAULT 'clinica-1',
  database_name TEXT NOT NULL DEFAULT 'clinica_1',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO clinica_metadata (nome_clinica, subdominio, database_name)
VALUES ('Clínica 1', 'clinica-1', 'clinica_1')
ON CONFLICT DO NOTHING;

-- 7. LOG FINAL
INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
  'DATABASE_RESTRUCTURE_FINAL',
  'sistema_completo',
  jsonb_build_object(
    'tipo', 'database_per_tenant_migration_final',
    'clinica_alvo', 'clinica-1',
    'data_migracao', NOW(),
    'status', 'concluido_com_sucesso'
  )
);