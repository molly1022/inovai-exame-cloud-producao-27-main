-- Função para criar teleconsulta automaticamente quando agendamento é marcado como telemedicina
CREATE OR REPLACE FUNCTION public.criar_teleconsulta_automatica()
RETURNS TRIGGER AS $$
DECLARE
    result RECORD;
BEGIN
    -- Só processar se é telemedicina e ainda não existe teleconsulta
    IF NEW.eh_telemedicina = true AND NOT EXISTS (
        SELECT 1 FROM public.teleconsultas WHERE agendamento_id = NEW.id
    ) THEN
        
        -- Inserir teleconsulta
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
            'agendada',
            'temp-' || NEW.id::text,
            'pending',
            'pending'
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
                'paciente_id', NEW.paciente_id
            )
        );
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa após INSERT ou UPDATE em agendamentos
DROP TRIGGER IF EXISTS trigger_criar_teleconsulta_automatica ON public.agendamentos;
CREATE TRIGGER trigger_criar_teleconsulta_automatica
    AFTER INSERT OR UPDATE ON public.agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.criar_teleconsulta_automatica();

-- Função para criar sala Daily.co automaticamente
CREATE OR REPLACE FUNCTION public.processar_daily_room_automatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Só processar se teleconsulta foi criada e sala ainda não foi criada
    IF TG_OP = 'INSERT' AND NEW.sala_id LIKE 'temp-%' THEN
        
        -- Chamar edge function para criar sala Daily.co de forma assíncrona
        -- Isso será processado em background
        INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
        VALUES (
            'DAILY_ROOM_PENDENTE',
            'teleconsultas',
            jsonb_build_object(
                'teleconsulta_id', NEW.id,
                'agendamento_id', NEW.agendamento_id,
                'clinica_id', NEW.clinica_id,
                'status', 'pendente_criacao_sala'
            )
        );
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para processar criação de sala Daily.co
DROP TRIGGER IF EXISTS trigger_processar_daily_room ON public.teleconsultas;
CREATE TRIGGER trigger_processar_daily_room
    AFTER INSERT ON public.teleconsultas
    FOR EACH ROW
    EXECUTE FUNCTION public.processar_daily_room_automatico();