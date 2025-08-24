-- Habilitar extensões necessárias para o sistema de emails automático
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remover qualquer CRON job existente para lembretes
SELECT cron.unschedule('enviar-lembretes-email-automatico');

-- Configurar CRON job para executar todos os dias às 09:00 (horário do servidor)
SELECT cron.schedule(
  'enviar-lembretes-email-automatico',
  '0 9 * * *', -- Todos os dias às 09:00
  $$
  SELECT
    net.http_post(
        url:='https://sxtqlnayloetwlcjtkbj.supabase.co/functions/v1/enviar-lembretes-email',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dHFsbmF5bG9ldHdsY2p0a2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTQ5OTksImV4cCI6MjA2NDkzMDk5OX0.gY2uqpV_D0e-cZXAh0yDn05CvcuRxrB84i7_oiqktFM"}'::jsonb,
        body:=jsonb_build_object(
          'trigger', 'cron_automatico',
          'timestamp', extract(epoch from now()),
          'teste', false
        )
    ) as request_id;
  $$
);

-- Criar função para monitorar execuções do CRON
CREATE OR REPLACE FUNCTION public.log_cron_execution()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO logs_acesso (acao, tabela_afetada, detalhes)
  VALUES (
    'cron_execution',
    'email_lembretes',
    jsonb_build_object(
      'executado_em', NOW(),
      'tipo', 'envio_automatico_lembretes'
    )
  );
END;
$$;

-- Comentário sobre o funcionamento
COMMENT ON FUNCTION public.log_cron_execution IS 'Registra execuções automáticas do sistema de lembretes por email';