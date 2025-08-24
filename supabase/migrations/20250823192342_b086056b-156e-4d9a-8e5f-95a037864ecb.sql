-- Inserir registro da clínica banco modelo no sistema central
INSERT INTO public.clinicas_central (
  nome,
  email, 
  telefone,
  endereco,
  subdominio,
  status,
  database_name,
  database_url,
  configuracoes,
  limites
) VALUES (
  'Clínica Banco Modelo',
  'suporte@somosinovai.com',
  '(11) 99999-9999', 
  'Rua Modelo, 123 - Centro - São Paulo/SP',
  'bancomodelo',
  'ativa',
  'banco_modelo',
  'https://tgydssyqgmifcuajacgo.supabase.co',
  '{
    "responsavel": "Sistema Banco Modelo",
    "cpf_responsavel": "000.000.000-00", 
    "observacoes": "Clínica modelo para clonagem de novas instâncias",
    "senha_hash": "YmFuY29tb2RlbG8xMjM=",
    "created_by": "sistema_admin"
  }'::jsonb,
  '{
    "max_medicos": 50,
    "max_funcionarios": 100,
    "max_pacientes": 5000,
    "teleconsultas_mes": 500
  }'::jsonb
) ON CONFLICT (subdominio) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  telefone = EXCLUDED.telefone,
  endereco = EXCLUDED.endereco,
  status = EXCLUDED.status,
  database_name = EXCLUDED.database_name,
  database_url = EXCLUDED.database_url,
  configuracoes = EXCLUDED.configuracoes,
  limites = EXCLUDED.limites,
  updated_at = now();