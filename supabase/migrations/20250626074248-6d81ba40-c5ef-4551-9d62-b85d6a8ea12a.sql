
-- Criar tabela para configuração de planos
CREATE TABLE public.planos_assinatura (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_meses INTEGER NOT NULL,
  valor_base NUMERIC(10,2) NOT NULL DEFAULT 280.00,
  percentual_desconto NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  valor_final NUMERIC(10,2) GENERATED ALWAYS AS (valor_base * (1 - percentual_desconto / 100)) STORED,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(periodo_meses)
);

-- Inserir planos padrão com novo valor
INSERT INTO public.planos_assinatura (periodo_meses, valor_base, percentual_desconto) VALUES
(1, 280.00, 0.00),   -- Mensal: R$ 280,00
(6, 1680.00, 25.00), -- 6 meses: R$ 1260,00 (25% desconto)
(12, 3360.00, 15.00); -- 12 meses: R$ 2856,00 (15% desconto)

-- Adicionar colunas na tabela assinaturas para suportar diferentes períodos
ALTER TABLE public.assinaturas 
ADD COLUMN periodo_meses INTEGER DEFAULT 1,
ADD COLUMN valor_original NUMERIC(10,2),
ADD COLUMN percentual_desconto NUMERIC(5,2) DEFAULT 0.00,
ADD COLUMN data_inicio DATE DEFAULT CURRENT_DATE;

-- Atualizar registros existentes com novo valor padrão
UPDATE public.assinaturas 
SET periodo_meses = 1, 
    valor_original = 280.00, 
    percentual_desconto = 0.00,
    data_inicio = CURRENT_DATE,
    valor = 280.00
WHERE periodo_meses IS NULL;

-- Alterar valor padrão da coluna valor para 280.00
ALTER TABLE public.assinaturas 
ALTER COLUMN valor SET DEFAULT 280.00;

-- Função para calcular próximo pagamento baseado no período
CREATE OR REPLACE FUNCTION calcular_proximo_pagamento(data_inicio DATE, periodo_meses INTEGER)
RETURNS DATE
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT data_inicio + INTERVAL '1 month' * periodo_meses;
$$;

-- Trigger para atualizar próximo pagamento automaticamente
CREATE OR REPLACE FUNCTION update_proximo_pagamento()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.proximo_pagamento := calcular_proximo_pagamento(NEW.data_inicio, NEW.periodo_meses);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_proximo_pagamento
  BEFORE INSERT OR UPDATE ON public.assinaturas
  FOR EACH ROW
  EXECUTE FUNCTION update_proximo_pagamento();
