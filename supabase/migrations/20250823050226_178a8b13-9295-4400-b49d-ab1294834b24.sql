-- Remover triggers e funções de trial automático que dependem de tabelas inexistentes
DROP TRIGGER IF EXISTS auto_trial_trigger ON public.clinicas CASCADE;
DROP FUNCTION IF EXISTS public.auto_trial_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.criar_trial_automatico(uuid, text) CASCADE;