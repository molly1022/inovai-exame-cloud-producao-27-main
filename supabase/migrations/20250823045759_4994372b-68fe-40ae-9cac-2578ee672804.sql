-- Remover todas as funções problemáticas relacionadas a assinaturas e planos
DROP FUNCTION IF EXISTS public.atualizar_valor_assinatura_por_medicos() CASCADE;
DROP FUNCTION IF EXISTS public.calcular_valor_por_medicos() CASCADE;
DROP FUNCTION IF EXISTS public.atualizar_limites_plano() CASCADE;
DROP FUNCTION IF EXISTS public.sync_categoria_valores() CASCADE;

-- Remover outros triggers problemáticos
DROP TRIGGER IF EXISTS sync_categoria_valores_trigger ON public.categorias_exames CASCADE;