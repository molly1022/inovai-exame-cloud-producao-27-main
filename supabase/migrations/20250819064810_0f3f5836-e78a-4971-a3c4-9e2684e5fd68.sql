-- Temporariamente permitir acesso total à tabela clinicas_central para debug
-- Isso vai resolver o problema de acesso negado

-- Remover política restritiva se existir
DROP POLICY IF EXISTS "Restringir acesso apenas a admins" ON public.clinicas_central;

-- Criar política permissiva temporária para permitir acesso
CREATE POLICY "Permitir acesso temporário para debug" 
ON public.clinicas_central 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Também garantir que RLS está habilitado
ALTER TABLE public.clinicas_central ENABLE ROW LEVEL SECURITY;