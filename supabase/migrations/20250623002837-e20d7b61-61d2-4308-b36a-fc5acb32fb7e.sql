
-- Remover a constraint existente que está causando o erro
ALTER TABLE public.funcionarios 
DROP CONSTRAINT IF EXISTS funcionarios_funcao_check;

-- Adicionar uma nova constraint mais flexível para a coluna funcao
-- Permitindo qualquer texto não vazio
ALTER TABLE public.funcionarios 
ADD CONSTRAINT funcionarios_funcao_check 
CHECK (funcao IS NOT NULL AND length(trim(funcao)) > 0);

-- Verificar se existem outras constraints que podem estar causando problemas
-- e garantir que a tabela esteja configurada corretamente

-- Comentário: Esta correção remove a constraint restritiva e permite 
-- qualquer função válida (texto não vazio) na tabela funcionarios
