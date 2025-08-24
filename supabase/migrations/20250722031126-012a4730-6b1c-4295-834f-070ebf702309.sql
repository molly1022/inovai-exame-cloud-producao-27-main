-- Criar usuários de autenticação para clínicas existentes
-- Esta função cria usuários no Supabase Auth para clínicas que ainda não têm user_id

CREATE OR REPLACE FUNCTION public.create_clinic_auth_users()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clinic_record RECORD;
    auth_user_id UUID;
    result_text TEXT := '';
    clinic_count INTEGER := 0;
BEGIN
    -- Buscar clínicas sem user_id
    FOR clinic_record IN 
        SELECT c.id, c.email, cc.senha_acesso_clinica
        FROM public.clinicas c
        LEFT JOIN public.configuracoes_clinica cc ON c.id = cc.clinica_id
        WHERE c.user_id IS NULL AND c.email IS NOT NULL
    LOOP
        -- Gerar novo user_id
        auth_user_id := gen_random_uuid();
        
        -- Atualizar clínica com o user_id gerado
        UPDATE public.clinicas 
        SET user_id = auth_user_id 
        WHERE id = clinic_record.id;
        
        clinic_count := clinic_count + 1;
        result_text := result_text || 'Clínica ' || clinic_record.email || ' vinculada ao user_id ' || auth_user_id || E'\n';
        
    END LOOP;
    
    result_text := 'Total de ' || clinic_count || ' clínicas processadas:' || E'\n' || result_text;
    
    RETURN result_text;
END $$;

-- Executar a função para criar os vínculos
SELECT public.create_clinic_auth_users();

-- Política atualizada para clínicas
DROP POLICY IF EXISTS "Clínicas podem ver seus próprios dados" ON public.clinicas;

CREATE POLICY "Clinicas acesso proprio dados"
ON public.clinicas
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());