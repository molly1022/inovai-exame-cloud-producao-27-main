-- 1. Primeiro, vamos corrigir e expandir o sistema de planos
-- Adicionar nova estrutura de cobrança flexível na tabela planos_assinatura
ALTER TABLE planos_assinatura ADD COLUMN IF NOT EXISTS valor_base_clinica NUMERIC(10,2) DEFAULT 150.00;
ALTER TABLE planos_assinatura ADD COLUMN IF NOT EXISTS valor_por_usuario NUMERIC(10,2) DEFAULT 25.00;
ALTER TABLE planos_assinatura ADD COLUMN IF NOT EXISTS valor_por_medico NUMERIC(10,2) DEFAULT 130.00;
ALTER TABLE planos_assinatura ADD COLUMN IF NOT EXISTS limite_base_usuarios INTEGER DEFAULT 2;
ALTER TABLE planos_assinatura ADD COLUMN IF NOT EXISTS limite_base_medicos INTEGER DEFAULT 1;
ALTER TABLE planos_assinatura ADD COLUMN IF NOT EXISTS funcionalidades_bloqueadas TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Criar tabela para controle detalhado de cobrança
CREATE TABLE IF NOT EXISTS public.cobranca_detalhada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  assinatura_id UUID NOT NULL REFERENCES assinaturas(id),
  
  -- Contadores de uso
  total_usuarios INTEGER DEFAULT 0,
  total_medicos INTEGER DEFAULT 0,
  usuarios_excedentes INTEGER DEFAULT 0,
  medicos_excedentes INTEGER DEFAULT 0,
  
  -- Valores calculados
  valor_base NUMERIC(10,2) DEFAULT 150.00,
  valor_usuarios_extras NUMERIC(10,2) DEFAULT 0.00,
  valor_medicos_extras NUMERIC(10,2) DEFAULT 0.00,
  valor_total_calculado NUMERIC(10,2) DEFAULT 150.00,
  
  -- Período de cobrança
  mes_referencia DATE NOT NULL,
  data_calculo TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.cobranca_detalhada ENABLE ROW LEVEL SECURITY;

-- Política para isolamento por clínica
CREATE POLICY "Cobranca isolada por clinica" ON public.cobranca_detalhada
FOR ALL USING (clinica_id IN (
  SELECT clinicas.id FROM clinicas 
  WHERE clinicas.id = cobranca_detalhada.clinica_id
));

-- 3. Atualizar planos existentes com nova estrutura
UPDATE planos_assinatura SET 
  valor_base_clinica = CASE tipo_plano
    WHEN 'basico' THEN 150.00
    WHEN 'intermediario' THEN 280.00 
    WHEN 'premium' THEN 450.00
    ELSE 150.00
  END,
  valor_por_usuario = CASE tipo_plano
    WHEN 'basico' THEN 25.00
    WHEN 'intermediario' THEN 20.00
    WHEN 'premium' THEN 15.00
    ELSE 25.00
  END,
  valor_por_medico = CASE tipo_plano
    WHEN 'basico' THEN 130.00
    WHEN 'intermediario' THEN 120.00
    WHEN 'premium' THEN 130.00
    ELSE 130.00
  END,
  limite_base_usuarios = CASE tipo_plano
    WHEN 'basico' THEN 2
    WHEN 'intermediario' THEN 5
    WHEN 'premium' THEN 10
    ELSE 2
  END,
  limite_base_medicos = CASE tipo_plano
    WHEN 'basico' THEN 1
    WHEN 'intermediario' THEN 3
    WHEN 'premium' THEN 5
    ELSE 1
  END,
  funcionalidades_bloqueadas = CASE tipo_plano
    WHEN 'basico' THEN ARRAY['emails', 'relatorios', 'monitoramento', 'telemedicina']
    WHEN 'intermediario' THEN ARRAY['monitoramento', 'telemedicina']
    WHEN 'premium' THEN ARRAY[]::TEXT[]
    ELSE ARRAY['emails', 'relatorios', 'monitoramento', 'telemedicina']
  END;

-- 4. Criar tabelas para sistema de telemedicina
CREATE TABLE IF NOT EXISTS public.teleconsultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  agendamento_id UUID NOT NULL REFERENCES agendamentos(id),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  
  -- Configurações da Sala
  sala_id TEXT NOT NULL UNIQUE,
  url_medico TEXT NOT NULL,
  url_paciente TEXT NOT NULL,
  
  -- Controle de Status
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN (
    'agendada', 'iniciada', 'em_andamento', 'finalizada', 
    'cancelada', 'nao_compareceu_medico', 'nao_compareceu_paciente'
  )),
  
  -- Informações da Consulta
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  duracao_segundos INTEGER,
  
  -- Gravação
  gravacao_ativada BOOLEAN DEFAULT true,
  url_gravacao TEXT,
  senha_gravacao TEXT,
  
  -- Qualidade da Conexão
  qualidade_video_medico TEXT,
  qualidade_video_paciente TEXT,
  problemas_conexao TEXT[],
  
  -- Dados da Consulta
  prescricoes_geradas UUID[],
  atestados_gerados UUID[],
  arquivos_compartilhados TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.teleconsultas ENABLE ROW LEVEL SECURITY;

