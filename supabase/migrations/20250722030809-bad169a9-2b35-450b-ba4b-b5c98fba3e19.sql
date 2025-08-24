-- CORREÇÃO CRÍTICA 1: Habilitar RLS nas tabelas sem proteção
ALTER TABLE public.agendamentos_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atestados_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_exames ENABLE ROW LEVEL SECURITY;

-- CORREÇÃO CRÍTICA 2: Política de médicos está incorreta - usar user_id ao invés de email
DROP POLICY IF EXISTS "Clínicas podem gerenciar seus médicos" ON public.medicos;

-- Criar política correta para médicos usando user_id da clínica
CREATE POLICY "Médicos isolados por clínica"
ON public.medicos
FOR ALL
USING (
  clinica_id IN (
    SELECT id FROM public.clinicas WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  clinica_id IN (
    SELECT id FROM public.clinicas WHERE user_id = auth.uid()
  )
);

-- CORREÇÃO CRÍTICA 3: Políticas para as tabelas que estavam sem RLS
CREATE POLICY "Histórico de agendamentos isolado por clínica"
ON public.agendamentos_historico
FOR ALL
USING (
  agendamento_id IN (
    SELECT id FROM public.agendamentos 
    WHERE clinica_id IN (
      SELECT id FROM public.clinicas WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Atestados médicos isolados por clínica"
ON public.atestados_medicos
FOR ALL
USING (
  clinica_id IN (
    SELECT id FROM public.clinicas WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  clinica_id IN (
    SELECT id FROM public.clinicas WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Categorias isoladas por clínica"
ON public.categorias_exames
FOR ALL
USING (
  clinica_id IN (
    SELECT id FROM public.clinicas WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  clinica_id IN (
    SELECT id FROM public.clinicas WHERE user_id = auth.uid()
  )
);

-- CORREÇÃO CRÍTICA 4: Corrigir autenticação da clínica
-- A tabela clinicas precisa de user_id para vincular com auth.users
-- Adicionar coluna user_id se não existir e criar usuários de autenticação

-- Primeiro verificar se existe user_id nas clinicas
DO $$
BEGIN
  -- Verificar se a coluna user_id existe na tabela clinicas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clinicas' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.clinicas ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- CORREÇÃO CRÍTICA 5: Função para sincronizar login das clínicas
CREATE OR REPLACE FUNCTION public.sync_clinic_auth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clinic_record RECORD;
    auth_user_id UUID;
BEGIN
    -- Para cada clínica sem user_id, criar usuário no auth
    FOR clinic_record IN 
        SELECT c.id, c.email, cc.senha_acesso_clinica
        FROM public.clinicas c
        LEFT JOIN public.configuracoes_clinica cc ON c.id = cc.clinica_id
        WHERE c.user_id IS NULL AND c.email IS NOT NULL
    LOOP
        -- Inserir usuário na tabela auth.users (simulando signup)
        -- Nota: Em produção isso deveria ser feito via API do Supabase
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            role
        ) VALUES (
            gen_random_uuid(),
            clinic_record.email,
            crypt(clinic_record.senha_acesso_clinica, gen_salt('bf')),
            now(),
            now(),
            now(),
            '',
            'authenticated'
        ) RETURNING id INTO auth_user_id;
        
        -- Atualizar clínica com o user_id
        UPDATE public.clinicas 
        SET user_id = auth_user_id 
        WHERE id = clinic_record.id;
        
    END LOOP;
END $$;

-- Executar a sincronização
SELECT public.sync_clinic_auth();

-- CORREÇÃO CRÍTICA 6: Política correta para tabela clinicas
DROP POLICY IF EXISTS "Clínicas podem ver seus próprios dados" ON public.clinicas;

CREATE POLICY "Clínicas podem ver seus próprios dados"
ON public.clinicas
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());