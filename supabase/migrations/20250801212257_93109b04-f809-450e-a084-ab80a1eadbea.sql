-- Fase 1: Limpar triggers duplicados
DROP TRIGGER IF EXISTS trigger_auto_criar_teleconsulta ON agendamentos;
DROP FUNCTION IF EXISTS public.criar_teleconsulta_automatica();

-- Fase 2: Ajustar constraints da tabela teleconsultas
ALTER TABLE public.teleconsultas 
ALTER COLUMN url_medico DROP NOT NULL,
ALTER COLUMN url_paciente DROP NOT NULL;

-- Fase 3: Melhorar função do trigger existente
CREATE OR REPLACE FUNCTION public.criar_teleconsulta_automatica()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    result RECORD;
BEGIN
    -- Só processar se é telemedicina e ainda não existe teleconsulta
    IF NEW.eh_telemedicina = true AND NOT EXISTS (
        SELECT 1 FROM public.teleconsultas WHERE agendamento_id = NEW.id
    ) THEN
        
        -- Inserir teleconsulta com URLs NULL inicialmente
        INSERT INTO public.teleconsultas (
            clinica_id,
            agendamento_id,
            medico_id,
            paciente_id,
            status,
            sala_id,
            url_medico,
            url_paciente
        ) VALUES (
            NEW.clinica_id,
            NEW.id,
            NEW.medico_id,
            NEW.paciente_id,
            'criando_sala',
            'temp-' || NEW.id::text,
            NULL,
            NULL
        );
        
        -- Incrementar uso mensal de teleconsultas
        INSERT INTO public.teleconsultas_uso_mensal (
            clinica_id,
            mes_referencia,
            total_utilizadas
        ) VALUES (
            NEW.clinica_id,
            DATE_TRUNC('month', NEW.data_agendamento)::DATE,
            1
        )
        ON CONFLICT (clinica_id, mes_referencia)
        DO UPDATE SET 
            total_utilizadas = teleconsultas_uso_mensal.total_utilizadas + 1,
            updated_at = now();
        
        -- Log da criação
        INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
        VALUES (
            'TELECONSULTA_CRIADA_AUTO',
            'teleconsultas',
            jsonb_build_object(
                'agendamento_id', NEW.id,
                'clinica_id', NEW.clinica_id,
                'medico_id', NEW.medico_id,
                'paciente_id', NEW.paciente_id,
                'status', 'criando_sala'
            )
        );
        
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Fase 4: Melhorar função de processamento automático Daily.co
CREATE OR REPLACE FUNCTION public.processar_daily_room_automatico()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Só processar se teleconsulta foi criada com sala temporária
    IF TG_OP = 'INSERT' AND NEW.sala_id LIKE 'temp-%' AND NEW.status = 'criando_sala' THEN
        
        -- Log que sala precisa ser criada
        INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
        VALUES (
            'DAILY_ROOM_PENDENTE',
            'teleconsultas',
            jsonb_build_object(
                'teleconsulta_id', NEW.id,
                'agendamento_id', NEW.agendamento_id,
                'clinica_id', NEW.clinica_id,
                'status', 'pendente_criacao_sala',
                'action_required', 'processar_teleconsultas_pendentes'
            )
        );
        
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Verificar se trigger ainda existe e recriar se necessário
DROP TRIGGER IF EXISTS trigger_processar_daily_room ON teleconsultas;
CREATE TRIGGER trigger_processar_daily_room
    AFTER INSERT ON public.teleconsultas
    FOR EACH ROW
    EXECUTE FUNCTION public.processar_daily_room_automatico();