-- Corrigir problemas de segurança identificados pelo linter

-- 1. Corrigir Function Search Path Mutable
-- Atualizar a função update_updated_at_column para ter search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Criar função segura para verificar roles de admin
CREATE OR REPLACE FUNCTION public.is_admin_sistema()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER 
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'role', '') = 'admin_sistema';
$$;

-- 3. Atualizar as policies para usar a função segura
-- Remover policies antigas
DROP POLICY IF EXISTS "Apenas admins podem ver clínicas" ON public.clinicas_central;
DROP POLICY IF EXISTS "Apenas admins podem inserir clínicas" ON public.clinicas_central;  
DROP POLICY IF EXISTS "Apenas admins podem atualizar clínicas" ON public.clinicas_central;
DROP POLICY IF EXISTS "Apenas admins podem modificar planos" ON public.planos_sistema;
DROP POLICY IF EXISTS "Apenas admins acessam configurações" ON public.configuracoes_sistema;
DROP POLICY IF EXISTS "Apenas admins veem logs" ON public.logs_sistema;
DROP POLICY IF EXISTS "Apenas admins acessam métricas" ON public.metricas_sistema;
DROP POLICY IF EXISTS "Apenas admins veem conexões" ON public.conexoes_clinicas;

-- Recriar policies com função segura
CREATE POLICY "Apenas admins podem ver clínicas" 
ON public.clinicas_central FOR SELECT 
USING (public.is_admin_sistema());

CREATE POLICY "Apenas admins podem inserir clínicas" 
ON public.clinicas_central FOR INSERT 
WITH CHECK (public.is_admin_sistema());

CREATE POLICY "Apenas admins podem atualizar clínicas" 
ON public.clinicas_central FOR UPDATE 
USING (public.is_admin_sistema());

CREATE POLICY "Apenas admins podem modificar planos" 
ON public.planos_sistema FOR ALL 
USING (public.is_admin_sistema());

CREATE POLICY "Apenas admins acessam configurações" 
ON public.configuracoes_sistema FOR ALL 
USING (public.is_admin_sistema());

CREATE POLICY "Apenas admins veem logs" 
ON public.logs_sistema FOR SELECT 
USING (public.is_admin_sistema());

CREATE POLICY "Apenas admins acessam métricas" 
ON public.metricas_sistema FOR ALL 
USING (public.is_admin_sistema());

CREATE POLICY "Apenas admins veem conexões" 
ON public.conexoes_clinicas FOR SELECT 
USING (public.is_admin_sistema());