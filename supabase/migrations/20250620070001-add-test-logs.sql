
-- Adicionar alguns logs de teste para verificar o funcionamento

-- Inserir logs de teste apenas se a tabela estiver vazia
INSERT INTO public.funcionarios_logs (
  funcionario_id,
  clinica_id,
  acao,
  descricao,
  ip_address,
  user_agent,
  created_at
)
SELECT 
  f.id,
  f.clinica_id,
  'LOGIN',
  'Login de teste do sistema',
  '192.168.1.1',
  'Mozilla/5.0 (Test Browser)',
  now() - interval '1 hour'
FROM public.funcionarios f
WHERE f.ativo = true
AND NOT EXISTS (SELECT 1 FROM public.funcionarios_logs WHERE funcionario_id = f.id)
LIMIT 1;

-- Inserir mais alguns logs variados
INSERT INTO public.funcionarios_logs (
  funcionario_id,
  clinica_id,
  acao,
  descricao,
  ip_address,
  user_agent,
  created_at
)
SELECT 
  f.id,
  f.clinica_id,
  'CREATE_PATIENT',
  'Paciente criado via sistema',
  '192.168.1.2',
  'Mozilla/5.0 (Test Browser)',
  now() - interval '30 minutes'
FROM public.funcionarios f
WHERE f.ativo = true
LIMIT 1;

-- Inserir sessão de teste
INSERT INTO public.funcionarios_sessoes (
  funcionario_id,
  clinica_id,
  login_at,
  logout_at,
  ip_address,
  user_agent,
  ativa
)
SELECT 
  f.id,
  f.clinica_id,
  now() - interval '2 hours',
  now() - interval '1 hour',
  '192.168.1.1',
  'Mozilla/5.0 (Test Browser)',
  false
FROM public.funcionarios f
WHERE f.ativo = true
AND NOT EXISTS (SELECT 1 FROM public.funcionarios_sessoes WHERE funcionario_id = f.id)
LIMIT 1;

-- Inserir sessão ativa de teste
INSERT INTO public.funcionarios_sessoes (
  funcionario_id,
  clinica_id,
  login_at,
  ip_address,
  user_agent,
  ativa
)
SELECT 
  f.id,
  f.clinica_id,
  now() - interval '30 minutes',
  '192.168.1.3',
  'Mozilla/5.0 (Test Browser)',
  true
FROM public.funcionarios f
WHERE f.ativo = true
LIMIT 1;
