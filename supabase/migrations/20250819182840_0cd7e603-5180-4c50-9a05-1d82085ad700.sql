-- FASE 2.1: REMOVER TODAS AS POLÍTICAS RLS RESTANTES QUE DEPENDEM DE clinica_id

-- Pacientes
DROP POLICY IF EXISTS "Pacientes isolamento por clinica - admin/funcionario" ON pacientes;
DROP POLICY IF EXISTS "Medicos podem ver pacientes da sua clinica" ON pacientes;
DROP POLICY IF EXISTS "Pacientes podem ver seus próprios dados" ON pacientes;
DROP POLICY IF EXISTS "Users can view pacientes from their clinic" ON pacientes;
DROP POLICY IF EXISTS "Users can insert pacientes to their clinic" ON pacientes;
DROP POLICY IF EXISTS "Users can update pacientes from their clinic" ON pacientes;
DROP POLICY IF EXISTS "Users can delete pacientes from their clinic" ON pacientes;

-- Médicos
DROP POLICY IF EXISTS "Medicos isolados por clinica_simples" ON medicos;
DROP POLICY IF EXISTS "Medicos isolados por clinica" ON medicos;
DROP POLICY IF EXISTS "Users can view medicos from their clinic" ON medicos;
DROP POLICY IF EXISTS "Users can insert medicos to their clinic" ON medicos;
DROP POLICY IF EXISTS "Users can update medicos from their clinic" ON medicos;

-- Funcionários
DROP POLICY IF EXISTS "Funcionarios isolados por clinica" ON funcionarios;
DROP POLICY IF EXISTS "Users can view funcionarios from their clinic" ON funcionarios;
DROP POLICY IF EXISTS "Users can insert funcionarios to their clinic" ON funcionarios;
DROP POLICY IF EXISTS "Users can update funcionarios from their clinic" ON funcionarios;

-- Exames
DROP POLICY IF EXISTS "Exames isolados por clinica" ON exames;
DROP POLICY IF EXISTS "Users can view exames from their clinic" ON exames;
DROP POLICY IF EXISTS "Users can insert exames to their clinic" ON exames;
DROP POLICY IF EXISTS "Users can update exames from their clinic" ON exames;

-- Atestados médicos
DROP POLICY IF EXISTS "Atestados isolados por clinica" ON atestados_medicos;
DROP POLICY IF EXISTS "Medicos podem criar atestados na sua clinica" ON atestados_medicos;
DROP POLICY IF EXISTS "Medicos podem ver atestados da sua clinica" ON atestados_medicos;

-- Receitas médicas (se existir)
DROP POLICY IF EXISTS "Receitas isoladas por clinica" ON receitas_medicas;
DROP POLICY IF EXISTS "Medicos podem criar receitas na sua clinica" ON receitas_medicas;
DROP POLICY IF EXISTS "Medicos podem ver receitas da sua clinica" ON receitas_medicas;

-- Anotações médicas
DROP POLICY IF EXISTS "Anotações médicas visíveis para mesma clínica" ON anotacoes_medicas;
DROP POLICY IF EXISTS "Usuários podem atualizar anotações médicas" ON anotacoes_medicas;
DROP POLICY IF EXISTS "Usuários podem criar anotações médicas" ON anotacoes_medicas;
DROP POLICY IF EXISTS "Usuários podem deletar anotações médicas" ON anotacoes_medicas;

-- Todas as outras tabelas que podem ter políticas pendentes
DROP POLICY IF EXISTS "Medicos login isolado por clinica" ON medicos_login;
DROP POLICY IF EXISTS "Funcionarios login isolado por clinica" ON funcionarios_login;

-- Verificar se existem outras políticas e removê-las
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop através de todas as políticas que contenham referência a clinica_id
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND (
            LOWER(policyname) LIKE '%clinica%' 
            OR LOWER(definition) LIKE '%clinica_id%'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- Log da remoção completa de políticas
INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
  'ALL_RLS_POLICIES_REMOVED',
  'sistema_completo',
  jsonb_build_object(
    'tipo', 'limpeza_completa_policies',
    'data_execucao', NOW()
  )
);