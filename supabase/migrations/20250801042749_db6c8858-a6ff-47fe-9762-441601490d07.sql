-- Atualizar os descontos corretos nos planos existentes
UPDATE planos_assinatura 
SET percentual_desconto = 5.00,
    valor_final = ROUND(valor_base * 0.95, 2)
WHERE periodo_meses = 3;

UPDATE planos_assinatura 
SET percentual_desconto = 10.00,
    valor_final = ROUND(valor_base * 0.90, 2)
WHERE periodo_meses = 6;

UPDATE planos_assinatura 
SET percentual_desconto = 15.00,
    valor_final = ROUND(valor_base * 0.85, 2)
WHERE periodo_meses = 12;

-- Garantir que os valores mensais não tenham desconto
UPDATE planos_assinatura 
SET percentual_desconto = 0.00,
    valor_final = valor_base
WHERE periodo_meses = 1;

-- Atualizar trigger para recalcular valores automaticamente quando médicos mudam
CREATE OR REPLACE FUNCTION public.atualizar_valor_assinatura_por_medicos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    total_medicos INTEGER;
    valor_por_medico NUMERIC;
    plano_info RECORD;
    novo_valor NUMERIC;
BEGIN
    -- Buscar informações do plano
    SELECT pa.valor_por_medico, a.periodo_meses, pa.percentual_desconto 
    INTO plano_info
    FROM assinaturas a
    JOIN planos_assinatura pa ON a.tipo_plano = pa.tipo_plano AND a.periodo_meses = pa.periodo_meses
    WHERE a.clinica_id = COALESCE(NEW.clinica_id, OLD.clinica_id)
    AND a.status = 'ativa'
    LIMIT 1;
    
    -- Contar médicos ativos
    SELECT COUNT(*) INTO total_medicos
    FROM medicos
    WHERE clinica_id = COALESCE(NEW.clinica_id, OLD.clinica_id) 
    AND ativo = true;
    
    -- Garantir pelo menos 1 médico
    total_medicos := GREATEST(total_medicos, 1);
    
    -- Calcular novo valor considerando desconto do período
    valor_por_medico := COALESCE(plano_info.valor_por_medico, 175.00);
    novo_valor := total_medicos * valor_por_medico;
    
    -- Aplicar desconto do período se houver
    IF plano_info.percentual_desconto > 0 THEN
        novo_valor := novo_valor * (1 - plano_info.percentual_desconto / 100);
    END IF;
    
    -- Atualizar valor da assinatura
    UPDATE assinaturas 
    SET valor = ROUND(novo_valor, 2),
        updated_at = now()
    WHERE clinica_id = COALESCE(NEW.clinica_id, OLD.clinica_id)
    AND status = 'ativa';
    
    -- Log da atualização
    INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
    VALUES (
        'VALOR_ASSINATURA_ATUALIZADO',
        'assinaturas',
        jsonb_build_object(
            'clinica_id', COALESCE(NEW.clinica_id, OLD.clinica_id),
            'total_medicos', total_medicos,
            'valor_por_medico', valor_por_medico,
            'novo_valor', novo_valor,
            'trigger_action', TG_OP
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;