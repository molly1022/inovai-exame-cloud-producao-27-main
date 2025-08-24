-- FASE 3: Inserir dados iniciais e funções principais

-- Template de schema para clínicas
INSERT INTO public.schema_templates (nome, versao, sql_script, descricao) VALUES (
'schema_clinica_v1', 
'1.0.0', 
'-- Schema completo para clínica individual
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    email TEXT,
    telefone TEXT,
    data_nascimento DATE,
    endereco TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    crm TEXT,
    especialidade TEXT,
    email TEXT,
    telefone TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES pacientes(id),
    medico_id UUID REFERENCES medicos(id),
    data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_exame TEXT NOT NULL,
    status TEXT DEFAULT ''agendado'',
    observacoes TEXT,
    valor_exame NUMERIC DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_medicos_cpf ON medicos(cpf);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);',
'Template inicial de schema para clínicas - versão 1.0.0'
) ON CONFLICT (nome, versao) DO NOTHING;

-- Configurações do sistema
INSERT INTO public.configuracoes_sistema_central (chave, valor, categoria, descricao) VALUES 
('database_per_tenant_enabled', 'true', 'architecture', 'Sistema database-per-tenant ativo'),
('max_clinicas', '1000', 'limits', 'Máximo de clínicas permitidas'),
('default_schema_version', '1.0.0', 'database', 'Versão padrão do schema para novas clínicas'),
('backup_retention_days', '30', 'backup', 'Dias de retenção de backup'),
('connection_pool_size', '10', 'database', 'Tamanho do pool de conexões por clínica')
ON CONFLICT (chave) DO NOTHING;

-- Versão inicial
INSERT INTO public.sistema_versoes (versao_schema, descricao) VALUES 
('1.0.0', 'Implementação inicial da arquitetura Database-per-Tenant');