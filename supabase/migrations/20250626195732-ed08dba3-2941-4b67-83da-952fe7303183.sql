
-- Adicionar foreign keys na tabela receitas_medicas
ALTER TABLE public.receitas_medicas 
ADD CONSTRAINT fk_receitas_medico 
FOREIGN KEY (medico_id) REFERENCES public.medicos(id) ON DELETE CASCADE;

ALTER TABLE public.receitas_medicas 
ADD CONSTRAINT fk_receitas_paciente 
FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;

ALTER TABLE public.receitas_medicas 
ADD CONSTRAINT fk_receitas_clinica 
FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id) ON DELETE CASCADE;
