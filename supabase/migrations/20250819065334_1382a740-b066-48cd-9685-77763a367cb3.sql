-- Criar registro da clínica teste-1 na tabela principal
INSERT INTO public.clinicas (
  id,
  nome,
  email,
  telefone,
  subdominio,
  ativo,
  created_at,
  updated_at
) VALUES (
  '189bf3a1-2557-4ec5-8306-fd357a773602',
  'Clínica Teste 1',
  'admin@teste1.com',
  '(11) 99999-9999',
  'teste-1',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  subdominio = EXCLUDED.subdominio,
  updated_at = now();

-- Criar configurações de login para a clínica teste-1 (usando colunas corretas)
INSERT INTO public.configuracoes_clinica (
  clinica_id,
  email_login_clinica,
  senha_acesso_clinica,
  senha_hash_secure,
  codigo_acesso_admin,
  email_verified,
  requires_password_change,
  mfa_enabled,
  account_locked,
  failed_login_attempts,
  created_at,
  updated_at
) VALUES (
  '189bf3a1-2557-4ec5-8306-fd357a773602',
  'admin@teste1.com',
  'teste123',
  crypt('teste123', gen_salt('bf')),
  'admin_teste1',
  true,
  false,
  false,
  false,
  0,
  now(),
  now()
) ON CONFLICT (clinica_id) DO UPDATE SET
  email_login_clinica = EXCLUDED.email_login_clinica,
  senha_acesso_clinica = EXCLUDED.senha_acesso_clinica,
  senha_hash_secure = EXCLUDED.senha_hash_secure,
  updated_at = now();

-- Criar assinatura trial para a clínica
INSERT INTO public.assinaturas (
  clinica_id,
  tipo_plano,
  periodo_meses,
  valor,
  status,
  data_inicio,
  proximo_pagamento,
  created_at,
  updated_at
) VALUES (
  '189bf3a1-2557-4ec5-8306-fd357a773602',
  'trial',
  1,
  0.00,
  'trial',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  now(),
  now()
) ON CONFLICT (clinica_id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = now();