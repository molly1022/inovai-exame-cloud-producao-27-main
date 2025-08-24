
-- Adicionar novo status 'paciente_chegou' e campos de controle temporal
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auto_confirmado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_iniciado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tempo_consulta_minutos INTEGER;

-- Atualizar comentário para incluir o novo status
COMMENT ON COLUMN agendamentos.status IS 'Status da consulta: agendado, confirmado, paciente_chegou, em_andamento, concluido, cancelado, faltou';
COMMENT ON COLUMN agendamentos.check_in_time IS 'Data e hora do check-in do paciente';
COMMENT ON COLUMN agendamentos.auto_confirmado IS 'Indica se foi confirmado automaticamente';
COMMENT ON COLUMN agendamentos.auto_iniciado IS 'Indica se foi iniciado automaticamente';
COMMENT ON COLUMN agendamentos.tempo_consulta_minutos IS 'Duração da consulta em minutos';

-- Criar função de validação de transições de status
CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar transições válidas de status
  IF OLD.status IS NOT NULL AND NEW.status != OLD.status THEN
    -- Transições permitidas
    CASE OLD.status
      WHEN 'agendado' THEN
        IF NEW.status NOT IN ('confirmado', 'cancelado', 'faltou') THEN
          RAISE EXCEPTION 'Transição inválida de agendado para %', NEW.status;
        END IF;
      WHEN 'confirmado' THEN
        IF NEW.status NOT IN ('paciente_chegou', 'em_andamento', 'cancelado', 'faltou') THEN
          RAISE EXCEPTION 'Transição inválida de confirmado para %', NEW.status;
        END IF;
      WHEN 'paciente_chegou' THEN
        IF NEW.status NOT IN ('em_andamento', 'cancelado', 'faltou') THEN
          RAISE EXCEPTION 'Transição inválida de paciente_chegou para %', NEW.status;
        END IF;
      WHEN 'em_andamento' THEN
        IF NEW.status NOT IN ('concluido', 'cancelado') THEN
          RAISE EXCEPTION 'Transição inválida de em_andamento para %', NEW.status;
        END IF;
      WHEN 'concluido', 'cancelado', 'faltou' THEN
        -- Estados finais - não podem ser alterados
        RAISE EXCEPTION 'Não é possível alterar status de consulta já finalizada';
    END CASE;
  END IF;

  -- Definir check_in_time quando status muda para paciente_chegou
  IF NEW.status = 'paciente_chegou' AND OLD.status != 'paciente_chegou' THEN
    NEW.check_in_time = NOW();
  END IF;

  -- Calcular tempo de consulta quando finalizada
  IF NEW.status = 'concluido' AND OLD.status = 'em_andamento' THEN
    NEW.tempo_consulta_minutos = EXTRACT(EPOCH FROM (NEW.data_conclusao - NEW.data_agendamento))/60;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validação de status
DROP TRIGGER IF EXISTS validate_agendamento_status ON agendamentos;
CREATE TRIGGER validate_agendamento_status
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION validate_status_transition();

-- Criar tabela para histórico de mudanças de status
CREATE TABLE IF NOT EXISTS agendamentos_historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  motivo TEXT,
  usuario_id UUID,
  automatico BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  detalhes JSONB
);

-- Criar função para registrar mudanças de status
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registrar se o status mudou
  IF OLD.status IS NULL OR NEW.status != OLD.status THEN
    INSERT INTO agendamentos_historico (
      agendamento_id,
      status_anterior,
      status_novo,
      automatico,
      detalhes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(NEW.auto_confirmado OR NEW.auto_iniciado, FALSE),
      jsonb_build_object(
        'data_agendamento', NEW.data_agendamento,
        'check_in_time', NEW.check_in_time,
        'data_conclusao', NEW.data_conclusao
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para histórico
DROP TRIGGER IF EXISTS log_agendamento_status_change ON agendamentos;
CREATE TRIGGER log_agendamento_status_change
  AFTER UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();

-- Criar tabela de configurações da clínica para automações
CREATE TABLE IF NOT EXISTS configuracoes_automacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  auto_confirmacao_minutos INTEGER DEFAULT 30,
  tolerancia_atraso_minutos INTEGER DEFAULT 15,
  tempo_minimo_consulta_minutos INTEGER DEFAULT 10,
  horario_inicio TIME DEFAULT '08:00',
  horario_fim TIME DEFAULT '18:00',
  dias_funcionamento INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Segunda a Sexta
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração padrão para a clínica
INSERT INTO configuracoes_automacao (clinica_id) 
VALUES ('00000000-0000-0000-0000-000000000001') 
ON CONFLICT DO NOTHING;
