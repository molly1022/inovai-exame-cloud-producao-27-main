-- Configurar telemedicina na clínica existente "Inovai Exibe Clínica"
UPDATE public.configuracoes_clinica 
SET 
  daily_api_key = 'f9f510868a67264b3e335e29413cc6333cd5a08c00106d6be94c73694be1e99c',
  telemedicina_ativa = true,
  valor_adicional_telemedicina = 25.00,
  verificacao_automatica = true,
  updated_at = now()
WHERE clinica_id = 'd4c5cd26-ce33-445a-ab88-27edf6a069a8'::uuid;

-- Se não existir configuração, criar uma nova
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
  verificacao_automatica
) 
SELECT 
  'd4c5cd26-ce33-445a-ab88-27edf6a069a8'::uuid,
  'inovaiexibe@gmail.com',
  'inovai123',
  'admin_inovai',
  'clinica_inovai', 
  'func_inovai',
  'f9f510868a67264b3e335e29413cc6333cd5a08c00106d6be94c73694be1e99c',
  true,
  25.00,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.configuracoes_clinica 
  WHERE clinica_id = 'd4c5cd26-ce33-445a-ab88-27edf6a069a8'::uuid
);

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