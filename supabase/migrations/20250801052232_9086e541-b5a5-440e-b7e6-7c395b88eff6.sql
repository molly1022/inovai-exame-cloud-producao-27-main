-- Corrigir sistema de cobrança por médicos: 1 médico incluído + R$ 175 por médico adicional

-- Atualizar função para calcular valor baseado em 1 médico incluído
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
    SELECT pa.valor_por_medico, a.periodo_meses, pa.percentual_desconto, pa.valor_final
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
    
    -- Calcular médicos extras (acima de 1)
    medicos_extras := GREATEST(total_medicos - 1, 0);
    
    -- Usar valor_final do plano como base (que já inclui 1 médico)
    valor_base_plano := COALESCE(plano_info.valor_final, 125.00);
    
    -- Calcular novo valor: valor base + (médicos extras * R$ 175)
    novo_valor := valor_base_plano + (medicos_extras * 175.00);
    
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
        'VALOR_ASSINATURA_ATUALIZADO_NOVO_MODELO',
        'assinaturas',
        jsonb_build_object(
            'clinica_id', COALESCE(NEW.clinica_id, OLD.clinica_id),
            'total_medicos', total_medicos,
            'medicos_extras', medicos_extras,
            'valor_base_plano', valor_base_plano,
            'novo_valor', novo_valor,
            'trigger_action', TG_OP
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Atualizar valores das clínicas de teste existentes com o novo modelo
UPDATE public.assinaturas 
SET valor = 125.00  -- 1 médico incluído no plano básico intermediário
WHERE clinica_id IN (
    SELECT id FROM clinicas WHERE email = 'teste.intermediario@exemplo.com'
);

UPDATE public.assinaturas 
SET valor = 299.00  -- 1 médico incluído no plano avançado
WHERE clinica_id IN (
    SELECT id FROM clinicas WHERE email = 'teste.avancado@exemplo.com'
);