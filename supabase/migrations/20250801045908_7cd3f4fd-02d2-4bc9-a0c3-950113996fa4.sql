-- Criar duas clínicas de teste com planos diferentes

-- Inserir clínicas de teste
INSERT INTO public.clinicas (id, nome, email, telefone, subdominio, created_at, updated_at) VALUES 
(
  gen_random_uuid(),
  'Clínica Teste Intermediário',
  'teste.intermediario@exemplo.com',
  '(11) 99999-0001',
  'teste-intermediario',
  now(),
  now()
),
(
  gen_random_uuid(),
  'Clínica Teste Avançado',
  'teste.avancado@exemplo.com',
  '(11) 99999-0002',
  'teste-avancado',
  now(),
  now()
);

-- Criar variáveis para armazenar os IDs gerados
DO $$
DECLARE
    clinic_inter_id UUID;
    clinic_avanc_id UUID;
    medico_count INTEGER;
    novo_valor NUMERIC;
BEGIN
    -- Buscar os IDs das clínicas criadas
    SELECT id INTO clinic_inter_id FROM public.clinicas WHERE email = 'teste.intermediario@exemplo.com';
    SELECT id INTO clinic_avanc_id FROM public.clinicas WHERE email = 'teste.avancado@exemplo.com';

    -- Inserir configurações das clínicas
    INSERT INTO public.configuracoes_clinica (clinica_id, email_login_clinica, senha_acesso_clinica, codigo_acesso_clinica, codigo_acesso_funcionario) VALUES
    (
      clinic_inter_id,
      'teste.intermediario@exemplo.com',
      'teste123',
      'intermediario2024',
      'func_inter2024'
    ),
    (
      clinic_avanc_id,
      'teste.avancado@exemplo.com',
      'teste123',
      'avancado2024',
      'func_avanc2024'
    );

    -- Inserir assinaturas ativas
    INSERT INTO public.assinaturas (
      clinica_id, 
      status, 
      periodo_meses, 
      valor_original, 
      valor, 
      data_inicio, 
      proximo_pagamento, 
      limite_funcionarios, 
      limite_medicos, 
      tipo_plano
    ) VALUES 
    (
      clinic_inter_id,
      'ativa',
      1,
      190.00,
      190.00,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      999,
      999,
      'intermediario_medico'
    ),
    (
      clinic_avanc_id,
      'ativa',
      1,
      299.00,
      299.00,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      999,
      999,
      'avancado_medico'
    );

    -- Inserir médicos para as clínicas de teste
    INSERT INTO public.medicos (
      clinica_id,
      nome_completo,
      cpf,
      crm,
      especialidade,
      email,
      telefone,
      ativo,
      senha_acesso,
      created_at,
      updated_at
    ) VALUES 
    (
      clinic_inter_id,
      'Dr. João Silva Intermediário',
      '12345678901',
      'CRM-SP 123456',
      'Clínico Geral',
      'dr.joao@intermediario.com',
      '(11) 99999-1001',
      true,
      'medico123',
      now(),
      now()
    ),
    (
      clinic_avanc_id,
      'Dr. Maria Santos Avançado',
      '12345678902',
      'CRM-SP 123457',
      'Cardiologista',
      'dr.maria@avancado.com',
      '(11) 99999-1002',
      true,
      'medico123',
      now(),
      now()
    );

    -- Atualizar valores das assinaturas baseado nos médicos
    -- Clínica intermediário
    SELECT COUNT(*) INTO medico_count FROM medicos WHERE clinica_id = clinic_inter_id AND ativo = true;
    novo_valor := GREATEST(medico_count, 1) * 190.00;
    
    UPDATE assinaturas 
    SET valor = novo_valor 
    WHERE clinica_id = clinic_inter_id;
    
    -- Clínica avançado
    SELECT COUNT(*) INTO medico_count FROM medicos WHERE clinica_id = clinic_avanc_id AND ativo = true;
    novo_valor := GREATEST(medico_count, 1) * 299.00;
    
    UPDATE assinaturas 
    SET valor = novo_valor 
    WHERE clinica_id = clinic_avanc_id;
    
    -- Log das clínicas criadas
    INSERT INTO public.logs_acesso (acao, tabela_afetada, detalhes)
    VALUES (
        'CLINICAS_TESTE_CRIADAS',
        'clinicas',
        jsonb_build_object(
            'intermediario_id', clinic_inter_id,
            'avancado_id', clinic_avanc_id,
            'login_intermediario', 'Email: teste.intermediario@exemplo.com | Senha: teste123',
            'login_avancado', 'Email: teste.avancado@exemplo.com | Senha: teste123'
        )
    );
END $$;