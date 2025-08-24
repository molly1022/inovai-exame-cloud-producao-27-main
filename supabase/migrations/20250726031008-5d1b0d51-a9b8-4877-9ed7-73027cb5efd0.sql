-- Criar tabela para códigos de recuperação de senha
CREATE TABLE IF NOT EXISTS public.codigos_recuperacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL,
  email TEXT NOT NULL,
  codigo TEXT NOT NULL,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_codigos_recuperacao_email ON public.codigos_recuperacao(email);
CREATE INDEX IF NOT EXISTS idx_codigos_recuperacao_codigo ON public.codigos_recuperacao(codigo);
CREATE INDEX IF NOT EXISTS idx_codigos_recuperacao_clinica_id ON public.codigos_recuperacao(clinica_id);

-- RLS para segurança
ALTER TABLE public.codigos_recuperacao ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção e leitura
CREATE POLICY "Permitir operações em códigos de recuperação" 
ON public.codigos_recuperacao 
FOR ALL 
USING (true);

-- Função para limpar códigos expirados (executar diariamente)
CREATE OR REPLACE FUNCTION public.limpar_codigos_expirados()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    codigos_limpos INTEGER;
BEGIN
    DELETE FROM public.codigos_recuperacao 
    WHERE expira_em < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS codigos_limpos = ROW_COUNT;
    
    RETURN codigos_limpos;
END;
$$;