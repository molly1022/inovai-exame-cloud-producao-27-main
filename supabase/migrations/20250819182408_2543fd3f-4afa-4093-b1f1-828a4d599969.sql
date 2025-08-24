-- FASE 2: REMOVER COLUNAS clinica_id E CRIAR POLÍTICAS SIMPLIFICADAS
-- Agora que removemos as políticas RLS, podemos remover as colunas clinica_id

-- 1. REMOVER COLUNAS clinica_id DAS TABELAS OPERACIONAIS
ALTER TABLE agendamentos DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE pacientes DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE medicos DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE funcionarios DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE exames DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE atestados_medicos DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE receitas_medicas DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE anotacoes_medicas DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE categorias_exames DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE exames_valores DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE convenios DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE lista_espera_agendamentos DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE medicos_indisponibilidade DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE configuracoes_automacao DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE configuracoes_email DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE email_lembretes DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE funcionarios_logs DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE funcionarios_sessoes DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE medicos_login DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE codigos_recuperacao DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE assinaturas DROP COLUMN IF EXISTS clinica_id;

-- 2. ATUALIZAR CONFIGURAÇÕES PARA CLINICA-1
-- Manter apenas um registro de configuração
DELETE FROM configuracoes_clinica WHERE id NOT IN (SELECT id FROM configuracoes_clinica LIMIT 1);
ALTER TABLE configuracoes_clinica ADD COLUMN IF NOT EXISTS nome_clinica TEXT DEFAULT 'Clínica 1';
ALTER TABLE configuracoes_clinica ADD COLUMN IF NOT EXISTS subdominio TEXT DEFAULT 'clinica-1';

-- 3. MANTER APENAS UMA ASSINATURA (primeira clínica)
DELETE FROM assinaturas WHERE id NOT IN (SELECT id FROM assinaturas LIMIT 1);

-- 4. ATUALIZAR TABELA CLINICAS PARA SER APENAS DA CLINICA-1
DELETE FROM clinicas WHERE id NOT IN (SELECT id FROM clinicas LIMIT 1);
UPDATE clinicas SET 
  nome = 'Clínica 1',
  subdominio = 'clinica-1'
WHERE id IN (SELECT id FROM clinicas LIMIT 1);

-- 5. CRIAR POLÍTICAS RLS SIMPLIFICADAS PARA BANCO ÚNICO
-- Como agora é uma clínica única, as políticas são muito mais simples

-- Agendamentos
CREATE POLICY "Acesso total agendamentos" ON agendamentos FOR ALL USING (true) WITH CHECK (true);

-- Pacientes  
CREATE POLICY "Acesso total pacientes" ON pacientes FOR ALL USING (true) WITH CHECK (true);

-- Médicos
CREATE POLICY "Acesso total medicos" ON medicos FOR ALL USING (true) WITH CHECK (true);

-- Funcionários
CREATE POLICY "Acesso total funcionarios" ON funcionarios FOR ALL USING (true) WITH CHECK (true);

-- Exames
CREATE POLICY "Acesso total exames" ON exames FOR ALL USING (true) WITH CHECK (true);

-- Atestados Médicos
CREATE POLICY "Acesso total atestados" ON atestados_medicos FOR ALL USING (true) WITH CHECK (true);

-- Anotações Médicas
CREATE POLICY "Acesso total anotacoes" ON anotacoes_medicas FOR ALL USING (true) WITH CHECK (true);

-- Categorias de Exames
CREATE POLICY "Acesso total categorias" ON categorias_exames FOR ALL USING (true) WITH CHECK (true);

-- Valores de Exames
CREATE POLICY "Acesso total valores_exames" ON exames_valores FOR ALL USING (true) WITH CHECK (true);

-- Convênios
CREATE POLICY "Acesso total convenios" ON convenios FOR ALL USING (true) WITH CHECK (true);

-- Lista de Espera
CREATE POLICY "Acesso total lista_espera" ON lista_espera_agendamentos FOR ALL USING (true) WITH CHECK (true);

-- Indisponibilidade Médicos
CREATE POLICY "Acesso total indisponibilidade" ON medicos_indisponibilidade FOR ALL USING (true) WITH CHECK (true);

-- Configurações
CREATE POLICY "Acesso total config_automacao" ON configuracoes_automacao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total config_email" ON configuracoes_email FOR ALL USING (true) WITH CHECK (true);

-- Email Lembretes
CREATE POLICY "Acesso total email_lembretes" ON email_lembretes FOR ALL USING (true) WITH CHECK (true);

-- Logs e Sessões
CREATE POLICY "Acesso total funcionarios_logs" ON funcionarios_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total funcionarios_sessoes" ON funcionarios_sessoes FOR ALL USING (true) WITH CHECK (true);

-- Logins
CREATE POLICY "Acesso total medicos_login" ON medicos_login FOR ALL USING (true) WITH CHECK (true);

-- Códigos de Recuperação
CREATE POLICY "Acesso total codigos_recuperacao" ON codigos_recuperacao FOR ALL USING (true) WITH CHECK (true);

-- Assinaturas
CREATE POLICY "Acesso total assinaturas" ON assinaturas FOR ALL USING (true) WITH CHECK (true);

-- 6. CRIAR TABELA DE METADADOS DA CLINICA
CREATE TABLE IF NOT EXISTS clinica_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clinica TEXT NOT NULL DEFAULT 'Clínica 1',
  subdominio TEXT NOT NULL DEFAULT 'clinica-1',
  database_name TEXT NOT NULL DEFAULT 'clinica_1',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir metadados da clínica atual
INSERT INTO clinica_metadata (nome_clinica, subdominio, database_name)
VALUES ('Clínica 1', 'clinica-1', 'clinica_1')
ON CONFLICT DO NOTHING;

-- 7. LOG DA MIGRAÇÃO
INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
  'DATABASE_RESTRUCTURE_COMPLETE',
  'sistema_completo',
  jsonb_build_object(
    'tipo', 'database_per_tenant_migration',
    'clinica_alvo', 'clinica-1',
    'data_migracao', NOW(),
    'colunas_removidas', 'clinica_id',
    'politicas_criadas', 'acesso_total_simplificado'
  )
);