-- FASE 1: Criar tabelas centrais administrativas (step by step)

-- Sistema de versionamento para controle de migrações
CREATE TABLE IF NOT EXISTS public.sistema_versoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    versao_schema TEXT NOT NULL,
    data_aplicacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    descricao TEXT,
    applied_successfully BOOLEAN DEFAULT true,
    rollback_script TEXT
);

-- Logs centralizados do sistema administrativo  
CREATE TABLE IF NOT EXISTS public.sistema_admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID,
    operacao TEXT NOT NULL,
    modulo TEXT NOT NULL,
    detalhes JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    sucesso BOOLEAN DEFAULT true,
    erro_mensagem TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações globais do sistema
CREATE TABLE IF NOT EXISTS public.configuracoes_sistema_central (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'geral',
    descricao TEXT,
    editavel BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates de schema para novos bancos
CREATE TABLE IF NOT EXISTS public.schema_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    versao TEXT NOT NULL,
    sql_script TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_schema_template_nome_versao UNIQUE (nome, versao)
);