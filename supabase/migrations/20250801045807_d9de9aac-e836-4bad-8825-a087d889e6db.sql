-- Criar duas clínicas de teste com planos diferentes

-- Inserir clínicas de teste
INSERT INTO public.clinicas (id, nome, email, telefone, subdominio, created_at, updated_at) VALUES 
(
  'test-intermediario-clinic-id'::uuid,
  'Clínica Teste Intermediário',
  'teste.intermediario@exemplo.com',
  '(11) 99999-0001',
  'teste-intermediario',
  now(),
  now()
),
(
  'test-avancado-clinic-id'::uuid,
  'Clínica Teste Avançado',
  'teste.avancado@exemplo.com',
  '(11) 99999-0002',
  'teste-avancado',
  now(),
  now()
);

-- Inserir configurações das clínicas
INSERT INTO public.configuracoes_clinica (clinica_id, email_login_clinica, senha_acesso_clinica, codigo_acesso_clinica, codigo_acesso_funcionario) VALUES
(
  'test-intermediario-clinic-id'::uuid,
  'teste.intermediario@exemplo.com',
  'teste123',
  'intermediario2024',
  'func_inter2024'
),
(
  'test-avancado-clinic-id'::uuid,
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
  'test-intermediario-clinic-id'::uuid,
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
  'test-avancado-clinic-id'::uuid,
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
  'test-intermediario-clinic-id'::uuid,
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
  'test-avancado-clinic-id'::uuid,
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
DO $$
DECLARE
    clinic_id UUID;
    medico_count INTEGER;
    novo_valor NUMERIC;
BEGIN
    -- Clínica intermediário
    clinic_id := 'test-intermediario-clinic-id'::uuid;
    SELECT COUNT(*) INTO medico_count FROM medicos WHERE clinica_id = clinic_id AND ativo = true;
    novo_valor := GREATEST(medico_count, 1) * 190.00;
    
    UPDATE assinaturas 
    SET valor = novo_valor 
    WHERE clinica_id = clinic_id;
    
    -- Clínica avançado
    clinic_id := 'test-avancado-clinic-id'::uuid;
    SELECT COUNT(*) INTO medico_count FROM medicos WHERE clinica_id = clinic_id AND ativo = true;
    novo_valor := GREATEST(medico_count, 1) * 299.00;
    
    UPDATE assinaturas 
    SET valor = novo_valor 
    WHERE clinica_id = clinic_id;
END $$;