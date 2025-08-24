-- ==========================================
-- BANCO CENTRAL - ESTRUTURA PRINCIPAL
-- ==========================================

-- Tabela principal de clínicas do sistema
CREATE TABLE public.clinicas_central (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  endereco TEXT,
  subdominio TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'suspensa', 'bloqueada')),
  plano_id UUID,
  database_url TEXT, -- URL do banco dedicado da clínica
  database_name TEXT, -- Nome do banco dedicado
  service_role_key TEXT, -- Chave de acesso ao banco da clínica
  configuracoes JSONB DEFAULT '{}',
  limites JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_access TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX idx_clinicas_central_subdominio ON public.clinicas_central(subdominio);
CREATE INDEX idx_clinicas_central_status ON public.clinicas_central(status);
CREATE INDEX idx_clinicas_central_plano ON public.clinicas_central(plano_id);

-- Tabela de planos do sistema
CREATE TABLE public.planos_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL DEFAULT 0,
  periodicidade TEXT NOT NULL DEFAULT 'mensal' CHECK (periodicidade IN ('mensal', 'anual', 'lifetime')),
  limites JSONB NOT NULL DEFAULT '{}', -- {pacientes: 100, medicos: 5, agendamentos_mes: 1000}
  recursos JSONB NOT NULL DEFAULT '{}', -- {telemedicina: true, relatorios: true, api: false}
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir planos padrão
INSERT INTO public.planos_sistema (nome, descricao, preco, limites, recursos, ordem) VALUES
('Básico', 'Plano ideal para clínicas pequenas', 97.00, 
 '{"pacientes": 500, "medicos": 3, "agendamentos_mes": 2000, "storage_gb": 5}',
 '{"agenda": true, "pacientes": true, "prontuarios": true, "relatorios_basicos": true}', 1),
('Profissional', 'Plano completo para clínicas médias', 197.00,
 '{"pacientes": 2000, "medicos": 10, "agendamentos_mes": 8000, "storage_gb": 20}', 
 '{"agenda": true, "pacientes": true, "prontuarios": true, "telemedicina": true, "relatorios_avancados": true, "integracoes": true}', 2),
('Enterprise', 'Plano premium para grandes clínicas', 497.00,
 '{"pacientes": -1, "medicos": -1, "agendamentos_mes": -1, "storage_gb": 100}',
 '{"agenda": true, "pacientes": true, "prontuarios": true, "telemedicina": true, "relatorios_avancados": true, "integracoes": true, "api": true, "suporte_prioritario": true}', 3);

-- Tabela de configurações globais do sistema
CREATE TABLE public.configuracoes_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor JSONB NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'geral',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Configurações padrão
INSERT INTO public.configuracoes_sistema (chave, valor, descricao, categoria) VALUES
('sistema_nome', '"Sistema Médico Multi-Clínicas"', 'Nome do sistema', 'geral'),
('sistema_versao', '"2.0.0"', 'Versão atual do sistema', 'geral'),
('manutencao_ativa', 'false', 'Sistema em manutenção', 'sistema'),
('max_clinicas_ativas', '1000', 'Máximo de clínicas ativas simultaneamente', 'limites'),
('backup_automatico', 'true', 'Backup automático ativado', 'sistema'),
('dns_wildcard_domain', '"*.somosinovai.com"', 'Domínio wildcard para subdomínios', 'dns');

-- Tabela de logs do sistema (auditoria)
CREATE TABLE public.logs_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID, -- Pode ser NULL para logs do sistema geral
  usuario_id TEXT, -- ID do usuário (auth.uid())
  acao TEXT NOT NULL,
  tabela TEXT,
  registro_id TEXT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nivel TEXT NOT NULL DEFAULT 'info' CHECK (nivel IN ('debug', 'info', 'warning', 'error', 'critical'))
);

-- Índices para logs
CREATE INDEX idx_logs_sistema_clinica_id ON public.logs_sistema(clinica_id);
CREATE INDEX idx_logs_sistema_timestamp ON public.logs_sistema(timestamp);
CREATE INDEX idx_logs_sistema_acao ON public.logs_sistema(acao);
CREATE INDEX idx_logs_sistema_nivel ON public.logs_sistema(nivel);

