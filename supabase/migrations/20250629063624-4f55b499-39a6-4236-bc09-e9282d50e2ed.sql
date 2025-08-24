
-- Adicionar coluna metodo_pagamento na tabela agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN metodo_pagamento text;

-- Adicionar comentário para documentar os valores possíveis
COMMENT ON COLUMN public.agendamentos.metodo_pagamento IS 'Método de pagamento: dinheiro, cartao, pix, transferencia';
