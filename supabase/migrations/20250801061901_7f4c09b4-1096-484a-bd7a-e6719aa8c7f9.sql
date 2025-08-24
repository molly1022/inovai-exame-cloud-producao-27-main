-- Adicionar planos semestrais (6 meses) para todos os tipos com 10% de desconto
INSERT INTO planos_assinatura (
  tipo_plano, 
  periodo_meses, 
  valor_base, 
  percentual_desconto,
  limite_funcionarios,
  limite_medicos,
  modelo_cobranca,
  ativo
) VALUES 
-- Plano Básico Semestral (6 meses)
('basico_medico', 6, 125.00, 10.0, 4, 5, 'por_medico', true),
-- Plano Intermediário Semestral (6 meses)  
('intermediario_medico', 6, 190.00, 10.0, 4, 5, 'por_medico', true),
-- Plano Avançado Semestral (6 meses)
('avancado_medico', 6, 299.00, 10.0, 4, 5, 'por_medico', true);

-- Corrigir função para calcular corretamente médicos extras como R$ 175 fixos
CREATE OR REPLACE FUNCTION public.atualizar_valor_assinatura_por_medicos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    total_medicos INTEGER;
    medicos_extras INTEGER;
    valor_base_plano NUMERIC;
    plano_info RECORD;
    novo_valor NUMERIC;
BEGIN
    -- Buscar informações do plano
    SELECT pa.valor_base, pa.percentual_desconto, a.periodo_meses
    INTO plano_info
    FROM assinaturas a
    JOIN planos_assinatura pa ON a.tipo_plano = pa.tipo_plano AND a.periodo_meses = pa.periodo_meses
    WHERE a.clinica_id = COALESCE(NEW.clinica_id, OLD.clinica_id)
    AND a.status = 'ativa'
    LIMIT 1;
    
    -- Se não encontrou plano, não faz nada
    IF NOT FOUND THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Contar médicos ativos
    SELECT COUNT(*) INTO total_medicos
    FROM medicos
    WHERE clinica_id = COALESCE(NEW.clinica_id, OLD.clinica_id) 
    AND ativo = true;
    
    -- Calcular médicos extras (acima de 1) - sempre R$ 175 fixos
    medicos_extras := GREATEST(total_medicos - 1, 0);
    
    -- Calcular valor base do plano com desconto
    valor_base_plano := plano_info.valor_base * (1 - plano_info.percentual_desconto / 100);
    
    -- Calcular novo valor: valor base do plano + (médicos extras * R$ 175 FIXOS)
    novo_valor := valor_base_plano + (medicos_extras * 175.00);
    
    -- Atualizar valor da assinatura
    UPDATE assinaturas 
    SET valor = ROUND(novo_valor, 2),
        updated_at = now()
    WHERE clinica_id = COALESCE(NEW.clinica_id, OLD.clinica_id)
    AND status = 'ativa';
    
    -- Log da atualização
    INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
    VALUES (
        'VALOR_ASSINATURA_CORRIGIDO',
        'assinaturas',
        jsonb_build_object(
            'clinica_id', COALESCE(NEW.clinica_id, OLD.clinica_id),
            'total_medicos', total_medicos,
            'medicos_extras', medicos_extras,
            'valor_base_plano', valor_base_plano,
            'novo_valor', novo_valor,
            'valor_por_medico_extra', 175.00,
            'trigger_action', TG_OP
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;