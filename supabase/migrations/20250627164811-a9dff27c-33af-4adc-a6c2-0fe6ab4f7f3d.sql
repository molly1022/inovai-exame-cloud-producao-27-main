
-- Adicionar campo setor/departamento na tabela de médicos para organização por setores
ALTER TABLE public.medicos 
ADD COLUMN setor VARCHAR(100);

-- Criar índice para melhor performance nas consultas por setor
CREATE INDEX idx_medicos_setor ON public.medicos(setor);

-- Atualizar alguns médicos existentes com setores exemplo (opcional)
UPDATE public.medicos 
SET setor = CASE 
  WHEN especialidade ILIKE '%cardio%' THEN 'Cardiologia'
  WHEN especialidade ILIKE '%pediatr%' THEN 'Pediatria'
  WHEN especialidade ILIKE '%geral%' OR especialidade ILIKE '%clínic%' THEN 'Clínica Geral'
  WHEN especialidade ILIKE '%ortoped%' THEN 'Ortopedia'
  WHEN especialidade ILIKE '%ginecol%' THEN 'Ginecologia'
  ELSE 'Outras Especialidades'
END
WHERE especialidade IS NOT NULL;
