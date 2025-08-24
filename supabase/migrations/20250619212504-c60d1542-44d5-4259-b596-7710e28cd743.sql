
-- Adicionar campo COREN na tabela médicos
ALTER TABLE public.medicos 
ADD COLUMN coren TEXT;

-- Comentário explicativo da nova coluna
COMMENT ON COLUMN public.medicos.coren IS 'Número do registro no Conselho Regional de Enfermagem - opcional';
