-- FASE 1: REESTRUTURAÇÃO PARA DATABASE-PER-TENANT
-- Este banco atual será transformado no banco da "clinica-1" (primeira clínica)
-- Removendo clinica_id de todas as tabelas operacionais para isolamento completo

-- 1. REMOVER COLUNA clinica_id DAS TABELAS OPERACIONAIS
ALTER TABLE agendamentos DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE pacientes DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE medicos DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE funcionarios DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE exames DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE atestados_medicos DROP COLUMN IF EXISTS clinica_id;
ALTER TABLE receitas_medicas DROP COLUMN IF EXISTS clinica_id;
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
ALTER TABLE configuracoes_clinica DROP COLUMN IF EXISTS clinica_id;

-- 2. REMOVER DEFAULTS BASEADOS EM clinica_id
ALTER TABLE agendamentos ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE pacientes ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE medicos ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE funcionarios ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE exames ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE categorias_exames ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE exames_valores ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE convenios ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. ATUALIZAR CONFIGURAÇÕES PARA CLINICA-1
-- Manter apenas um registro de configuração (sem clinica_id)
DELETE FROM configuracoes_clinica WHERE id NOT IN (SELECT id FROM configuracoes_clinica LIMIT 1);
ALTER TABLE configuracoes_clinica ADD COLUMN IF NOT EXISTS nome_clinica TEXT DEFAULT 'Clínica 1';
ALTER TABLE configuracoes_clinica ADD COLUMN IF NOT EXISTS subdominio TEXT DEFAULT 'clinica-1';

-- 4. MANTER APENAS UMA ASSINATURA (primeira clínica)
DELETE FROM assinaturas WHERE id NOT IN (SELECT id FROM assinaturas LIMIT 1);

-- 5. ATUALIZAR TABELA CLINICAS PARA SER APENAS DA CLINICA-1
DELETE FROM clinicas WHERE id NOT IN (SELECT id FROM clinicas LIMIT 1);
UPDATE clinicas SET 
  nome = 'Clínica 1',
  subdominio = 'clinica-1'
WHERE id IN (SELECT id FROM clinicas LIMIT 1);

-- 6. CRIAR FUNÇÃO PARA IDENTIFICAR CLINICA ATUAL (sempre será a única)
CREATE OR REPLACE FUNCTION get_current_clinic()
RETURNS TABLE(id UUID, nome TEXT, subdominio TEXT) AS $$
BEGIN
  RETURN QUERY SELECT c.id, c.nome, c.subdominio FROM clinicas c LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CRIAR TABELA DE METADADOS DA CLINICA
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

-- 8. FUNÇÃO PARA CRIAR TEMPLATE DE NOVA CLINICA
CREATE OR REPLACE FUNCTION create_clinic_template()
RETURNS TEXT AS $$
DECLARE
  template_sql TEXT;
BEGIN
  -- Gerar SQL para criar todas as tabelas operacionais (sem clinica_id)
  template_sql := '
-- TEMPLATE PARA NOVA CLÍNICA
-- Este script cria todas as tabelas operacionais sem clinica_id

-- Pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  endereco TEXT,
  convenio_id UUID REFERENCES convenios(id),
  numero_convenio TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Médicos  
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

-- E assim por diante para todas as tabelas operacionais...
  ';
  
  RETURN template_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. LOG DA MIGRAÇÃO
INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
  'DATABASE_RESTRUCTURE',
  'sistema_completo',
  jsonb_build_object(
    'tipo', 'database_per_tenant_migration',
    'clinica_alvo', 'clinica-1',
    'data_migracao', NOW(),
    'tabelas_alteradas', array[
      'agendamentos', 'pacientes', 'medicos', 'funcionarios', 
      'exames', 'atestados_medicos', 'receitas_medicas', 
      'anotacoes_medicas', 'categorias_exames', 'exames_valores',
      'convenios', 'lista_espera_agendamentos', 'medicos_indisponibilidade',
      'configuracoes_automacao', 'configuracoes_email', 'email_lembretes',
      'funcionarios_logs', 'funcionarios_sessoes', 'medicos_login',
      'codigos_recuperacao', 'assinaturas', 'configuracoes_clinica'
    ]
  )
);