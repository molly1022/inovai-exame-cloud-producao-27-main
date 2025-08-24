-- Atualizar tabela planos_assinatura para novo modelo por médico
ALTER TABLE public.planos_assinatura 
ADD COLUMN IF NOT EXISTS modelo_cobranca text DEFAULT 'fixo',
ADD COLUMN IF NOT EXISTS valor_por_medico numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS inclui_funcionarios boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS limite_funcionarios_inclusos integer DEFAULT 0;

-- Inserir novos planos baseados no modelo por médico
INSERT INTO public.planos_assinatura (
  tipo_plano, 
  periodo_meses, 
  valor_base, 
  valor_final, 
  valor_por_medico,
  modelo_cobranca,
  inclui_funcionarios,
  limite_funcionarios_inclusos,
  funcionalidades_bloqueadas,
  ativo
) VALUES 
-- Plano Básico Por Médico
('basico_medico', 1, 125.00, 125.00, 125.00, 'por_medico', true, 0, 
 ARRAY['relatorios_avancados', 'integracao_whatsapp', 'backup_automatico'], true),
('basico_medico', 3, 125.00, 112.50, 112.50, 'por_medico', true, 0, 
 ARRAY['relatorios_avancados', 'integracao_whatsapp', 'backup_automatico'], true),
('basico_medico', 12, 125.00, 100.00, 100.00, 'por_medico', true, 0, 
 ARRAY['relatorios_avancados', 'integracao_whatsapp', 'backup_automatico'], true),

-- Plano Intermediário Por Médico  
('intermediario_medico', 1, 190.00, 190.00, 190.00, 'por_medico', true, 0, 
 ARRAY['integracao_whatsapp', 'backup_automatico'], true),
('intermediario_medico', 3, 190.00, 171.00, 171.00, 'por_medico', true, 0, 
 ARRAY['integracao_whatsapp', 'backup_automatico'], true), 
('intermediario_medico', 12, 190.00, 152.00, 152.00, 'por_medico', true, 0, 
 ARRAY['integracao_whatsapp', 'backup_automatico'], true),

-- Plano Avançado Por Médico
('avancado_medico', 1, 299.00, 299.00, 299.00, 'por_medico', true, 0, 
 ARRAY[]::text[], true),
('avancado_medico', 3, 299.00, 269.10, 269.10, 'por_medico', true, 0, 
 ARRAY[]::text[], true),
('avancado_medico', 12, 299.00, 239.20, 239.20, 'por_medico', true, 0, 
 ARRAY[]::text[], true);

-- Criar função para calcular cobrança por médico
CREATE OR REPLACE FUNCTION public.calcular_cobranca_por_medico(clinica_uuid uuid, mes_ref date)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plano_atual RECORD;
  total_medicos INTEGER;
  valor_por_medico NUMERIC;
  valor_total NUMERIC;
  resultado JSON;
BEGIN
  -- Buscar plano atual da clínica
  SELECT pa.* INTO plano_atual
  FROM planos_assinatura pa
  JOIN assinaturas a ON a.tipo_plano = pa.tipo_plano
  WHERE a.clinica_id = clinica_uuid 
    AND a.status = 'ativa'
    AND pa.periodo_meses = a.periodo_meses
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN '{"error": "Plano não encontrado"}';
  END IF;
  
  -- Contar médicos ativos
  SELECT COUNT(*) INTO total_medicos
  FROM medicos
  WHERE clinica_id = clinica_uuid AND ativo = true;
  
  -- Garantir pelo menos 1 médico para cobrança
  total_medicos := GREATEST(total_medicos, 1);
  
  -- Calcular valores baseado no modelo do plano
  IF plano_atual.modelo_cobranca = 'por_medico' THEN
    valor_por_medico := plano_atual.valor_por_medico;
    valor_total := total_medicos * valor_por_medico;
  ELSE
    -- Modelo antigo (fixo)
    valor_por_medico := plano_atual.valor_final;
    valor_total := plano_atual.valor_final;
  END IF;
  
  -- Inserir/atualizar cobrança detalhada
  INSERT INTO cobranca_detalhada (
    clinica_id, mes_referencia, total_medicos, total_usuarios,
    usuarios_excedentes, medicos_excedentes, valor_base,
    valor_usuarios_extras, valor_medicos_extras, valor_total_calculado
  ) VALUES (
    clinica_uuid, mes_ref, total_medicos, 0,
    0, 0, valor_por_medico,
    0.00, 0.00, valor_total
  )
  ON CONFLICT (clinica_id, mes_referencia) 
  DO UPDATE SET
    total_medicos = EXCLUDED.total_medicos,
    valor_base = EXCLUDED.valor_base,
    valor_total_calculado = EXCLUDED.valor_total_calculado,
    updated_at = now();
  
  resultado := json_build_object(
    'modelo_cobranca', plano_atual.modelo_cobranca,
    'valor_por_medico', valor_por_medico,
    'total_medicos', total_medicos,
    'valor_total', valor_total,
    'tipo_plano', plano_atual.tipo_plano
  );
  
  RETURN resultado;
END;
$$;