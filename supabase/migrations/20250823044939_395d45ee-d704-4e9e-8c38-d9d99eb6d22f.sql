-- Remover triggers e funções problemáticos com CASCADE
DROP FUNCTION IF EXISTS public.atualizar_valor_assinatura_dinamico() CASCADE;
DROP FUNCTION IF EXISTS public.calcular_proximo_pagamento(date, integer) CASCADE;
DROP FUNCTION IF EXISTS public.update_proximo_pagamento() CASCADE;