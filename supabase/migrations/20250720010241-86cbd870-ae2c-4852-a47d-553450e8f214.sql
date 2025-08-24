
-- Atualizar configuração padrão para ativar verificação automática
UPDATE public.configuracoes_sistema 
SET verificacao_automatica_ativa = true, 
    updated_at = now() 
WHERE id IN (SELECT id FROM public.configuracoes_sistema LIMIT 1);

-- Função melhorada para processar verificação automática com tratamento de duplicatas
CREATE OR REPLACE FUNCTION public.processar_verificacao_automatica()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    config_record RECORD;
    inscricao_record RECORD;
    processadas INTEGER := 0;
    errors_count INTEGER := 0;
    resultado JSON;
    error_msg TEXT;
BEGIN
    -- Verificar se a verificação automática está ativa
    SELECT * INTO config_record 
    FROM public.configuracoes_sistema 
    LIMIT 1;
    
    IF NOT FOUND OR NOT config_record.verificacao_automatica_ativa THEN
        RETURN json_build_object(
            'success', false, 
            'message', 'Verificação automática não está ativa'
        );
    END IF;
    
    -- Processar todas as inscrições pendentes
    FOR inscricao_record IN 
        SELECT id, email_responsavel, nome_clinica 
        FROM public.inscricoes_pendentes 
        WHERE status = 'pendente'
        ORDER BY created_at ASC
    LOOP
        BEGIN
            -- Verificar se já existe clínica com este email
            IF EXISTS (SELECT 1 FROM public.clinicas WHERE email = inscricao_record.email_responsavel) THEN
                -- Marcar como rejeitada por email duplicado
                UPDATE public.inscricoes_pendentes 
                SET status = 'rejeitada', 
                    processada_em = now(),
                    updated_at = now(),
                    dados_completos = COALESCE(dados_completos, '{}'::jsonb) || 
                                    json_build_object('erro', 'Email já cadastrado no sistema')::jsonb
                WHERE id = inscricao_record.id;
                
                errors_count := errors_count + 1;
                CONTINUE;
            END IF;
            
            -- Processar inscrição normalmente
            PERFORM public.processar_inscricao_clinica(inscricao_record.id, true);
            processadas := processadas + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Capturar erros específicos e marcar como rejeitada
            error_msg := SQLERRM;
            
            UPDATE public.inscricoes_pendentes 
            SET status = 'rejeitada', 
                processada_em = now(),
                updated_at = now(),
                dados_completos = COALESCE(dados_completos, '{}'::jsonb) || 
                                json_build_object('erro', error_msg)::jsonb
            WHERE id = inscricao_record.id;
            
            errors_count := errors_count + 1;
        END;
    END LOOP;
    
    resultado := json_build_object(
        'success', true,
        'processadas', processadas,
        'rejeitadas_por_erro', errors_count,
        'timestamp', now(),
        'message', format('Processamento concluído: %s aprovadas, %s rejeitadas', processadas, errors_count)
    );
    
    RETURN resultado;
END;
$$;

-- Criar função para configurar cron job automático
SELECT cron.schedule(
    'processar-inscricoes-automatico',
    '*/5 * * * *', -- A cada 5 minutos
    $$
    SELECT net.http_post(
        url := 'https://sxtqlnayloetwlcjtkbj.supabase.co/functions/v1/processar-verificacao-automatica',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dHFsbmF5bG9ldHdsY2p0a2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NDk5OSwiZXhwIjoyMDY0OTMwOTk5fQ.C7a8D8C3y5ePHKDKpjU4vXM0VJEhNdU9zL1cYJiMeKU"}'::jsonb,
        body := '{}'::jsonb
    );
    $$
);
