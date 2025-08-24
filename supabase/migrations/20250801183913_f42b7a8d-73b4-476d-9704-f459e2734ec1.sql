-- FASE 3: Corrigir configuração da clínica específica integrammedica123123
-- Primeiro, criar a clínica se não existir
INSERT INTO public.clinicas (id, nome, email, telefone, subdominio, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Integrammedica',
  'contato@integrammedica.com',
  '(11) 99999-9999',
  'integrammedica123123',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  telefone = EXCLUDED.telefone,
  subdominio = EXCLUDED.subdominio,
  updated_at = now();

-- Criar configurações da clínica
INSERT INTO public.configuracoes_clinica (
  clinica_id,
  email_login_clinica,
  senha_acesso_clinica,
  codigo_acesso_clinica,
  codigo_acesso_funcionario,
  verificacao_automatica,
  telemedicina_ativa,
  valor_adicional_telemedicina
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'contato@integrammedica.com',
  'integrammedica2024',
  'integra2024',
  'func2024',
  false,
  true,
  0.00
) ON CONFLICT (clinica_id) DO UPDATE SET
  telemedicina_ativa = true,
  valor_adicional_telemedicina = 0.00,
  updated_at = now();

-- Criar assinatura ativa com plano avançado
INSERT INTO public.assinaturas (
  clinica_id,
  status,
  tipo_plano,
  periodo_meses,
  valor_original,
  valor,
  data_inicio,
  proximo_pagamento,
  limite_funcionarios,
  limite_medicos
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'ativa',
  'avancado',
  1,
  300.00,
  300.00,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  10,
  15
) ON CONFLICT (clinica_id) DO UPDATE SET
  status = 'ativa',
  tipo_plano = 'avancado',
  valor = 300.00,
  limite_funcionarios = 10,
  limite_medicos = 15,
  updated_at = now();

-- Criar uso mensal de teleconsultas para a clínica
INSERT INTO public.teleconsultas_uso_mensal (
  clinica_id,
  mes_referencia,
  total_utilizadas,
  pacotes_adicionais_comprados,
  valor_total_pacotes
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  0,
  0,
  0.00
) ON CONFLICT (clinica_id, mes_referencia) DO UPDATE SET
  updated_at = now();

-- Atualizar planos de assinatura para incluir configurações corretas de teleconsulta
UPDATE public.planos_assinatura 
SET 
  limite_teleconsultas_gratuitas = 0,
  valor_pacote_adicional_teleconsulta = 50.00,
  consultas_por_pacote_adicional = 10,
  funcionalidades_bloqueadas = ARRAY['telemedicina']
WHERE tipo_plano = 'basico';

UPDATE public.planos_assinatura 
SET 
  limite_teleconsultas_gratuitas = 20,
  valor_pacote_adicional_teleconsulta = 40.00,
  consultas_por_pacote_adicional = 10,
  funcionalidades_bloqueadas = ARRAY[]::text[]
WHERE tipo_plano = 'avancado';

UPDATE public.planos_assinatura 
SET 
  limite_teleconsultas_gratuitas = 50,
  valor_pacote_adicional_teleconsulta = 30.00,
  consultas_por_pacote_adicional = 15,
  funcionalidades_bloqueadas = ARRAY[]::text[]
WHERE tipo_plano = 'premium';

-- Criar função para processar compra de pacote adicional de teleconsultas
CREATE OR REPLACE FUNCTION public.processar_compra_pacote_teleconsulta(
  p_clinica_id uuid,
  p_quantidade_pacotes integer DEFAULT 1
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plano_info RECORD;
  uso_atual RECORD;
  valor_total NUMERIC;
  resultado JSON;
BEGIN
  -- Buscar informações do plano
  SELECT pa.valor_pacote_adicional_teleconsulta, pa.consultas_por_pacote_adicional
  INTO plano_info
  FROM planos_assinatura pa
  JOIN assinaturas a ON a.tipo_plano = pa.tipo_plano AND a.periodo_meses = pa.periodo_meses
  WHERE a.clinica_id = p_clinica_id AND a.status = 'ativa'
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Plano não encontrado');
  END IF;
  
  -- Calcular valor total
  valor_total := plano_info.valor_pacote_adicional_teleconsulta * p_quantidade_pacotes;
  
  -- Buscar ou criar uso mensal
  INSERT INTO teleconsultas_uso_mensal (clinica_id, mes_referencia)
  VALUES (p_clinica_id, DATE_TRUNC('month', CURRENT_DATE)::DATE)
  ON CONFLICT (clinica_id, mes_referencia) DO NOTHING;
  
  -- Atualizar pacotes comprados
  UPDATE teleconsultas_uso_mensal
  SET 
    pacotes_adicionais_comprados = pacotes_adicionais_comprados + p_quantidade_pacotes,
    valor_total_pacotes = valor_total_pacotes + valor_total,
    updated_at = now()
  WHERE clinica_id = p_clinica_id 
    AND mes_referencia = DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  resultado := json_build_object(
    'success', true,
    'pacotes_comprados', p_quantidade_pacotes,
    'valor_total', valor_total,
    'consultas_adicionadas', p_quantidade_pacotes * plano_info.consultas_por_pacote_adicional
  );
  
  RETURN resultado;
END;
$$;