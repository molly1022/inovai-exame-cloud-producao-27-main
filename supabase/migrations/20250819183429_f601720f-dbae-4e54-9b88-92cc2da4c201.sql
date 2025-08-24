-- FASE 3: CRIAR POLÍTICAS RLS SIMPLIFICADAS E CONFIGURAÇÃO FINAL

-- 1. CRIAR POLÍTICAS RLS SIMPLIFICADAS PARA BANCO ÚNICO
-- Como agora é uma clínica única, as políticas permitem acesso total autenticado

-- Agendamentos
CREATE POLICY "Acesso total agendamentos" ON agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pacientes  
CREATE POLICY "Acesso total pacientes" ON pacientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Médicos
CREATE POLICY "Acesso total medicos" ON medicos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Funcionários
CREATE POLICY "Acesso total funcionarios" ON funcionarios FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Exames
CREATE POLICY "Acesso total exames" ON exames FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Atestados Médicos
CREATE POLICY "Acesso total atestados" ON atestados_medicos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anotações Médicas
CREATE POLICY "Acesso total anotacoes" ON anotacoes_medicas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Categorias de Exames
CREATE POLICY "Acesso total categorias" ON categorias_exames FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Valores de Exames
CREATE POLICY "Acesso total valores_exames" ON exames_valores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Convênios
CREATE POLICY "Acesso total convenios" ON convenios FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Lista de Espera
CREATE POLICY "Acesso total lista_espera" ON lista_espera_agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indisponibilidade Médicos
CREATE POLICY "Acesso total indisponibilidade" ON medicos_indisponibilidade FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Configurações
CREATE POLICY "Acesso total config_automacao" ON configuracoes_automacao FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total config_email" ON configuracoes_email FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email Lembretes
CREATE POLICY "Acesso total email_lembretes" ON email_lembretes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Logs e Sessões
CREATE POLICY "Acesso total funcionarios_logs" ON funcionarios_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total funcionarios_sessoes" ON funcionarios_sessoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Logins
CREATE POLICY "Acesso total medicos_login" ON medicos_login FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total funcionarios_login" ON funcionarios_login FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Códigos de Recuperação
CREATE POLICY "Acesso total codigos_recuperacao" ON codigos_recuperacao FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Assinaturas
CREATE POLICY "Acesso total assinaturas" ON assinaturas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Histórico de Agendamentos (se existir)
CREATE POLICY "Acesso total agendamentos_historico" ON agendamentos_historico FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. ATUALIZAR CONFIGURAÇÕES PARA CLINICA-1
-- Manter apenas um registro de configuração
DELETE FROM configuracoes_clinica WHERE id NOT IN (SELECT id FROM configuracoes_clinica LIMIT 1);

-- Atualizar configuração existente
UPDATE configuracoes_clinica SET 
  nome_clinica = 'Clínica 1',
  subdominio = 'clinica-1',
  email_login_clinica = 'admin@clinica-1.com'
WHERE id IN (SELECT id FROM configuracoes_clinica LIMIT 1);

-- 3. ATUALIZAR TABELA CLINICAS PARA SER APENAS DA CLINICA-1
DELETE FROM clinicas WHERE id NOT IN (SELECT id FROM clinicas LIMIT 1);
UPDATE clinicas SET 
  nome = 'Clínica 1',
  subdominio = 'clinica-1',
  email = 'contato@clinica-1.com'
WHERE id IN (SELECT id FROM clinicas LIMIT 1);

-- 4. MANTER APENAS UMA ASSINATURA (primeira clínica)
DELETE FROM assinaturas WHERE id NOT IN (SELECT id FROM assinaturas LIMIT 1);

-- 5. CRIAR TABELA DE METADADOS DA CLINICA
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

-- 6. CRIAR FUNÇÃO PARA IDENTIFICAR CLINICA ATUAL (sempre será a única)
CREATE OR REPLACE FUNCTION get_current_clinic()
RETURNS TABLE(id UUID, nome TEXT, subdominio TEXT) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT c.id, c.nome, c.subdominio FROM clinicas c LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR FUNÇÃO PARA TEMPLATE DE NOVA CLINICA (para futuro uso administrativo)
CREATE OR REPLACE FUNCTION create_clinic_template()
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  template_sql TEXT;
BEGIN
  template_sql := '
-- TEMPLATE PARA NOVA CLÍNICA
-- Este script cria todas as tabelas operacionais sem clinica_id

CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  endereco TEXT,
  convenio_id UUID,
  numero_convenio TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  crm TEXT,
  coren TEXT,
  especialidade TEXT,
  email TEXT,
  telefone TEXT,
  categoria_trabalho TEXT[],
  percentual_repasse NUMERIC DEFAULT 0.00,
  senha_acesso TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demais tabelas seguem o mesmo padrão...
  ';
  
  RETURN template_sql;
END;
$$ LANGUAGE plpgsql;

-- 8. LOG DA MIGRAÇÃO COMPLETA
INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
  'DATABASE_PER_TENANT_COMPLETE',
  'sistema_completo',
  jsonb_build_object(
    'tipo', 'database_per_tenant_migration_completa',
    'clinica_alvo', 'clinica-1',
    'data_migracao', NOW(),
    'status', 'sucesso',
    'politicas_criadas', 'acesso_total_autenticado',
    'configuracao', 'banco_unico_clinica_1'
  )
);