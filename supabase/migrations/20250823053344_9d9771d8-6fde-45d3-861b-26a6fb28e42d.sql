-- Inserir clínica de teste para validação do sistema
-- Esta clínica será usada para testes de desenvolvimento

INSERT INTO clinicas_central (
  nome,
  subdominio, 
  email,
  telefone,
  cnpj,
  endereco,
  status,
  database_name,
  configuracoes,
  limites
) VALUES (
  'Clínica Teste Sistema',
  'clinica-1',
  'teste@clinicasistema.com',
  '(11) 99999-0001',
  '12.345.678/0001-90',
  'Rua Teste, 123 - Centro, São Paulo - SP',
  'ativa',
  'clinica_teste_sistema',
  '{"timezone": "America/Sao_Paulo", "tema": "default", "idioma": "pt-BR"}'::jsonb,
  '{"pacientes": 1000, "medicos": 10, "agendamentos_mes": 5000}'::jsonb
);