-- Corrigir constraints da tabela médicos para permitir CRM e COREN nulos
ALTER TABLE public.medicos DROP CONSTRAINT IF EXISTS medicos_clinica_id_crm_unique;
ALTER TABLE public.medicos DROP CONSTRAINT IF EXISTS medicos_clinica_id_coren_unique;

-- Adicionar constraints corretas que permitem valores nulos
ALTER TABLE public.medicos ADD CONSTRAINT medicos_clinica_crm_unique 
UNIQUE (clinica_id, crm) 
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.medicos ADD CONSTRAINT medicos_clinica_coren_unique 
UNIQUE (clinica_id, coren) 
DEFERRABLE INITIALLY DEFERRED;

-- Corrigir as constraints para funcionar com valores NULL
DROP INDEX IF EXISTS idx_medicos_clinica_crm;
DROP INDEX IF EXISTS idx_medicos_clinica_coren;

CREATE UNIQUE INDEX idx_medicos_clinica_crm 
ON public.medicos (clinica_id, crm) 
WHERE crm IS NOT NULL;

CREATE UNIQUE INDEX idx_medicos_clinica_coren 
ON public.medicos (clinica_id, coren) 
WHERE coren IS NOT NULL;