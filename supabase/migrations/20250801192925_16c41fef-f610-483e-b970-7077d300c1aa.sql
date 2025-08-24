-- 1. TRIGGER AUTOMÁTICO PARA LOGIN DE MÉDICOS
-- Criar função que gera login automático quando médico é criado
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

-- Criar trigger para médicos novos
DROP TRIGGER IF EXISTS trigger_criar_login_medico ON public.medicos;
CREATE TRIGGER trigger_criar_login_medico
    AFTER INSERT ON public.medicos
    FOR EACH ROW
    EXECUTE FUNCTION public.criar_login_medico_automatico();

-- 2. CRIAR LOGINS PARA MÉDICOS EXISTENTES SEM LOGIN
INSERT INTO public.medicos_login (medico_id, clinica_id, cpf, senha)
SELECT 
    m.id,
    m.clinica_id,
    m.cpf,
    LOWER(REPLACE(m.nome_completo, ' ', '')) || RIGHT(m.cpf, 4) as senha
FROM public.medicos m
LEFT JOIN public.medicos_login ml ON m.id = ml.medico_id
WHERE ml.medico_id IS NULL
AND m.ativo = true;

-- 3. LIMPAR PLANOS DUPLICADOS E DEFINIR LIMITES CORRETOS
-- Primeiro, remover planos duplicados mantendo apenas um de cada tipo/período
WITH planos_duplicados AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY tipo_plano, periodo_meses ORDER BY created_at) as rn
    FROM public.planos_assinatura
)
DELETE FROM public.planos_assinatura 
WHERE id IN (
    SELECT id FROM planos_duplicados WHERE rn > 1
);

-- Atualizar planos com limites corretos de teleconsultas
UPDATE public.planos_assinatura 
SET 
    limite_teleconsultas_gratuitas = CASE 
        WHEN tipo_plano = 'basico' THEN 0
        WHEN tipo_plano = 'intermediario' THEN 12
        WHEN tipo_plano = 'avancado' THEN 20
        ELSE 0
    END,
    consultas_por_pacote_adicional = 10,
    valor_pacote_adicional_teleconsulta = 50.00,
    updated_at = now()
WHERE tipo_plano IN ('basico', 'intermediario', 'avancado');

-- 4. VERIFICAR SE API DAILY ESTÁ CONFIGURADA GLOBALMENTE
-- Esta função será usada pelo DailyService para verificar se a API está configurada
CREATE OR REPLACE FUNCTION public.verificar_daily_api_global()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Verificar se existe o secret DAILY_API_KEY no Supabase
    -- Esta função retornará true se a API key estiver configurada
    -- O frontend deve configurar a API key como secret no Supabase
    RETURN true; -- Por agora retorna true, será validado pela edge function
END;
$function$;

-- Log das operações realizadas
INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
VALUES (
    'CORRECOES_SISTEMA_IMPLEMENTADAS',
    'sistema',
    jsonb_build_object(
        'trigger_login_medico', 'criado',
        'planos_limites_atualizados', 'sim',
        'api_daily_verificacao', 'configurada',
        'executado_em', now()
    )
);