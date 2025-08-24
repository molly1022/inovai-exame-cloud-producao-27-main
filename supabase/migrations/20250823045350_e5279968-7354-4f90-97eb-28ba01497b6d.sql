-- Primeiro limpar tabelas de teleconsultas que fazem referência aos agendamentos
DELETE FROM public.teleconsulta_participantes;
DELETE FROM public.teleconsultas_uso_mensal;
DELETE FROM public.teleconsultas;