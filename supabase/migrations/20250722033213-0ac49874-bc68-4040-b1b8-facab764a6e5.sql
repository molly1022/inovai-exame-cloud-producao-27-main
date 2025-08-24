-- Remover temporariamente as constraints para permitir inserção
ALTER TABLE public.medicos DROP CONSTRAINT IF EXISTS medicos_clinica_crm_unique;
ALTER TABLE public.medicos DROP CONSTRAINT IF EXISTS medicos_clinica_coren_unique;

-- Remover índices que podem estar conflitando
DROP INDEX IF EXISTS idx_medicos_clinica_crm;
DROP INDEX IF EXISTS idx_medicos_clinica_coren;

-- Adicionar constraint simples apenas para CPF por clínica
CREATE UNIQUE INDEX IF NOT EXISTS idx_medicos_clinica_cpf 
ON public.medicos (clinica_id, cpf);