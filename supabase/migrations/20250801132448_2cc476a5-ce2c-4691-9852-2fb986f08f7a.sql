-- Configurar telemedicina ativa na clínica "Inovai Exibe Clínica"
INSERT INTO public.configuracoes_clinica (
  clinica_id,
  email_login_clinica,
  senha_acesso_clinica,
  codigo_acesso_admin,
  codigo_acesso_clinica,
  codigo_acesso_funcionario,
  daily_api_key,
  telemedicina_ativa,
  valor_adicional_telemedicina,
  verificacao_automatica,
  created_at,
  updated_at
) VALUES (
  'd4c5cd26-ce33-445a-ab88-27edf6a069a8'::uuid,
  'inovaiexibe@gmail.com',
  'inovai123',
  'admin_inovai',
  'clinica_inovai',
  'func_inovai',
  'f9f510868a67264b3e335e29413cc6333cd5a08c00106d6be94c73694be1e99c',
  true,
  20.00,
  true,
  now(),
  now()
) ON CONFLICT (clinica_id) DO UPDATE SET
  daily_api_key = EXCLUDED.daily_api_key,
  telemedicina_ativa = EXCLUDED.telemedicina_ativa,
  valor_adicional_telemedicina = EXCLUDED.valor_adicional_telemedicina,
  verificacao_automatica = EXCLUDED.verificacao_automatica,
  updated_at = now();

-- Atualizar assinatura para plano empresarial  
UPDATE public.assinaturas 
SET 
  tipo_plano = 'empresarial',
  limite_funcionarios = 50,
  limite_medicos = 100,
  valor = 2500.00,
  valor_original = 3000.00,
  updated_at = now()
WHERE clinica_id = 'd4c5cd26-ce33-445a-ab88-27edf6a069a8'::uuid;

-- Criar médico especialista em telemedicina com campos corretos
INSERT INTO public.medicos (
  id,
  clinica_id,
  nome_completo,
  cpf,
  crm,
  especialidade,
  telefone,
  email,
  ativo,
  percentual_repasse,
  senha_acesso,
  categoria_trabalho,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'd4c5cd26-ce33-445a-ab88-27edf6a069a8'::uuid,
  'Dr. Lucas Telemedico',
  '33344455566',
  'CRM/SP 123456',
  'Telemedicina e Medicina Geral',
  '(11) 99777-8888',
  'lucas.telemedico@inovaiexibe.com',
  true,
  70.00,
  'telemedico123',
  ARRAY['Telemedicina', 'Consultas Virtuais']::text[],
  now(),
  now()
) ON CONFLICT (cpf) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  especialidade = EXCLUDED.especialidade,
  ativo = EXCLUDED.ativo,
  senha_acesso = EXCLUDED.senha_acesso,
  updated_at = now();

-- Buscar o ID do médico e criar dados relacionados
DO $$
DECLARE
  medico_uuid uuid;
  paciente_uuid uuid;
  funcionario_uuid uuid;
BEGIN
  -- Buscar médico
  SELECT id INTO medico_uuid FROM public.medicos WHERE cpf = '33344455566';
  
  -- Criar login do médico
  INSERT INTO public.medicos_login (
    id,
    medico_id,
    clinica_id,
    cpf,
    senha,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    medico_uuid,
    'd4c5cd26-ce33-445a-ab88-27edf6a069a8'::uuid,
    '33344455566',
    'telemedico123',
    now(),
    now()
  ) ON CONFLICT (cpf) DO UPDATE SET
    senha = EXCLUDED.senha,
    updated_at = now();

  -- Criar paciente para testes de telemedicina
  paciente_uuid := gen_random_uuid();
  INSERT INTO public.pacientes (
    id,
    clinica_id,
    nome,
    cpf,
    email,
    telefone,
    data_nascimento,
    genero,
    endereco_completo,
    cidade,
    estado,
    cep,
    senha_acesso,
    created_at,
    updated_at
  ) VALUES (
    paciente_uuid,
    'd4c5cd26-ce33-445a-ab88-27edf6a069a8'::uuid,
    'Ana Paciente Teleconsulta',
    '77788899900',
    'ana.teleconsulta@email.com',
    '(11) 99555-4444',
    '1995-12-15'::date,
    'Feminino',
    'Av. Virtual, 200 - Apt 15',
    'São Paulo',
    'SP',
    '05678-900',
    'ana123',
    now(),
    now()
  ) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    senha_acesso = EXCLUDED.senha_acesso,
    updated_at = now();

  -- Criar funcionário admin com todas as permissões
  funcionario_uuid := gen_random_uuid();
  INSERT INTO public.funcionarios (
    id,
    clinica_id,
    nome,
    cpf,
    email,
    telefone,
    cargo,
    permissoes,
    ativo,
    created_at,
    updated_at
  ) VALUES (
    funcionario_uuid,
    'd4c5cd26-ce33-445a-ab88-27edf6a069a8'::uuid,
    'Paula Admin Avançada',
    '66677788899',
    'paula.admin@inovaiexibe.com',
    '(11) 99333-2222',
    'Administradora de Telemedicina',
    ARRAY['agenda', 'pacientes', 'exames', 'telemedicina', 'relatorios', 'financeiro', 'medicos']::text[],
    true,
    now(),
    now()
  ) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    permissoes = EXCLUDED.permissoes,
    ativo = EXCLUDED.ativo,
    updated_at = now();

  -- Login do funcionário
  INSERT INTO public.funcionarios_login (
    id,
    funcionario_id,
    clinica_id,
    cpf,
    senha,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    funcionario_uuid,
    'd4c5cd26-ce33-445a-ab88-27edf6a069a8'::uuid,
    '66677788899',
    'paula_admin123',
    now(),
    now()
  ) ON CONFLICT (cpf) DO UPDATE SET
    senha = EXCLUDED.senha,
    updated_at = now();

END $$;