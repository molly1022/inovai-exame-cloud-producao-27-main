-- Atualizar políticas RLS da tabela médicos para isolamento por clínica
DROP POLICY IF EXISTS "Medicos isolamento por clinica" ON public.medicos;

-- Criar nova política que garante isolamento total por clínica
CREATE POLICY "Médicos isolados por clínica" 
ON public.medicos 
FOR ALL 
USING (clinica_id = COALESCE(get_current_clinic_id(), '00000000-0000-0000-0000-000000000001'::uuid))
WITH CHECK (clinica_id = COALESCE(get_current_clinic_id(), '00000000-0000-0000-0000-000000000001'::uuid));

-- Garantir que clinica_id seja obrigatório na tabela médicos
ALTER TABLE public.medicos ALTER COLUMN clinica_id SET NOT NULL;

-- Adicionar constraint única para CRM por clínica (médicos podem ter mesmo CRM em clínicas diferentes)
ALTER TABLE public.medicos DROP CONSTRAINT IF EXISTS medicos_clinica_id_crm_key;
ALTER TABLE public.medicos ADD CONSTRAINT medicos_clinica_id_crm_unique UNIQUE (clinica_id, crm) DEFERRABLE INITIALLY DEFERRED;

-- Adicionar constraint única para COREN por clínica
ALTER TABLE public.medicos DROP CONSTRAINT IF EXISTS medicos_clinica_id_coren_key;
ALTER TABLE public.medicos ADD CONSTRAINT medicos_clinica_id_coren_unique UNIQUE (clinica_id, coren) DEFERRABLE INITIALLY DEFERRED;