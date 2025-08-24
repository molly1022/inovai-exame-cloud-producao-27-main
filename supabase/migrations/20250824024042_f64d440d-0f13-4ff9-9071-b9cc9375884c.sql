-- Inserir entrada para subdomínio bancocentral (para testes)
INSERT INTO clinicas_central (
  nome, 
  email, 
  subdominio, 
  status, 
  database_name,
  configuracoes,
  limites
) VALUES (
  'Banco Central - Sistema de Testes',
  'admin@somosinovai.com', 
  'bancocentral',
  'ativa',
  'bancocentral_teste',
  '{"tipo": "teste", "ambiente": "desenvolvimento"}',
  '{"medicos": 50, "pacientes": 1000, "agendamentos": 500}'
)
ON CONFLICT (subdominio) DO UPDATE SET
  nome = EXCLUDED.nome,
  status = 'ativa',
  updated_at = now();