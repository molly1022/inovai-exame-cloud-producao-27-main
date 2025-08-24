-- FASE 1: Corrigir CHECK Constraint
ALTER TABLE teleconsultas DROP CONSTRAINT IF EXISTS teleconsultas_status_check;

ALTER TABLE teleconsultas ADD CONSTRAINT teleconsultas_status_check 
CHECK (status IN ('agendada', 'criando_sala', 'pronta', 'em_andamento', 'concluida', 'cancelada', 'erro_criacao_sala'));

-- FASE 2: Recriar função e trigger para teleconsultas automáticas
CREATE OR REPLACE FUNCTION public.criar_teleconsulta_automatica()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Só processar se for telemedicina e não existir teleconsulta
  IF NEW.eh_telemedicina = true AND NOT EXISTS (
    SELECT 1 FROM teleconsultas WHERE agendamento_id = NEW.id
  ) THEN
    INSERT INTO teleconsultas (
      clinica_id,
      agendamento_id,
      medico_id,
      paciente_id,
      sala_id,
      status,
      url_medico,
      url_paciente
    ) VALUES (
      NEW.clinica_id,
      NEW.id,
      NEW.medico_id,
      NEW.paciente_id,
      'temp_' || NEW.id::text,
      'agendada',
      NULL,
      NULL
    );
    
    -- Log da criação
    INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
    VALUES (
      'TELECONSULTA_CRIADA_AUTO',
      'teleconsultas',
      jsonb_build_object(
        'agendamento_id', NEW.id,
        'clinica_id', NEW.clinica_id,
        'created_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger na tabela agendamentos
DROP TRIGGER IF EXISTS trigger_criar_teleconsulta_automatica ON agendamentos;

CREATE TRIGGER trigger_criar_teleconsulta_automatica
  AFTER INSERT OR UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION criar_teleconsulta_automatica();

-- FASE 3: Função para processar salas Daily.co pendentes
CREATE OR REPLACE FUNCTION public.processar_daily_room_automatico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  agendamento_data RECORD;
BEGIN
  -- Só processar se status mudou para 'agendada' e URLs estão NULL
  IF NEW.status = 'agendada' AND OLD.status IS DISTINCT FROM 'agendada' 
     AND (NEW.url_medico IS NULL OR NEW.url_paciente IS NULL) THEN
    
    -- Buscar dados do agendamento
    SELECT a.data_agendamento, p.nome as paciente_nome, m.nome_completo as medico_nome
    INTO agendamento_data
    FROM agendamentos a
    LEFT JOIN pacientes p ON a.paciente_id = p.id
    LEFT JOIN medicos m ON a.medico_id = m.id
    WHERE a.id = NEW.agendamento_id;
    
    -- Log para processamento futuro
    INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
    VALUES (
      'DAILY_ROOM_PENDENTE',
      'teleconsultas',
      jsonb_build_object(
        'teleconsulta_id', NEW.id,
        'agendamento_id', NEW.agendamento_id,
        'clinica_id', NEW.clinica_id,
        'data_consulta', agendamento_data.data_agendamento,
        'paciente_nome', agendamento_data.paciente_nome,
        'medico_nome', agendamento_data.medico_nome,
        'status', 'pendente_criacao_sala'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para processar Daily.co
DROP TRIGGER IF EXISTS trigger_processar_daily_automatico ON teleconsultas;

CREATE TRIGGER trigger_processar_daily_automatico
  AFTER INSERT OR UPDATE ON teleconsultas
  FOR EACH ROW
  EXECUTE FUNCTION processar_daily_room_automatico();