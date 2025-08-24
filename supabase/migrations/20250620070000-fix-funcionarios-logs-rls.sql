
-- Corrigir políticas RLS para funcionarios_logs e funcionarios_sessoes

-- Remover políticas existentes
DROP POLICY IF EXISTS "Funcionarios podem ver seus proprios logs" ON public.funcionarios_logs;
DROP POLICY IF EXISTS "Permitir inserção de logs" ON public.funcionarios_logs;
DROP POLICY IF EXISTS "Permitir acesso a sessoes" ON public.funcionarios_sessoes;

-- Criar políticas mais permissivas para permitir acesso aos dados
CREATE POLICY "Permitir leitura de logs" 
ON public.funcionarios_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção de logs" 
ON public.funcionarios_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização de logs" 
ON public.funcionarios_logs 
FOR UPDATE 
USING (true);

-- Políticas para sessões
CREATE POLICY "Permitir leitura de sessoes" 
ON public.funcionarios_sessoes 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção de sessoes" 
ON public.funcionarios_sessoes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização de sessoes" 
ON public.funcionarios_sessoes 
FOR UPDATE 
USING (true);

-- Garantir que as foreign keys estão corretas
ALTER TABLE public.funcionarios_logs 
DROP CONSTRAINT IF EXISTS fk_funcionarios_logs_funcionario;

ALTER TABLE public.funcionarios_logs 
ADD CONSTRAINT fk_funcionarios_logs_funcionario 
FOREIGN KEY (funcionario_id) REFERENCES public.funcionarios(id) ON DELETE CASCADE;

ALTER TABLE public.funcionarios_sessoes 
DROP CONSTRAINT IF EXISTS fk_funcionarios_sessoes_funcionario;

ALTER TABLE public.funcionarios_sessoes 
ADD CONSTRAINT fk_funcionarios_sessoes_funcionario 
FOREIGN KEY (funcionario_id) REFERENCES public.funcionarios(id) ON DELETE CASCADE;

-- Adicionar constraint para clinica_id nas duas tabelas
ALTER TABLE public.funcionarios_logs 
DROP CONSTRAINT IF EXISTS fk_funcionarios_logs_clinica;

ALTER TABLE public.funcionarios_logs 
ADD CONSTRAINT fk_funcionarios_logs_clinica 
FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id) ON DELETE CASCADE;

ALTER TABLE public.funcionarios_sessoes 
DROP CONSTRAINT IF EXISTS fk_funcionarios_sessoes_clinica;

ALTER TABLE public.funcionarios_sessoes 
ADD CONSTRAINT fk_funcionarios_sessoes_clinica 
FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id) ON DELETE CASCADE;
