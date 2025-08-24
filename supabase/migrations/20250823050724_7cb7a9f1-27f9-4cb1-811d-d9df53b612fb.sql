-- Limpar todas as referências que podem estar bloqueando a operação
DELETE FROM public.agendamentos_historico;
DELETE FROM public.teleconsultas;
DELETE FROM public.teleconsulta_participantes;
DELETE FROM public.teleconsultas_uso_mensal;

-- Agora limpar e configurar a clínica modelo
DELETE FROM public.clinicas;
INSERT INTO public.clinicas (
    id,
    nome,
    email,
    telefone,
    endereco,
    cnpj,
    subdominio,
    user_id,
    ativo,
    endereco_completo
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Clínica Modelo',
    'modelo@clinica.com',
    '(00) 0000-0000',
    'Endereço Modelo',
    '00.000.000/0001-00',
    'modelo',
    NULL,
    true,
    'Endereço Completo Modelo'
);