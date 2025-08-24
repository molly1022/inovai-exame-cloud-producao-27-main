
-- Adicionar campo percentual_desconto na tabela convenios
ALTER TABLE public.convenios 
ADD COLUMN percentual_desconto NUMERIC(5,2) DEFAULT 0.00 CHECK (percentual_desconto >= 0 AND percentual_desconto <= 100);

-- Comentário para o campo
COMMENT ON COLUMN public.convenios.percentual_desconto IS 'Percentual de desconto aplicado pelo convênio (0-100%)';
