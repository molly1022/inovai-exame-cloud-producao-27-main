-- Fase 1: Padronizar senhas de pacientes e médicos para usar CPF
-- Atualizar senhas de pacientes para usar CPF sem formatação
UPDATE pacientes 
SET senha_acesso = REGEXP_REPLACE(cpf, '[^0-9]', '', 'g')
WHERE senha_acesso != REGEXP_REPLACE(cpf, '[^0-9]', '', 'g');

-- Atualizar senhas de médicos para usar CPF sem formatação  
UPDATE medicos_login 
SET senha = REGEXP_REPLACE(cpf, '[^0-9]', '', 'g')
WHERE senha != REGEXP_REPLACE(cpf, '[^0-9]', '', 'g');

-- Atualizar função de criar login automático para médicos para usar CPF como senha
CREATE OR REPLACE FUNCTION public.criar_login_medico_automatico_cpf()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Verificar se não existe login para este médico
    IF NOT EXISTS (SELECT 1 FROM public.medicos_login WHERE medico_id = NEW.id) THEN
        -- Inserir login automático usando CPF como senha
        INSERT INTO public.medicos_login (
            medico_id,
            clinica_id,
            cpf,
            senha
        ) VALUES (
            NEW.id,
            NEW.clinica_id,
            NEW.cpf,
            REGEXP_REPLACE(NEW.cpf, '[^0-9]', '', 'g') -- CPF sem formatação como senha
        );
        
        -- Log da criação
        INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
        VALUES (
            'LOGIN_MEDICO_CRIADO_CPF',
            'medicos_login',
            jsonb_build_object(
                'medico_id', NEW.id,
                'medico_nome', NEW.nome_completo,
                'clinica_id', NEW.clinica_id,
                'senha_padronizada', 'CPF'
            )
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Dropar trigger antigo se existir
DROP TRIGGER IF EXISTS criar_login_medico_automatico ON medicos;

-- Criar novo trigger
CREATE TRIGGER criar_login_medico_automatico_cpf
    AFTER INSERT ON medicos
    FOR EACH ROW
    EXECUTE FUNCTION criar_login_medico_automatico_cpf();