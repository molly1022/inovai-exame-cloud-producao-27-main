-- Identificar e remover triggers problemáticos
DROP TRIGGER IF EXISTS atualizar_assinatura_trigger ON public.assinaturas;
DROP FUNCTION IF EXISTS public.atualizar_valor_assinatura_dinamico();

-- Remover outras funções que podem dar problemas
DROP FUNCTION IF EXISTS public.calcular_proximo_pagamento(date, integer);
DROP FUNCTION IF EXISTS public.update_proximo_pagamento();
DROP TRIGGER IF EXISTS update_proximo_pagamento_trigger ON public.assinaturas;