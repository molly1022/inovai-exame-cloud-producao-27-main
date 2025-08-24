-- FASE 2.2: REMOÇÃO SIMPLIFICADA DAS POLÍTICAS RESTANTES

-- Listar e remover políticas manualmente das tabelas principais
DROP POLICY IF EXISTS "Pacientes isolamento por clinica - admin/funcionario" ON pacientes CASCADE;
DROP POLICY IF EXISTS "Medicos podem ver pacientes da sua clinica" ON pacientes CASCADE;
DROP POLICY IF EXISTS "Pacientes podem ver seus próprios dados" ON pacientes CASCADE;

-- Tentar com CASCADE para forçar remoção
ALTER TABLE pacientes DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE medicos DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE funcionarios DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE agendamentos DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE exames DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE atestados_medicos DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE anotacoes_medicas DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE categorias_exames DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE exames_valores DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE convenios DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE lista_espera_agendamentos DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE medicos_indisponibilidade DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE configuracoes_automacao DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE configuracoes_email DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE email_lembretes DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE funcionarios_logs DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE funcionarios_sessoes DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE medicos_login DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE codigos_recuperacao DROP COLUMN IF EXISTS clinica_id CASCADE;
ALTER TABLE assinaturas DROP COLUMN IF EXISTS clinica_id CASCADE;

-- Se receitas_medicas existir
ALTER TABLE receitas_medicas DROP COLUMN IF EXISTS clinica_id CASCADE;

-- Log da remoção
INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
  'CLINICA_ID_COLUMNS_REMOVED',
  'sistema_completo',
  jsonb_build_object(
    'tipo', 'remocao_colunas_clinica_id',
    'data_execucao', NOW(),
    'status', 'forcado_com_cascade'
  )
);