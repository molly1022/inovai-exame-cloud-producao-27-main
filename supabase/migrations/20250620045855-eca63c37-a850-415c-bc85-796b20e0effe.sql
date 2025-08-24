
-- Criar tabela para login dos funcionários
CREATE TABLE public.funcionarios_login (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  cpf TEXT NOT NULL,
  senha TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(funcionario_id),
  UNIQUE(cpf)
);

-- Comentários para documentação
COMMENT ON TABLE public.funcionarios_login IS 'Tabela para armazenar credenciais de login dos funcionários';
COMMENT ON COLUMN public.funcionarios_login.funcionario_id IS 'Referência ao funcionário na tabela funcionários';
COMMENT ON COLUMN public.funcionarios_login.cpf IS 'CPF usado como login do funcionário';
COMMENT ON COLUMN public.funcionarios_login.senha IS 'Senha de acesso do funcionário';

-- Índices para melhor performance
CREATE INDEX idx_funcionarios_login_cpf ON public.funcionarios_login(cpf);
CREATE INDEX idx_funcionarios_login_funcionario_id ON public.funcionarios_login(funcionario_id);
