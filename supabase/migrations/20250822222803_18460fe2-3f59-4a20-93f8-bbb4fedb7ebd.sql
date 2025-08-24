-- ===============================================
-- LIMPEZA DO BANCO MODELO PARA CLÍNICA ESPECÍFICA
-- Remove tabelas administrativas e ajusta para modelo single-tenant
-- ===============================================

-- ETAPA 1: REMOVER TABELAS ADMINISTRATIVAS (não necessárias por clínica)
DROP TABLE IF EXISTS admin_operacoes_log CASCADE;
DROP TABLE IF EXISTS admin_profiles CASCADE;
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS clinicas_central CASCADE;
DROP TABLE IF EXISTS database_connections_monitor CASCADE;
DROP TABLE IF EXISTS configuracoes_sistema_central CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;

-- ETAPA 2: REMOVER clinica_id DAS TABELAS OPERACIONAIS (não necessário em banco isolado)
-- Como cada banco será de uma clínica específica, não precisamos do clinica_id para isolamento

-- Remover clinica_id de tabelas principais
ALTER TABLE pacientes DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE medicos DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE agendamentos DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE exames DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE funcionarios DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE categorias_exames DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE convenios DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE exames_valores DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE medicos_indisponibilidade DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE lista_espera_agendamentos DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE atestados_medicos DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE anotacoes_medicas DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE agendamentos_historico DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE medicos_logs DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE medicos_sessoes DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE funcionarios_logs DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE funcionarios_sessoes DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE assinaturas DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE email_lembretes DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE configuracoes_automacao DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE configuracoes_email DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE notificacoes_pagamento DROP COLUMN IF EXISTS clinica_id CASCADE;

-- ETAPA 3: CRIAR TABELA DE METADATA ÚNICA DA CLÍNICA
CREATE TABLE IF NOT EXISTS clinica_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_clinica TEXT NOT NULL,
    subdominio TEXT UNIQUE NOT NULL,
    cnpj TEXT,
    email_responsavel TEXT NOT NULL,
    telefone TEXT,
    endereco_completo TEXT,
    configuracoes JSONB DEFAULT '{}',
    plano_contratado TEXT DEFAULT 'basico',
    status TEXT DEFAULT 'ativa',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir dados padrão da clínica (será customizado após clonagem)
INSERT INTO clinica_info (nome_clinica, subdominio, email_responsavel) 
VALUES ('Clínica Modelo', 'clinica-modelo', 'admin@clinica-modelo.com')
ON CONFLICT (subdominio) DO NOTHING;

-- ETAPA 4: AJUSTAR RLS PARA MODELO SINGLE-TENANT
-- Como agora cada banco é de uma clínica, podemos simplificar as políticas RLS
-- Remover políticas complexas de isolamento por clínica e focar em usuários/roles

-- Dropar políticas RLS existentes que dependiam de clinica_id
DROP POLICY IF EXISTS "Acesso_total_single_tenant" ON agendamentos;
DROP POLICY IF EXISTS "Acesso_total_single_tenant" ON exames;
DROP POLICY IF EXISTS "Acesso_total_single_tenant" ON funcionarios;
DROP POLICY IF EXISTS "Medicos isolados por clinica_simples" ON medicos;

-- Criar política simples de acesso total (já que o banco é isolado por clínica)
CREATE POLICY "single_tenant_access" ON pacientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "single_tenant_access" ON medicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "single_tenant_access" ON agendamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "single_tenant_access" ON exames FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "single_tenant_access" ON funcionarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "single_tenant_access" ON categorias_exames FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "single_tenant_access" ON convenios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "single_tenant_access" ON exames_valores FOR ALL USING (true) WITH CHECK (true);

-- ETAPA 5: FUNÇÃO PARA DEFINIR CONTEXTO DA CLÍNICA
CREATE OR REPLACE FUNCTION set_current_clinic_context(clinic_subdomain TEXT)
RETURNS VOID AS $$
BEGIN
    -- Define o contexto da clínica para a sessão
    PERFORM set_config('app.current_clinic_subdomain', clinic_subdomain, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ETAPA 6: LIMPAR CONFIGURAÇÕES DESNECESSÁRIAS
-- Simplificar configuracoes_clinica removendo campos específicos de multi-tenant
ALTER TABLE configuracoes_clinica DROP COLUMN IF EXISTS clinica_id CASCADE;

-- Adicionar configuração única da clínica
INSERT INTO configuracoes_clinica (
    email_login_clinica,
    senha_acesso_clinica,
    codigo_acesso_admin,
    codigo_acesso_funcionario,
    telemedicina_ativa,
    verificacao_automatica
) VALUES (
    'admin@clinica.com',
    'clinica@segura2024',
    'admin2024',
    'func2024', 
    false,
    false
) ON CONFLICT DO NOTHING;

-- ETAPA 7: TRIGGER PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinica_info_updated_at
    BEFORE UPDATE ON clinica_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();