-- FASE 6: Correções de Segurança - Adicionar SET search_path a funções SECURITY DEFINER

-- 1. Corrigir função calcular_proximo_pagamento
CREATE OR REPLACE FUNCTION public.calcular_proximo_pagamento(data_inicio date, periodo_meses integer)
 RETURNS date
 LANGUAGE sql
 IMMUTABLE
 SET search_path = 'public'
AS $function$
  SELECT data_inicio + INTERVAL '1 month' * periodo_meses;
$function$;

-- 2. Corrigir função set_clinic_context
CREATE OR REPLACE FUNCTION public.set_clinic_context(clinic_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Definir contexto da clínica para a sessão atual
  PERFORM set_config('app.current_clinic_id', clinic_uuid::text, false);
  
  -- Log da operação
  INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
  VALUES (
    'CLINIC_CONTEXT_SET',
    'system',
    jsonb_build_object(
      'clinic_id', clinic_uuid,
      'timestamp', now(),
      'session_user', session_user
    )
  );
END;
$function$;

-- 3. Corrigir função validate_patient_isolation
CREATE OR REPLACE FUNCTION public.validate_patient_isolation(clinic_uuid uuid, patient_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  patient_clinic_id uuid;
BEGIN
  -- Buscar clínica do paciente
  SELECT clinica_id INTO patient_clinic_id
  FROM public.pacientes
  WHERE id = patient_id;
  
  -- Verificar se paciente pertence à clínica
  IF patient_clinic_id = clinic_uuid THEN
    RETURN true;
  ELSE
    -- Log de tentativa de acesso não autorizada
    INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
    VALUES (
      'UNAUTHORIZED_PATIENT_ACCESS',
      'pacientes',
      jsonb_build_object(
        'patient_id', patient_id,
        'patient_clinic_id', patient_clinic_id,
        'attempted_by_clinic', clinic_uuid,
        'timestamp', now()
      )
    );
    RETURN false;
  END IF;
END;
$function$;

-- 4. Corrigir função audit_patient_isolation
CREATE OR REPLACE FUNCTION public.audit_patient_isolation()
 RETURNS TABLE(clinica_nome text, total_pacientes bigint, pacientes_com_problema bigint, detalhes_problemas text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  clinic_record RECORD;
  problemas text[];
  total_pacientes_clinic bigint;
  pacientes_problema bigint;
BEGIN
  FOR clinic_record IN 
    SELECT id, nome FROM public.clinicas
  LOOP
    -- Contar total de pacientes da clínica
    SELECT COUNT(*) INTO total_pacientes_clinic
    FROM public.pacientes 
    WHERE clinica_id = clinic_record.id;
    
    -- Verificar pacientes com UUID padrão problemático
    SELECT COUNT(*) INTO pacientes_problema
    FROM public.pacientes 
    WHERE clinica_id = '00000000-0000-0000-0000-000000000001'::uuid;
    
    -- Identificar problemas específicos
    problemas := ARRAY[]::text[];
    
    IF pacientes_problema > 0 THEN
      problemas := array_append(problemas, 
        format('%s pacientes com clinica_id padrão problemático', pacientes_problema));
    END IF;
    
    RETURN QUERY SELECT 
      clinic_record.nome,
      total_pacientes_clinic,
      pacientes_problema,
      problemas;
  END LOOP;
END;
$function$;

-- 5. Corrigir função verificar_isolamento_relatorios
CREATE OR REPLACE FUNCTION public.verificar_isolamento_relatorios(clinica_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- 6. Corrigir função buscar_proximos_agendamentos_dia_seguinte
CREATE OR REPLACE FUNCTION public.buscar_proximos_agendamentos_dia_seguinte(clinica_uuid uuid)
 RETURNS TABLE(id uuid, paciente_nome text, paciente_email text, paciente_telefone text, data_agendamento date, horario text, tipo_exame text, medico_nome text, medico_crm text, medico_especialidade text, convenio_nome text, numero_convenio text, status_pagamento text, valor_exame numeric, valor_pago numeric, clinica_nome text, clinica_email text, clinica_telefone text, clinica_endereco text, observacoes_agendamento text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
    INNER JOIN pacientes p ON a.paciente_id = p.id AND p.clinica_id = clinica_uuid
    LEFT JOIN medicos m ON a.medico_id = m.id AND m.clinica_id = clinica_uuid
    LEFT JOIN convenios cv ON a.convenio_id = cv.id AND cv.clinica_id = clinica_uuid
    INNER JOIN clinicas cl ON a.clinica_id = cl.id AND cl.id = clinica_uuid
    WHERE a.clinica_id = clinica_uuid
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
        AND el.clinica_id = clinica_uuid
    )
    ORDER BY a.horario NULLS LAST, a.created_at;
END;
$function$;

-- 7. Corrigir função verify_clinic_login
CREATE OR REPLACE FUNCTION public.verify_clinic_login(email_input text, password_input text)
 RETURNS TABLE(clinica_id uuid, clinica_nome text, success boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as clinica_id,
        c.nome as clinica_nome,
        (cc.senha_acesso_clinica = password_input) as success
    FROM public.clinicas c
    INNER JOIN public.configuracoes_clinica cc ON c.id = cc.clinica_id
    WHERE c.email = email_input
    AND cc.senha_acesso_clinica = password_input;
END $function$;

-- 8. Corrigir função set_medico_context
CREATE OR REPLACE FUNCTION public.set_medico_context(medico_cpf text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se o médico existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.medicos 
    WHERE cpf = medico_cpf AND ativo = true
  ) THEN
    RAISE EXCEPTION 'Médico com CPF % não encontrado ou inativo', medico_cpf;
  END IF;
  
  -- Definir contexto do médico para a sessão atual
  PERFORM set_config('app.medico_cpf', medico_cpf, false);
  
  -- Log da operação
  INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
  VALUES (
    'MEDICO_CONTEXT_SET',
    'system',
    jsonb_build_object(
      'medico_cpf', medico_cpf,
      'timestamp', now(),
      'session_user', session_user
    )
  );
END;
$function$;

-- 9. Corrigir função get_current_medico
CREATE OR REPLACE FUNCTION public.get_current_medico()
 RETURNS TABLE(id uuid, clinica_id uuid, cpf text, nome_completo text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  medico_cpf_atual text;
BEGIN
  -- Obter CPF do médico do contexto da sessão
  medico_cpf_atual := current_setting('app.medico_cpf', true);
  
  -- Debug log
  RAISE NOTICE 'Contexto médico atual: %', medico_cpf_atual;
  
  IF medico_cpf_atual IS NULL OR medico_cpf_atual = '' THEN
    RAISE NOTICE 'Nenhum contexto de médico encontrado';
    RETURN;
  END IF;
  
  -- Retornar dados do médico
  RETURN QUERY
  SELECT m.id, m.clinica_id, m.cpf, m.nome_completo
  FROM public.medicos m
  WHERE m.cpf = medico_cpf_atual AND m.ativo = true;
END;
$function$;

-- 10. Corrigir função calcular_cobranca_mensal
CREATE OR REPLACE FUNCTION public.calcular_cobranca_mensal(clinica_uuid uuid, mes_ref date)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  plano_atual RECORD;
  total_usuarios INTEGER;
  total_medicos INTEGER;
  usuarios_extras INTEGER;
  medicos_extras INTEGER;
  valor_base NUMERIC;
  valor_usuarios_extras NUMERIC;
  valor_medicos_extras NUMERIC;
  valor_total NUMERIC;
  resultado JSON;
BEGIN
  -- Buscar plano atual da clínica
  SELECT pa.* INTO plano_atual
  FROM planos_assinatura pa
  JOIN assinaturas a ON a.tipo_plano = pa.tipo_plano
  WHERE a.clinica_id = clinica_uuid AND a.status = 'ativa'
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN '{"error": "Plano não encontrado"}';
  END IF;
  
  -- Contar usuários ativos
  SELECT COUNT(*) INTO total_usuarios
  FROM funcionarios
  WHERE clinica_id = clinica_uuid AND ativo = true;
  
  -- Contar médicos ativos
  SELECT COUNT(*) INTO total_medicos
  FROM medicos
  WHERE clinica_id = clinica_uuid AND ativo = true;
  
  -- Calcular excedentes
  usuarios_extras := GREATEST(0, total_usuarios - plano_atual.limite_base_usuarios);
  medicos_extras := GREATEST(0, total_medicos - plano_atual.limite_base_medicos);
  
  -- Calcular valores
  valor_base := plano_atual.valor_base_clinica;
  valor_usuarios_extras := usuarios_extras * plano_atual.valor_por_usuario;
  valor_medicos_extras := medicos_extras * plano_atual.valor_por_medico;
  valor_total := valor_base + valor_usuarios_extras + valor_medicos_extras;
  
  -- Inserir/atualizar cobrança detalhada
  INSERT INTO cobranca_detalhada (
    clinica_id, mes_referencia, total_usuarios, total_medicos,
    usuarios_excedentes, medicos_excedentes, valor_base,
    valor_usuarios_extras, valor_medicos_extras, valor_total_calculado
  ) VALUES (
    clinica_uuid, mes_ref, total_usuarios, total_medicos,
    usuarios_extras, medicos_extras, valor_base,
    valor_usuarios_extras, valor_medicos_extras, valor_total
  )
  ON CONFLICT (clinica_id, mes_referencia) 
  DO UPDATE SET
    total_usuarios = EXCLUDED.total_usuarios,
    total_medicos = EXCLUDED.total_medicos,
    usuarios_excedentes = EXCLUDED.usuarios_excedentes,
    medicos_excedentes = EXCLUDED.medicos_excedentes,
    valor_usuarios_extras = EXCLUDED.valor_usuarios_extras,
    valor_medicos_extras = EXCLUDED.valor_medicos_extras,
    valor_total_calculado = EXCLUDED.valor_total_calculado,
    updated_at = now();
  
  resultado := json_build_object(
    'valor_base', valor_base,
    'total_usuarios', total_usuarios,
    'total_medicos', total_medicos,
    'usuarios_extras', usuarios_extras,
    'medicos_extras', medicos_extras,
    'valor_usuarios_extras', valor_usuarios_extras,
    'valor_medicos_extras', valor_medicos_extras,
    'valor_total', valor_total
  );
  
  RETURN resultado;
END;
$function$;