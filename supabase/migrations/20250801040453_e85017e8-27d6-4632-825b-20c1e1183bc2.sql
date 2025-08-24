-- Desabilitar planos antigos
UPDATE public.planos_assinatura 
SET ativo = false 
WHERE modelo_cobranca = 'fixo' OR modelo_cobranca IS NULL;

-- Migrar todas as clínicas existentes para o novo modelo básico por médico
UPDATE public.assinaturas 
SET tipo_plano = 'basico_medico'
WHERE tipo_plano IN ('basico', 'intermediario', 'premium', 'trial');

-- Garantir que todas as clínicas tenham pelo menos 1 médico ativo para cobrança
DO $$
DECLARE
    clinica_record RECORD;
    total_medicos INTEGER;
BEGIN
    FOR clinica_record IN 
        SELECT id FROM public.clinicas
    LOOP
        -- Verificar quantos médicos ativos a clínica tem
        SELECT COUNT(*) INTO total_medicos
        FROM public.medicos 
        WHERE clinica_id = clinica_record.id AND ativo = true;
        
        -- Se não tiver médicos, criar um médico padrão
        IF total_medicos = 0 THEN
            INSERT INTO public.medicos (
                clinica_id, 
                nome_completo, 
                cpf, 
                email, 
                ativo
            ) VALUES (
                clinica_record.id,
                'Médico Principal',
                '000.000.000-00',
                'medico@clinica.com',
                true
            );
        END IF;
    END LOOP;
END $$;

-- Atualizar valores das assinaturas para o novo modelo
UPDATE public.assinaturas 
SET valor = 125.00
WHERE tipo_plano = 'basico_medico';

-- Criar função para calcular valor total baseado em médicos ativos
CREATE OR REPLACE FUNCTION public.atualizar_valor_assinatura_por_medicos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_medicos INTEGER;
    valor_por_medico NUMERIC;
    plano_info RECORD;
BEGIN
    -- Buscar informações do plano
    SELECT pa.valor_por_medico INTO valor_por_medico
    FROM assinaturas a
    JOIN planos_assinatura pa ON a.tipo_plano = pa.tipo_plano
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
    
    -- Atualizar valor da assinatura
    UPDATE assinaturas 
    SET valor = total_medicos * COALESCE(valor_por_medico, 125.00),
        updated_at = now()
    WHERE clinica_id = COALESCE(NEW.clinica_id, OLD.clinica_id)
    AND status = 'ativa';
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Criar trigger para atualizar automaticamente o valor quando médicos são adicionados/removidos
DROP TRIGGER IF EXISTS trigger_atualizar_valor_assinatura ON public.medicos;
CREATE TRIGGER trigger_atualizar_valor_assinatura
    AFTER INSERT OR UPDATE OR DELETE ON public.medicos
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_valor_assinatura_por_medicos();