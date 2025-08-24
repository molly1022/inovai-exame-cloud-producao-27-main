
-- Verificar se a coluna email_teste já existe e adicioná-la se necessário
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'configuracoes_email' 
        AND column_name = 'email_teste'
    ) THEN
        ALTER TABLE public.configuracoes_email 
        ADD COLUMN email_teste TEXT;
    END IF;
END $$;

-- Atualizar configurações existentes para ter o email de teste padrão
UPDATE public.configuracoes_email 
SET email_teste = 'jacksvp20132014@gmail.com'
WHERE email_teste IS NULL;

-- Comentário para documentação
COMMENT ON COLUMN configuracoes_email.email_teste IS 'Email para onde serão enviados os testes de funcionamento do sistema';

-- Criar função para limpeza automática de emails com erro antigos
CREATE OR REPLACE FUNCTION limpar_emails_antigos()
RETURNS INTEGER AS $$
DECLARE
    emails_limpos INTEGER;
BEGIN
    -- Marcar como cancelado emails com erro há mais de 24 horas
    UPDATE email_lembretes 
    SET status_envio = 'cancelado'
    WHERE status_envio = 'erro' 
    AND created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS emails_limpos = ROW_COUNT;
    
    RETURN emails_limpos;
END;
$$ LANGUAGE plpgsql;

-- Criar função para validar emails
CREATE OR REPLACE FUNCTION validar_email(email_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o email tem formato básico válido
    IF email_input IS NULL OR email_input = '' THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se tem @ e pelo menos um ponto depois do @
    IF email_input !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se não é um email obviamente inválido
    IF email_input ILIKE '%@teste%' OR 
       email_input ILIKE '%@example%' OR 
       email_input ILIKE '%@gmail.co' OR
       email_input ILIKE '%@hotmail.co' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
