-- Verificar se o trigger existe
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'criar_login_medico_automatico';

-- Recriar a função e trigger para criar login automático
CREATE OR REPLACE FUNCTION public.criar_login_medico_automatico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    senha_padrao TEXT;
BEGIN
    -- Verificar se não existe login para este médico
    IF NOT EXISTS (SELECT 1 FROM public.medicos_login WHERE medico_id = NEW.id) THEN
        -- Gerar senha padrão: nome completo sem espaços + últimos 4 dígitos do CPF
        senha_padrao := LOWER(REPLACE(NEW.nome_completo, ' ', '')) || RIGHT(NEW.cpf, 4);
        
        -- Inserir login automático
        INSERT INTO public.medicos_login (
            medico_id,
            clinica_id,
            cpf,
            senha
        ) VALUES (
            NEW.id,
            NEW.clinica_id,
            NEW.cpf,
            senha_padrao
        );
        
        -- Log da criação
        INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
        VALUES (
            'LOGIN_MEDICO_CRIADO_AUTO',
            'medicos_login',
            jsonb_build_object(
                'medico_id', NEW.id,
                'medico_nome', NEW.nome_completo,
                'clinica_id', NEW.clinica_id,
                'senha_gerada', senha_padrao
            )
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS criar_login_medico_automatico ON public.medicos;

-- Criar trigger para executar após inserção de novo médico
CREATE TRIGGER criar_login_medico_automatico
    AFTER INSERT ON public.medicos
    FOR EACH ROW
    EXECUTE FUNCTION public.criar_login_medico_automatico();