
-- Verificar se a coluna convenio_id já existe na tabela exames
-- Se não existir, ela será adicionada
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exames' 
        AND column_name = 'convenio_id'
    ) THEN
        ALTER TABLE public.exames ADD COLUMN convenio_id uuid REFERENCES public.convenios(id);
    END IF;
END $$;

-- Criar índice para melhorar performance nas consultas de relatórios
CREATE INDEX IF NOT EXISTS idx_exames_convenio_id ON public.exames(convenio_id);
CREATE INDEX IF NOT EXISTS idx_exames_clinica_data ON public.exames(clinica_id, data_exame);
CREATE INDEX IF NOT EXISTS idx_pacientes_convenio_id ON public.pacientes(convenio_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_convenio_id ON public.agendamentos(convenio_id);
