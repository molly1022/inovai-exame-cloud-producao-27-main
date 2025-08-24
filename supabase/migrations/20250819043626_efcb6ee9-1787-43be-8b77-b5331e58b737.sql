-- Recreate funcionarios_logs table
CREATE TABLE IF NOT EXISTS public.funcionarios_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id uuid NOT NULL,
  clinica_id uuid NOT NULL,
  acao text NOT NULL,
  descricao text,
  detalhes jsonb,
  tabela_afetada text,
  registro_id text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE,
  FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE
);

-- Recreate funcionarios_sessoes table
CREATE TABLE IF NOT EXISTS public.funcionarios_sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id uuid NOT NULL,
  clinica_id uuid NOT NULL,
  login_at timestamp with time zone NOT NULL DEFAULT now(),
  logout_at timestamp with time zone,
  ip_address text,
  user_agent text,
  duracao_sessao text,
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE,
  FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.funcionarios_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios_sessoes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for funcionarios_logs
CREATE POLICY "Funcionarios logs isolados por clinica" 
ON public.funcionarios_logs 
FOR ALL 
USING (clinica_id IN (
  SELECT clinicas.id 
  FROM clinicas 
  WHERE clinicas.id = funcionarios_logs.clinica_id
));

-- Create RLS policies for funcionarios_sessoes
CREATE POLICY "Funcionarios sessoes isoladas por clinica" 
ON public.funcionarios_sessoes 
FOR ALL 
USING (clinica_id IN (
  SELECT clinicas.id 
  FROM clinicas 
  WHERE clinicas.id = funcionarios_sessoes.clinica_id
));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_funcionarios_logs_funcionario_clinica 
ON funcionarios_logs(funcionario_id, clinica_id);

CREATE INDEX IF NOT EXISTS idx_funcionarios_logs_created_at 
ON funcionarios_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_funcionarios_sessoes_funcionario_clinica 
ON funcionarios_sessoes(funcionario_id, clinica_id);

CREATE INDEX IF NOT EXISTS idx_funcionarios_sessoes_ativa 
ON funcionarios_sessoes(ativa) WHERE ativa = true;