-- CORRIGIR ERROS CRÍTICOS DO SISTEMA

-- 1. HABILITAR RLS em todas as tabelas que não têm
ALTER TABLE public.configuracoes_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios_login ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_automacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames_valores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_assinatura ENABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICAS RLS PARA TABELAS CRÍTICAS

-- Configurações da clínica
CREATE POLICY "Clínicas podem ver suas configurações" 
ON public.configuracoes_clinica 
FOR ALL
USING (true);

-- Funcionários login
CREATE POLICY "Funcionários podem gerenciar login" 
ON public.funcionarios_login 
FOR ALL
USING (true);

-- Logs de funcionários
CREATE POLICY "Funcionários podem ver logs da clínica" 
ON public.funcionarios_logs 
FOR ALL
USING (true);

-- Sessões de funcionários
CREATE POLICY "Funcionários podem gerenciar sessões" 
ON public.funcionarios_sessoes 
FOR ALL
USING (true);

-- Configurações de automação
CREATE POLICY "Clínicas podem gerenciar automação" 
ON public.configuracoes_automacao 
FOR ALL
USING (true);

-- Valores de exames
CREATE POLICY "Clínicas podem gerenciar valores de exames" 
ON public.exames_valores 
FOR ALL
USING (true);

-- Convênios
CREATE POLICY "Clínicas podem gerenciar convênios" 
ON public.convenios 
FOR ALL
USING (true);

-- Planos de assinatura
CREATE POLICY "Todos podem visualizar planos" 
ON public.planos_assinatura 
FOR SELECT
USING (true);

-- 3. CORRIGIR DADOS INCONSISTENTES NAS CLÍNICAS EXISTENTES

-- Verificar e corrigir dados da clínica Jackson
INSERT INTO public.configuracoes_clinica (
    clinica_id,
    email_login_clinica,
    senha_acesso_clinica,
    codigo_acesso_clinica,
    codigo_acesso_funcionario
)
SELECT 
    'dbf65fd4-004b-4a35-8201-bb1eb45bf66b'::uuid,
    'jackson@gmail.com',
    'jackson_123',
    'jackson123',
    'func_jackson'
WHERE NOT EXISTS (
    SELECT 1 FROM configuracoes_clinica WHERE clinica_id = 'dbf65fd4-004b-4a35-8201-bb1eb45bf66b'::uuid
);

-- Garantir assinatura para clínica Jackson
INSERT INTO public.assinaturas (
    clinica_id,
    status,
    periodo_meses,
    valor_original,
    valor,
    data_inicio,
    limite_funcionarios,
    limite_medicos,
    tipo_plano
)
SELECT 
    'dbf65fd4-004b-4a35-8201-bb1eb45bf66b'::uuid,
    'ativa',
    1,
    150.00,
    150.00,
    CURRENT_DATE,
    4,
    5,
    'basico'
WHERE NOT EXISTS (
    SELECT 1 FROM assinaturas WHERE clinica_id = 'dbf65fd4-004b-4a35-8201-bb1eb45bf66b'::uuid
);

-- 4. ATUALIZAR DADOS DA CLÍNICA PRINCIPAL
UPDATE public.configuracoes_clinica 
SET 
    email_login_clinica = 'memorialmangabeira@gmail.com',
    senha_acesso_clinica = 'memorial123'
WHERE clinica_id = '00000000-0000-0000-0000-000000000001'::uuid;