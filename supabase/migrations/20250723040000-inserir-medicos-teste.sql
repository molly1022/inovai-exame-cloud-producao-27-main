-- Inserir médicos de teste para a clínica Memorial Mangabeira
-- Verificar se médico já existe antes de inserir
DO $$
BEGIN
  -- Inserir médico de teste se não existir
  IF NOT EXISTS (SELECT 1 FROM public.medicos WHERE cpf = '04826793448') THEN
    INSERT INTO public.medicos (
      id,
      clinica_id,
      nome_completo,
      cpf,
      crm,
      especialidade,
      ativo,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000001',
      'Dr. Carlos Eduardo Silva',
      '04826793448',
      'CRM-PB 12345',
      'Cardiologia',
      true,
      now(),
      now()
    );
  END IF;
END $$;

-- Inserir credenciais de login para o médico
DO $$
DECLARE
  medico_uuid UUID;
BEGIN
  -- Buscar o ID do médico
  SELECT id INTO medico_uuid FROM public.medicos WHERE cpf = '04826793448' LIMIT 1;
  
  -- Inserir ou atualizar as credenciais de login
  IF medico_uuid IS NOT NULL THEN
    INSERT INTO public.medicos_login (
      medico_id,
      cpf,
      senha,
      created_at,
      updated_at
    ) VALUES (
      medico_uuid,
      '04826793448',
      '123456',
      now(),
      now()
    ) ON CONFLICT (medico_id) DO UPDATE SET
      senha = EXCLUDED.senha,
      updated_at = EXCLUDED.updated_at;
      
    -- Log da operação
    RAISE NOTICE 'Credenciais de login criadas/atualizadas para médico ID: %', medico_uuid;
  ELSE
    RAISE NOTICE 'Médico com CPF 04826793448 não encontrado';
  END IF;
END $$;

-- Verificar se os dados foram inseridos corretamente
DO $$
DECLARE
  total_medicos INTEGER;
  total_logins INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_medicos FROM public.medicos WHERE clinica_id = '00000000-0000-0000-0000-000000000001';
  SELECT COUNT(*) INTO total_logins FROM public.medicos_login;
  
  RAISE NOTICE 'Total de médicos na clínica: %', total_medicos;
  RAISE NOTICE 'Total de logins de médicos: %', total_logins;
END $$;