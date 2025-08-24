
-- Primeiro, vamos garantir que existe apenas uma clínica com UUID fixo válido
-- e ajustar todas as tabelas para usar esse UUID fixo

-- 1. Definir um UUID fixo para a clínica única
-- UUID fixo: 00000000-0000-0000-0000-000000000001 (formato válido)

-- Limpar dados existentes e criar a clínica única
DELETE FROM public.clinicas;

-- Inserir a clínica única com UUID fixo válido
INSERT INTO public.clinicas (
  id,
  nome,
  email,
  telefone,
  endereco,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Clínica Jackson',
  'jackson@gmail.com',
  '(11) 99999-9999',
  'Rua da Clínica, 123 - São Paulo, SP',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  telefone = EXCLUDED.telefone,
  endereco = EXCLUDED.endereco,
  updated_at = NOW();

-- 2. Atualizar todas as tabelas para usar o UUID fixo da clínica
-- Atualizar pacientes
UPDATE public.pacientes 
SET clinica_id = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE clinica_id IS NULL OR clinica_id != '00000000-0000-0000-0000-000000000001'::uuid;

-- Atualizar médicos
UPDATE public.medicos 
SET clinica_id = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE clinica_id IS NULL OR clinica_id != '00000000-0000-0000-0000-000000000001'::uuid;

-- Atualizar exames
UPDATE public.exames 
SET clinica_id = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE clinica_id IS NULL OR clinica_id != '00000000-0000-0000-0000-000000000001'::uuid;

-- Atualizar agendamentos
UPDATE public.agendamentos 
SET clinica_id = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE clinica_id IS NULL OR clinica_id != '00000000-0000-0000-0000-000000000001'::uuid;

-- Atualizar categorias_exames
UPDATE public.categorias_exames 
SET clinica_id = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE clinica_id IS NULL OR clinica_id != '00000000-0000-0000-0000-000000000001'::uuid;

-- Atualizar funcionários
UPDATE public.funcionarios 
SET clinica_id = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE clinica_id IS NULL OR clinica_id != '00000000-0000-0000-0000-000000000001'::uuid;

-- Atualizar assinaturas
UPDATE public.assinaturas 
SET clinica_id = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE clinica_id IS NULL OR clinica_id != '00000000-0000-0000-0000-000000000001'::uuid;

-- 3. Alterar as colunas clinica_id para ter valor padrão com UUID fixo
ALTER TABLE public.pacientes 
ALTER COLUMN clinica_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;

ALTER TABLE public.medicos 
ALTER COLUMN clinica_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;

ALTER TABLE public.exames 
ALTER COLUMN clinica_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;

ALTER TABLE public.agendamentos 
ALTER COLUMN clinica_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;

ALTER TABLE public.categorias_exames 
ALTER COLUMN clinica_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;

ALTER TABLE public.funcionarios 
ALTER COLUMN clinica_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;

ALTER TABLE public.assinaturas 
ALTER COLUMN clinica_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;

-- 4. Criar uma assinatura ativa para a clínica única
INSERT INTO public.assinaturas (
  id,
  clinica_id,
  status,
  valor,
  proximo_pagamento,
  dias_restantes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'ativa',
  150.00,
  CURRENT_DATE + INTERVAL '30 days',
  30,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;
