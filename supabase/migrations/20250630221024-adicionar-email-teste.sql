
-- Adicionar coluna email_teste na tabela configuracoes_email
ALTER TABLE public.configuracoes_email 
ADD COLUMN IF NOT EXISTS email_teste TEXT;

-- Atualizar configurações existentes para ter o email de teste padrão
UPDATE public.configuracoes_email 
SET email_teste = 'jacksvp20132014@gmail.com'
WHERE email_teste IS NULL;

-- Comentário para documentação
COMMENT ON COLUMN configuracoes_email.email_teste IS 'Email para onde serão enviados os testes de funcionamento do sistema';

-- Verificar se as extensões necessárias estão habilitadas
SELECT 'pg_cron extension status: ' || CASE 
  WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') 
  THEN 'ENABLED' 
  ELSE 'DISABLED - Execute: CREATE EXTENSION IF NOT EXISTS pg_cron;' 
END as pg_cron_status;

SELECT 'pg_net extension status: ' || CASE 
  WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') 
  THEN 'ENABLED' 
  ELSE 'DISABLED - Execute: CREATE EXTENSION IF NOT EXISTS pg_net;' 
END as pg_net_status;
