-- Corrigir erro ao excluir pacientes
-- O erro ocorre porque a tabela email_lembretes tem foreign key para agendamentos
-- mas não permite exclusão em cascata

-- 1. Primeiro, remover a constraint existente
ALTER TABLE email_lembretes 
DROP CONSTRAINT IF EXISTS email_lembretes_agendamento_id_fkey;

-- 2. Recriar a constraint com CASCADE para permitir exclusão automática
ALTER TABLE email_lembretes 
ADD CONSTRAINT email_lembretes_agendamento_id_fkey 
FOREIGN KEY (agendamento_id) 
REFERENCES agendamentos(id) 
ON DELETE CASCADE;

-- 3. Também corrigir as outras foreign keys de agendamentos para CASCADE
ALTER TABLE agendamentos_historico 
DROP CONSTRAINT IF EXISTS agendamentos_historico_agendamento_id_fkey;

ALTER TABLE agendamentos_historico 
ADD CONSTRAINT agendamentos_historico_agendamento_id_fkey 
FOREIGN KEY (agendamento_id) 
REFERENCES agendamentos(id) 
ON DELETE CASCADE;

-- 4. Corrigir reagendamentos para CASCADE também
ALTER TABLE reagendamentos 
DROP CONSTRAINT IF EXISTS reagendamentos_agendamento_original_id_fkey;

ALTER TABLE reagendamentos 
DROP CONSTRAINT IF EXISTS reagendamentos_agendamento_novo_id_fkey;

ALTER TABLE reagendamentos 
ADD CONSTRAINT reagendamentos_agendamento_original_id_fkey 
FOREIGN KEY (agendamento_original_id) 
REFERENCES agendamentos(id) 
ON DELETE CASCADE;

ALTER TABLE reagendamentos 
ADD CONSTRAINT reagendamentos_agendamento_novo_id_fkey 
FOREIGN KEY (agendamento_novo_id) 
REFERENCES agendamentos(id) 
ON DELETE CASCADE;

-- 5. Garantir que agendamentos sejam excluídos em cascata quando paciente for excluído
ALTER TABLE agendamentos 
DROP CONSTRAINT IF EXISTS agendamentos_paciente_id_fkey;

ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_paciente_id_fkey 
FOREIGN KEY (paciente_id) 
REFERENCES pacientes(id) 
ON DELETE CASCADE;

-- 6. Corrigir exames para CASCADE também
ALTER TABLE exames 
DROP CONSTRAINT IF EXISTS exames_paciente_id_fkey;

ALTER TABLE exames 
ADD CONSTRAINT exames_paciente_id_fkey 
FOREIGN KEY (paciente_id) 
REFERENCES pacientes(id) 
ON DELETE CASCADE;

-- 7. Corrigir anotações médicas para CASCADE
ALTER TABLE anotacoes_medicas 
DROP CONSTRAINT IF EXISTS fk_anotacoes_paciente;

ALTER TABLE anotacoes_medicas 
ADD CONSTRAINT fk_anotacoes_paciente 
FOREIGN KEY (paciente_id) 
REFERENCES pacientes(id) 
ON DELETE CASCADE;

-- 8. Corrigir receitas médicas para CASCADE
ALTER TABLE receitas_medicas 
DROP CONSTRAINT IF EXISTS fk_receitas_paciente;

ALTER TABLE receitas_medicas 
ADD CONSTRAINT fk_receitas_paciente 
FOREIGN KEY (paciente_id) 
REFERENCES pacientes(id) 
ON DELETE CASCADE;