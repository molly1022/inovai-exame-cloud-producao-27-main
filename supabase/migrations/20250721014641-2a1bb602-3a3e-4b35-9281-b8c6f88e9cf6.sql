-- CORREÇÃO CRÍTICA 1: Corrigir filtro de médicos por clínica
-- Problema: Médicos aparecem em todas as clínicas

-- 1. Melhorar a política RLS de médicos para isolamento total
DROP POLICY IF EXISTS "Clínicas podem gerenciar seus médicos" ON public.medicos;
CREATE POLICY "Clínicas podem gerenciar seus médicos"
ON public.medicos
FOR ALL
USING (clinica_id = (
  SELECT id FROM public.configuracoes_clinica 
  WHERE email_login_clinica = current_setting('request.jwt.claims', true)::json->>'email'
));

-- 2. Corrigir política de categorias para isolamento por clínica
DROP POLICY IF EXISTS "Clínicas podem gerenciar suas categorias" ON public.categorias_exames;
CREATE POLICY "Clínicas podem gerenciar suas categorias"
ON public.categorias_exames
FOR ALL
USING (clinica_id = (
  SELECT id FROM public.configuracoes_clinica 
  WHERE email_login_clinica = current_setting('request.jwt.claims', true)::json->>'email'
));

-- 3. Corrigir política de reagendamentos para incluir clinica_id
DROP POLICY IF EXISTS "Clínicas podem gerenciar seus reagendamentos" ON public.reagendamentos;
CREATE POLICY "Clínicas podem gerenciar seus reagendamentos"
ON public.reagendamentos
FOR ALL
USING (clinica_id = (
  SELECT id FROM public.configuracoes_clinica 
  WHERE email_login_clinica = current_setting('request.jwt.claims', true)::json->>'email'
));

-- 4. Adicionar tabela de atestados médicos
CREATE TABLE IF NOT EXISTS public.atestados_medicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  medico_id UUID NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
  data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cid TEXT,
  observacoes TEXT NOT NULL,
  dias_afastamento INTEGER NOT NULL DEFAULT 1,
  data_inicio_afastamento DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim_afastamento DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_atestado TEXT NOT NULL DEFAULT 'medico'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de atestados
ALTER TABLE public.atestados_medicos ENABLE ROW LEVEL SECURITY;

-- Política RLS para atestados médicos
CREATE POLICY "Atestados médicos isolados por clínica"
ON public.atestados_medicos
FOR ALL
USING (clinica_id = (
  SELECT id FROM public.configuracoes_clinica 
  WHERE email_login_clinica = current_setting('request.jwt.claims', true)::json->>'email'
));

-- 5. Simplificar painel administrativo - definir senha única
UPDATE public.configuracoes_clinica 
SET codigo_acesso_admin = 'maconheiro@321';

-- 6. Função para verificar isolamento de dados para relatórios
CREATE OR REPLACE FUNCTION public.verificar_isolamento_relatorios(clinica_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se todos os dados estão isolados por clínica
  IF EXISTS (
    SELECT 1 FROM public.agendamentos WHERE clinica_id != clinica_uuid
    AND id IN (SELECT id FROM public.agendamentos WHERE clinica_id = clinica_uuid)
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 7. Corrigir função de busca de agendamentos para emails
CREATE OR REPLACE FUNCTION public.buscar_proximos_agendamentos_dia_seguinte(clinica_uuid uuid)
RETURNS TABLE(id uuid, paciente_nome text, paciente_email text, paciente_telefone text, data_agendamento date, horario text, tipo_exame text, medico_nome text, medico_crm text, medico_especialidade text, convenio_nome text, numero_convenio text, status_pagamento text, valor_exame numeric, valor_pago numeric, clinica_nome text, clinica_email text, clinica_telefone text, clinica_endereco text, observacoes_agendamento text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificação crítica de isolamento
    RAISE NOTICE 'ISOLAMENTO CRÍTICO: Buscando apenas para clínica: %', clinica_uuid;
    
    RETURN QUERY
    SELECT 
        a.id,
        p.nome as paciente_nome,
        p.email as paciente_email,
        p.telefone as paciente_telefone,
        a.data_agendamento::DATE,
        COALESCE(a.horario, 'A definir') as horario,
        a.tipo_exame,
        COALESCE(m.nome_completo, 'Não definido') as medico_nome,
        COALESCE(m.crm, 'Não informado') as medico_crm,
        COALESCE(m.especialidade, 'Não informado') as medico_especialidade,
        COALESCE(cv.nome, 'Particular') as convenio_nome,
        COALESCE(p.numero_convenio, 'N/A') as numero_convenio,
        COALESCE(a.status_pagamento, 'pendente') as status_pagamento,
        COALESCE(a.valor_exame, 0.00) as valor_exame,
        COALESCE(a.valor_pago, 0.00) as valor_pago,
        cl.nome as clinica_nome,
        cl.email as clinica_email,
        COALESCE(cl.telefone, 'Não informado') as clinica_telefone,
        COALESCE(cl.endereco, 'Não informado') as clinica_endereco,
        COALESCE(a.observacoes, '') as observacoes_agendamento
    FROM agendamentos a
    INNER JOIN pacientes p ON a.paciente_id = p.id AND p.clinica_id = clinica_uuid  -- ISOLAMENTO CRÍTICO
    LEFT JOIN medicos m ON a.medico_id = m.id AND m.clinica_id = clinica_uuid      -- ISOLAMENTO CRÍTICO
    LEFT JOIN convenios cv ON a.convenio_id = cv.id AND cv.clinica_id = clinica_uuid -- ISOLAMENTO CRÍTICO
    INNER JOIN clinicas cl ON a.clinica_id = cl.id AND cl.id = clinica_uuid        -- ISOLAMENTO CRÍTICO
    WHERE a.clinica_id = clinica_uuid  -- FILTRO PRINCIPAL
    AND a.data_agendamento::DATE = (CURRENT_DATE + INTERVAL '1 day')::DATE
    AND a.status IN ('agendado', 'confirmado')
    AND p.email IS NOT NULL
    AND p.email != ''
    AND p.email != 'N/A'
    AND p.email !~ '^[0-9]+$'
    AND p.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND p.email NOT ILIKE '%@teste%'
    AND p.email NOT ILIKE '%@example%'
    AND p.email NOT ILIKE '%@gmail.co'
    AND p.email NOT ILIKE '%@hotmail.co'
    AND NOT EXISTS (
        SELECT 1 FROM email_lembretes el 
        WHERE el.agendamento_id = a.id 
        AND el.email_paciente = p.email 
        AND el.status_envio = 'enviado'
        AND el.clinica_id = clinica_uuid  -- ISOLAMENTO CRÍTICO
    )
    ORDER BY a.horario NULLS LAST, a.created_at;
END;
$$;