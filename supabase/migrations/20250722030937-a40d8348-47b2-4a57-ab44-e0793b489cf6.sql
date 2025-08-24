-- CORREÇÃO CRÍTICA: Remover botão Google e corrigir login da clínica

-- 1. Habilitar RLS nas tabelas sem proteção (se ainda não estiver)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'agendamentos_historico' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.agendamentos_historico ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'categorias_exames' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.categorias_exames ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Corrigir política de médicos - remover a política problemática
DROP POLICY IF EXISTS "Clínicas podem gerenciar seus médicos" ON public.medicos;
DROP POLICY IF EXISTS "Médicos isolados por clínica" ON public.medicos;

-- 3. Criar política correta para médicos usando clinica_id diretamente
CREATE POLICY "Médicos isolados por clinica_id"
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

-- 4. Políticas para histórico de agendamentos
DROP POLICY IF EXISTS "Histórico de agendamentos isolado por clínica" ON public.agendamentos_historico;

CREATE POLICY "Historico agendamentos por clinica"
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

-- 5. Políticas para categorias
DROP POLICY IF EXISTS "Categorias isoladas por clínica" ON public.categorias_exames;

CREATE POLICY "Categorias por clinica"
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

-- 6. Verificar se user_id existe na tabela clinicas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clinicas' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.clinicas ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;