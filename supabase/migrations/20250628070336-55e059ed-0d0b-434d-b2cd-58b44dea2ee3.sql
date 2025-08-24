
-- Criar tabela para valores dos exames
CREATE TABLE public.exames_valores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  tipo_exame TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar campos de valor e status de pagamento na tabela agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS valor_exame DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(10,2) DEFAULT 0.00;

-- Inserir alguns valores de exemplo (opcional)
INSERT INTO public.exames_valores (clinica_id, tipo_exame, valor, descricao) VALUES
('00000000-0000-0000-0000-000000000001', 'Consulta Geral', 150.00, 'Consulta médica geral'),
('00000000-0000-0000-0000-000000000001', 'Exame de Sangue', 80.00, 'Hemograma completo'),
('00000000-0000-0000-0000-000000000001', 'Ultrassom', 120.00, 'Ultrassom abdominal'),
('00000000-0000-0000-0000-000000000001', 'Raio-X', 90.00, 'Radiografia simples');

-- Comentário sobre status de pagamento:
-- 'pendente' = Não pago
-- 'pago' = Totalmente pago
-- 'parcial' = 50% pago
-- 'pagar_no_dia' = Pagar no dia do exame
