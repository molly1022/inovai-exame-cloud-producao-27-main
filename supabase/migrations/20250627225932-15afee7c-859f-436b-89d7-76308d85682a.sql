
-- Adicionar campo data_conclusao na tabela agendamentos
ALTER TABLE agendamentos 
ADD COLUMN data_conclusao TIMESTAMP WITH TIME ZONE;

-- Atualizar o campo status para incluir os novos estados
-- Não precisamos alterar a estrutura do campo, apenas documentar os novos valores permitidos:
-- 'agendado' - Consulta agendada (padrão)
-- 'confirmado' - Consulta confirmada pelo paciente
-- 'em_andamento' - Consulta em andamento
-- 'concluido' - Consulta concluída
-- 'cancelado' - Consulta cancelada
-- 'faltou' - Paciente faltou à consulta

-- Adicionar comentário para documentar os status permitidos
COMMENT ON COLUMN agendamentos.status IS 'Status da consulta: agendado, confirmado, em_andamento, concluido, cancelado, faltou';
COMMENT ON COLUMN agendamentos.data_conclusao IS 'Data e hora em que a consulta foi concluída';
