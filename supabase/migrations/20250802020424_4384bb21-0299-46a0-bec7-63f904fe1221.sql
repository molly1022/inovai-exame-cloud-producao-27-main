-- Corrigir trigger para calcular repasses médicos para todos os status finalizados
DROP TRIGGER IF EXISTS trigger_calcular_repasse_medico ON agendamentos;

CREATE OR REPLACE FUNCTION public.calcular_repasse_medico()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    medico_percentual NUMERIC;
    valor_repasse_calculado NUMERIC;
    mes_ref DATE;
BEGIN
    -- Processar se mudou para status finalizado (concluido ou concluida)
    IF (NEW.status IN ('concluido', 'concluida')) AND 
       (OLD.status IS NULL OR OLD.status NOT IN ('concluido', 'concluida')) AND 
       NEW.valor_pago > 0 AND NEW.medico_id IS NOT NULL THEN
        
        -- Buscar percentual do médico
        SELECT percentual_repasse INTO medico_percentual
        FROM medicos 
        WHERE id = NEW.medico_id AND clinica_id = NEW.clinica_id;
        
        -- Se médico tem percentual definido, calcular repasse
        IF medico_percentual IS NOT NULL AND medico_percentual > 0 THEN
            valor_repasse_calculado := (NEW.valor_pago * medico_percentual / 100);
            mes_ref := DATE_TRUNC('month', NEW.data_agendamento)::DATE;
            
            -- Verificar se já existe repasse para evitar duplicação
            IF NOT EXISTS (
                SELECT 1 FROM repasses_medicos 
                WHERE agendamento_id = NEW.id
            ) THEN
                -- Inserir registro de repasse
                INSERT INTO repasses_medicos (
                    clinica_id,
                    medico_id,
                    agendamento_id,
                    valor_consulta,
                    percentual_repasse,
                    valor_repasse,
                    mes_referencia
                ) VALUES (
                    NEW.clinica_id,
                    NEW.medico_id,
                    NEW.id,
                    NEW.valor_pago,
                    medico_percentual,
                    valor_repasse_calculado,
                    mes_ref
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Recriar trigger
CREATE TRIGGER trigger_calcular_repasse_medico 
    AFTER UPDATE ON agendamentos 
    FOR EACH ROW 
    EXECUTE FUNCTION calcular_repasse_medico();

-- Função para processar repasses retroativos de consultas já concluídas
CREATE OR REPLACE FUNCTION public.processar_repasses_retroativos(p_clinica_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    repasses_criados INTEGER := 0;
    agendamento_record RECORD;
    medico_percentual NUMERIC;
    valor_repasse_calculado NUMERIC;
    mes_ref DATE;
BEGIN
    -- Buscar agendamentos concluídos sem repasse
    FOR agendamento_record IN
        SELECT a.*
        FROM agendamentos a
        WHERE a.clinica_id = p_clinica_id
        AND a.status IN ('concluido', 'concluida')
        AND a.valor_pago > 0
        AND a.medico_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM repasses_medicos r 
            WHERE r.agendamento_id = a.id
        )
    LOOP
        -- Buscar percentual do médico
        SELECT percentual_repasse INTO medico_percentual
        FROM medicos 
        WHERE id = agendamento_record.medico_id 
        AND clinica_id = agendamento_record.clinica_id;
        
        -- Se médico tem percentual definido, calcular repasse
        IF medico_percentual IS NOT NULL AND medico_percentual > 0 THEN
            valor_repasse_calculado := (agendamento_record.valor_pago * medico_percentual / 100);
            mes_ref := DATE_TRUNC('month', agendamento_record.data_agendamento)::DATE;
            
            -- Inserir registro de repasse
            INSERT INTO repasses_medicos (
                clinica_id,
                medico_id,
                agendamento_id,
                valor_consulta,
                percentual_repasse,
                valor_repasse,
                mes_referencia
            ) VALUES (
                agendamento_record.clinica_id,
                agendamento_record.medico_id,
                agendamento_record.id,
                agendamento_record.valor_pago,
                medico_percentual,
                valor_repasse_calculado,
                mes_ref
            );
            
            repasses_criados := repasses_criados + 1;
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'repasses_criados', repasses_criados,
        'clinica_id', p_clinica_id
    );
END;
$function$;