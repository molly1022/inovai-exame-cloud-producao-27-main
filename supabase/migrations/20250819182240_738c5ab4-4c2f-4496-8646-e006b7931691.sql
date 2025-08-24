-- FASE 1: REMOVER POLÍTICAS RLS QUE DEPENDEM DE clinica_id
-- Antes de remover a coluna clinica_id, precisamos remover as policies que a referenciam

-- 1. REMOVER POLÍTICAS RLS DA TABELA AGENDAMENTOS
DROP POLICY IF EXISTS "Users can view agendamentos from their clinic" ON agendamentos;
DROP POLICY IF EXISTS "Users can insert agendamentos to their clinic" ON agendamentos;
DROP POLICY IF EXISTS "Users can update agendamentos from their clinic" ON agendamentos;
DROP POLICY IF EXISTS "Agendamentos isolados por clinica" ON agendamentos;

-- 2. REMOVER POLÍTICAS RLS DA TABELA AGENDAMENTOS_HISTORICO
DROP POLICY IF EXISTS "Historico agendamentos isolamento" ON agendamentos_historico;
DROP POLICY IF EXISTS "Histórico de agendamentos isolado por clínica" ON agendamentos_historico;
DROP POLICY IF EXISTS "Historico de agendamentos isolado por clinica" ON agendamentos_historico;
DROP POLICY IF EXISTS "Historico agendamentos isolado por clinica" ON agendamentos_historico;

-- 3. REMOVER POLÍTICAS RLS DA TABELA STATUS_TRANSITION_LOG (se existir)
DROP POLICY IF EXISTS "Status transition log isolado por clinica" ON status_transition_log;

-- 4. REMOVER POLÍTICAS DE TODAS AS OUTRAS TABELAS OPERACIONAIS
DROP POLICY IF EXISTS "Clínicas podem gerenciar suas categorias" ON categorias_exames;
DROP POLICY IF EXISTS "Categorias isolamento por clinica" ON categorias_exames;

DROP POLICY IF EXISTS "Clínicas podem gerenciar convênios" ON convenios;

DROP POLICY IF EXISTS "Valores de exames isolados por clinica" ON exames_valores;
DROP POLICY IF EXISTS "Valores de exames isolados por clínica" ON exames_valores;

DROP POLICY IF EXISTS "Exames isolados por clinica - admin/funcionario" ON exames;

DROP POLICY IF EXISTS "Funcionários podem ser visualizados pela clínica" ON funcionarios;

DROP POLICY IF EXISTS "Funcionarios logs isolados por clinica" ON funcionarios_logs;

DROP POLICY IF EXISTS "Funcionarios sessoes isoladas por clinica" ON funcionarios_sessoes;

DROP POLICY IF EXISTS "Lista espera isolada por clinica" ON lista_espera_agendamentos;

DROP POLICY IF EXISTS "Clínicas podem gerenciar indisponibilidade de seus médicos" ON medicos_indisponibilidade;
DROP POLICY IF EXISTS "Medicos indisponibilidade isolados por clinica" ON medicos_indisponibilidade;

DROP POLICY IF EXISTS "Clínicas podem gerenciar logins de médicos" ON medicos_login;

DROP POLICY IF EXISTS "Atestados isolados por clinica - admin/funcionario" ON atestados_medicos;

DROP POLICY IF EXISTS "Configuracoes de automacao isoladas por clinica" ON configuracoes_automacao;
DROP POLICY IF EXISTS "Configurações de automação isoladas por clínica" ON configuracoes_automacao;

DROP POLICY IF EXISTS "Configuracoes de email isoladas por clinica" ON configuracoes_email;
DROP POLICY IF EXISTS "Configurações de email isoladas por clínica" ON configuracoes_email;

DROP POLICY IF EXISTS "Email lembretes isolados por clinica" ON email_lembretes;
DROP POLICY IF EXISTS "Email lembretes isolados por clínica" ON email_lembretes;

DROP POLICY IF EXISTS "Codigos de recuperacao isolados por clinica" ON codigos_recuperacao;
DROP POLICY IF EXISTS "Códigos de recuperação isolados por clínica" ON codigos_recuperacao;

DROP POLICY IF EXISTS "Assinaturas acesso total" ON assinaturas;
DROP POLICY IF EXISTS "Clínicas podem ver suas próprias assinaturas" ON assinaturas;

-- 5. LOG DA REMOÇÃO DE POLÍTICAS
INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
  'RLS_POLICIES_REMOVED',
  'sistema_completo',
  jsonb_build_object(
    'tipo', 'database_per_tenant_preparation',
    'etapa', 'remover_policies_rls',
    'data_execucao', NOW()
  )
);