-- Políticas para teleconsultas
CREATE POLICY "Teleconsultas isoladas por clinica" ON public.teleconsultas
FOR ALL USING (clinica_id IN (
  SELECT clinicas.id FROM clinicas 
  WHERE clinicas.id = teleconsultas.clinica_id
));

CREATE POLICY "Medicos podem acessar suas teleconsultas" ON public.teleconsultas
FOR ALL USING (medico_id IN (
  SELECT m.id FROM get_current_medico() m
));

-- Tabela de participantes da teleconsulta
CREATE TABLE IF NOT EXISTS public.teleconsulta_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teleconsulta_id UUID NOT NULL REFERENCES teleconsultas(id),
  
  tipo_participante TEXT NOT NULL CHECK (tipo_participante IN ('medico', 'paciente')),
  usuario_id UUID NOT NULL,
  
  entrou_em TIMESTAMP WITH TIME ZONE,
  saiu_em TIMESTAMP WITH TIME ZONE,
  esta_online BOOLEAN DEFAULT false,
  
  camera_ativada BOOLEAN DEFAULT true,
  microfone_ativado BOOLEAN DEFAULT true,
  tela_compartilhada BOOLEAN DEFAULT false,
  
  latencia_ms INTEGER,
  qualidade_audio TEXT,
  qualidade_video TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS public.teleconsulta_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teleconsulta_id UUID NOT NULL REFERENCES teleconsultas(id),
  
  remetente_tipo TEXT NOT NULL CHECK (remetente_tipo IN ('medico', 'paciente', 'sistema')),
  remetente_id UUID,
  remetente_nome TEXT NOT NULL,
  
  mensagem TEXT NOT NULL,
  tipo_mensagem TEXT DEFAULT 'texto' CHECK (tipo_mensagem IN ('texto', 'arquivo', 'sistema')),
  arquivo_url TEXT,
  
  enviada_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  visualizada_em TIMESTAMP WITH TIME ZONE
);

-- 5. Função para calcular cobrança automática
CREATE OR REPLACE FUNCTION public.calcular_cobranca_mensal(clinica_uuid UUID, mes_ref DATE)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plano_atual RECORD;
  total_usuarios INTEGER;
  total_medicos INTEGER;
  usuarios_extras INTEGER;
  medicos_extras INTEGER;
  valor_base NUMERIC;
  valor_usuarios_extras NUMERIC;
  valor_medicos_extras NUMERIC;
  valor_total NUMERIC;
  resultado JSON;
BEGIN
  -- Buscar plano atual da clínica
  SELECT pa.* INTO plano_atual
  FROM planos_assinatura pa
  JOIN assinaturas a ON a.tipo_plano = pa.tipo_plano
  WHERE a.clinica_id = clinica_uuid AND a.status = 'ativa'
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN '{"error": "Plano não encontrado"}';
  END IF;
  
  -- Contar usuários ativos
  SELECT COUNT(*) INTO total_usuarios
  FROM funcionarios
  WHERE clinica_id = clinica_uuid AND ativo = true;
  
  -- Contar médicos ativos
  SELECT COUNT(*) INTO total_medicos
  FROM medicos
  WHERE clinica_id = clinica_uuid AND ativo = true;
  
  -- Calcular excedentes
  usuarios_extras := GREATEST(0, total_usuarios - plano_atual.limite_base_usuarios);
  medicos_extras := GREATEST(0, total_medicos - plano_atual.limite_base_medicos);
  
  -- Calcular valores
  valor_base := plano_atual.valor_base_clinica;
  valor_usuarios_extras := usuarios_extras * plano_atual.valor_por_usuario;
  valor_medicos_extras := medicos_extras * plano_atual.valor_por_medico;
  valor_total := valor_base + valor_usuarios_extras + valor_medicos_extras;
  
  -- Inserir/atualizar cobrança detalhada
  INSERT INTO cobranca_detalhada (
    clinica_id, mes_referencia, total_usuarios, total_medicos,
    usuarios_excedentes, medicos_excedentes, valor_base,
    valor_usuarios_extras, valor_medicos_extras, valor_total_calculado
  ) VALUES (
    clinica_uuid, mes_ref, total_usuarios, total_medicos,
    usuarios_extras, medicos_extras, valor_base,
    valor_usuarios_extras, valor_medicos_extras, valor_total
  )
  ON CONFLICT (clinica_id, mes_referencia) 
  DO UPDATE SET
    total_usuarios = EXCLUDED.total_usuarios,
    total_medicos = EXCLUDED.total_medicos,
    usuarios_excedentes = EXCLUDED.usuarios_excedentes,
    medicos_excedentes = EXCLUDED.medicos_excedentes,
    valor_usuarios_extras = EXCLUDED.valor_usuarios_extras,
    valor_medicos_extras = EXCLUDED.valor_medicos_extras,
    valor_total_calculado = EXCLUDED.valor_total_calculado,
    updated_at = now();
  
  resultado := json_build_object(
    'valor_base', valor_base,
    'total_usuarios', total_usuarios,
    'total_medicos', total_medicos,
    'usuarios_extras', usuarios_extras,
    'medicos_extras', medicos_extras,
    'valor_usuarios_extras', valor_usuarios_extras,
    'valor_medicos_extras', valor_medicos_extras,
    'valor_total', valor_total
  );
  
  RETURN resultado;
END;
$$;