-- Tabela de métricas do sistema
CREATE TABLE public.metricas_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID, -- NULL para métricas globais
  data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_metrica TEXT NOT NULL, -- 'usuarios_ativos', 'agendamentos', 'receita', etc.
  valor DECIMAL(15,2) NOT NULL DEFAULT 0,
  unidade TEXT, -- 'quantidade', 'reais', 'percentual'
  metadados JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para métricas
CREATE INDEX idx_metricas_sistema_clinica_data ON public.metricas_sistema(clinica_id, data_referencia);
CREATE INDEX idx_metricas_sistema_tipo ON public.metricas_sistema(tipo_metrica);

-- Tabela de conexões ativas das clínicas
CREATE TABLE public.conexoes_clinicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL,
  subdominio TEXT NOT NULL,
  database_url TEXT,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'erro', 'conectando')),
  ultimo_ping TIMESTAMP WITH TIME ZONE DEFAULT now(),
  latencia_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para conexões
CREATE INDEX idx_conexoes_clinicas_clinica_id ON public.conexoes_clinicas(clinica_id);
CREATE INDEX idx_conexoes_clinicas_subdominio ON public.conexoes_clinicas(subdominio);

-- ==========================================
-- RLS POLICIES - SEGURANÇA
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.clinicas_central ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conexoes_clinicas ENABLE ROW LEVEL SECURITY;

-- Policies para clinicas_central (apenas admins do sistema)
CREATE POLICY "Apenas admins podem ver clínicas" 
ON public.clinicas_central FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin_sistema');

CREATE POLICY "Apenas admins podem inserir clínicas" 
ON public.clinicas_central FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'admin_sistema');

CREATE POLICY "Apenas admins podem atualizar clínicas" 
ON public.clinicas_central FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'admin_sistema');

-- Policies para planos_sistema (leitura pública, edição apenas admins)
CREATE POLICY "Planos são públicos para leitura" 
ON public.planos_sistema FOR SELECT 
USING (ativo = true);

CREATE POLICY "Apenas admins podem modificar planos" 
ON public.planos_sistema FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin_sistema');

-- Policies para configurações (apenas admins)
CREATE POLICY "Apenas admins acessam configurações" 
ON public.configuracoes_sistema FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin_sistema');

-- Policies para logs (apenas admins para ver, sistema para inserir)
CREATE POLICY "Apenas admins veem logs" 
ON public.logs_sistema FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin_sistema');

CREATE POLICY "Sistema pode inserir logs" 
ON public.logs_sistema FOR INSERT 
WITH CHECK (true); -- Edge functions podem inserir logs

-- Policies para métricas (apenas admins)
CREATE POLICY "Apenas admins acessam métricas" 
ON public.metricas_sistema FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin_sistema');

-- Policies para conexões (apenas admins e sistema)
CREATE POLICY "Apenas admins veem conexões" 
ON public.conexoes_clinicas FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin_sistema');

CREATE POLICY "Sistema pode gerenciar conexões" 
ON public.conexoes_clinicas FOR ALL 
WITH CHECK (true); -- Edge functions podem gerenciar

-- ==========================================
-- TRIGGERS E FUNÇÕES
-- ==========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_clinicas_central_updated_at
  BEFORE UPDATE ON public.clinicas_central
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planos_sistema_updated_at
  BEFORE UPDATE ON public.planos_sistema
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_sistema_updated_at
  BEFORE UPDATE ON public.configuracoes_sistema
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conexoes_clinicas_updated_at
  BEFORE UPDATE ON public.conexoes_clinicas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar foreign key entre clínicas e planos
ALTER TABLE public.clinicas_central 
ADD CONSTRAINT fk_clinicas_central_plano 
FOREIGN KEY (plano_id) REFERENCES public.planos_sistema(id);

-- Adicionar foreign key entre conexões e clínicas
ALTER TABLE public.conexoes_clinicas 
ADD CONSTRAINT fk_conexoes_clinicas_clinica 
FOREIGN KEY (clinica_id) REFERENCES public.clinicas_central(id) ON DELETE CASCADE;