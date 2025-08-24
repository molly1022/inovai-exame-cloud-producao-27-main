-- Criar tabela para sessões administrativas
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  primeira_senha_alterada BOOLEAN DEFAULT false,
  nova_senha TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_sessions (apenas o sistema pode gerenciar)
CREATE POLICY "Sistema pode gerenciar sessões admin"
  ON public.admin_sessions
  FOR ALL
  USING (true);

-- Índices para performance
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);