-- CORREÇÃO DA MIGRAÇÃO ANTERIOR
-- Inserir configuração básica apenas com colunas existentes

-- Verificar se já existe configuração, se não inserir uma básica
INSERT INTO configuracoes_clinica (
    email_login_clinica,
    senha_acesso_clinica,
    codigo_acesso_admin,
    telemedicina_ativa,
    verificacao_automatica
) VALUES (
    'admin@clinica.com',
    'clinica@segura2024',
    'admin2024',
    false,
    false
) ON CONFLICT (id) DO NOTHING;

-- Remover tabela metadata antiga se existir e recriar limpa
DROP TABLE IF EXISTS clinica_metadata CASCADE;