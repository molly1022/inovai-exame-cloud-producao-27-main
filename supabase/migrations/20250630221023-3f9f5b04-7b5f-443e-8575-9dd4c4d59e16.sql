
-- Habilitar extensões necessárias para cron jobs e HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar tabela para logs de emails enviados
CREATE TABLE IF NOT EXISTS public.email_lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES agendamentos(id),
  email_paciente TEXT NOT NULL,
  status_envio TEXT DEFAULT 'pendente' CHECK (status_envio IN ('pendente', 'enviado', 'erro', 'cancelado')),
  data_envio TIMESTAMP WITH TIME ZONE,
  erro_envio TEXT,
  tentativas INTEGER DEFAULT 0,
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de configurações de email por clínica
CREATE TABLE IF NOT EXISTS public.configuracoes_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) UNIQUE,
  ativo BOOLEAN DEFAULT true,
  horas_antecedencia INTEGER DEFAULT 24,
  horario_envio TIME DEFAULT '18:00:00',
  template_personalizado TEXT,
  remetente_nome TEXT DEFAULT 'Clínica',
  remetente_email TEXT DEFAULT 'noreply@clinica.com',
  assunto_email TEXT DEFAULT 'Lembrete: Consulta agendada para amanhã',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir configuração padrão para clínicas existentes
INSERT INTO configuracoes_email (clinica_id, ativo)
SELECT id, true FROM clinicas
ON CONFLICT (clinica_id) DO NOTHING;

-- Habilitar RLS nas novas tabelas
ALTER TABLE email_lembretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_email ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para email_lembretes (acesso por clínica)
CREATE POLICY "Clínicas podem ver seus próprios logs de email"
  ON email_lembretes FOR ALL
  USING (clinica_id IN (
    SELECT id FROM clinicas WHERE id = clinica_id
  ));

-- Políticas RLS para configuracoes_email (acesso por clínica)
CREATE POLICY "Clínicas podem gerenciar suas configurações de email"
  ON configuracoes_email FOR ALL
  USING (clinica_id IN (
    SELECT id FROM clinicas WHERE id = clinica_id
  ));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_email_lembretes_agendamento ON email_lembretes(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_email_lembretes_clinica ON email_lembretes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_email_lembretes_status ON email_lembretes(status_envio);
CREATE INDEX IF NOT EXISTS idx_email_lembretes_data ON email_lembretes(data_envio);
CREATE INDEX IF NOT EXISTS idx_configuracoes_email_clinica ON configuracoes_email(clinica_id);

-- Comentários para documentação
COMMENT ON TABLE email_lembretes IS 'Log de emails de lembrete enviados aos pacientes';
COMMENT ON TABLE configuracoes_email IS 'Configurações de envio de email por clínica';
COMMENT ON COLUMN email_lembretes.status_envio IS 'Status do envio: pendente, enviado, erro, cancelado';
COMMENT ON COLUMN configuracoes_email.horas_antecedencia IS 'Quantas horas antes da consulta enviar o lembrete';
COMMENT ON COLUMN configuracoes_email.horario_envio IS 'Horário diário para processar e enviar lembretes';
