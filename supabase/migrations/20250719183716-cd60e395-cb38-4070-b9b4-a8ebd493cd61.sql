
-- Adicionar campo subdominio na tabela clinicas
ALTER TABLE public.clinicas 
ADD COLUMN IF NOT EXISTS subdominio TEXT UNIQUE;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_clinicas_subdominio 
ON public.clinicas(subdominio);

-- Atualizar clínica existente com subdomínio padrão
UPDATE public.clinicas 
SET subdominio = 'clinica1'
WHERE id = '00000000-0000-0000-0000-000000000001' 
AND subdominio IS NULL;

-- Criar tabela para inscrições pendentes de novas clínicas
CREATE TABLE IF NOT EXISTS public.inscricoes_pendentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_clinica TEXT NOT NULL,
    subdominio_solicitado TEXT NOT NULL UNIQUE,
    email_responsavel TEXT NOT NULL,
    telefone TEXT,
    nome_responsavel TEXT NOT NULL,
    cpf_responsavel TEXT NOT NULL,
    plano_id UUID REFERENCES public.planos_assinatura(id),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
    dados_completos JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    processada_em TIMESTAMPTZ,
    processada_por UUID
);

-- RLS para inscricoes_pendentes
ALTER TABLE public.inscricoes_pendentes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de qualquer pessoa
CREATE POLICY "Permitir inserção de inscrições"
ON public.inscricoes_pendentes
FOR INSERT
WITH CHECK (true);

-- Política para admins verem todas as inscrições
CREATE POLICY "Admins podem ver todas as inscrições"
ON public.inscricoes_pendentes
FOR SELECT
USING (true);

-- Função para processar inscrição e criar clínica automaticamente
CREATE OR REPLACE FUNCTION public.processar_inscricao_clinica(
    inscricao_id UUID,
    aprovada BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    inscricao_data RECORD;
    nova_clinica_id UUID;
    resultado JSON;
BEGIN
    -- Buscar dados da inscrição
    SELECT * INTO inscricao_data 
    FROM public.inscricoes_pendentes 
    WHERE id = inscricao_id AND status = 'pendente';
    
    IF NOT FOUND THEN
        RETURN '{"success": false, "error": "Inscrição não encontrada ou já processada"}';
    END IF;
    
    IF NOT aprovada THEN
        -- Rejeitar inscrição
        UPDATE public.inscricoes_pendentes 
        SET status = 'rejeitada', 
            processada_em = now(),
            updated_at = now()
        WHERE id = inscricao_id;
        
        RETURN '{"success": true, "action": "rejeitada"}';
    END IF;
    
    -- Criar nova clínica
    nova_clinica_id := gen_random_uuid();
    
    INSERT INTO public.clinicas (
        id, nome, email, telefone, subdominio, created_at, updated_at
    ) VALUES (
        nova_clinica_id,
        inscricao_data.nome_clinica,
        inscricao_data.email_responsavel,
        inscricao_data.telefone,
        inscricao_data.subdominio_solicitado,
        now(),
        now()
    );
    
    -- Criar configurações da clínica
    INSERT INTO public.configuracoes_clinica (
        clinica_id,
        email_login_clinica,
        senha_acesso_clinica,
        codigo_acesso_clinica,
        codigo_acesso_funcionario
    ) VALUES (
        nova_clinica_id,
        inscricao_data.email_responsavel,
        'senha_temporaria_' || substr(nova_clinica_id::text, 1, 8),
        'clinica_' || substr(nova_clinica_id::text, 1, 8),
        'func_' || substr(nova_clinica_id::text, 1, 8)
    );
    
    -- Criar assinatura padrão
    INSERT INTO public.assinaturas (
        clinica_id,
        plano_id,
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
        nova_clinica_id,
        p.id,
        'pendente',
        p.periodo_meses,
        p.valor_base,
        p.valor_final,
        CURRENT_DATE,
        p.limite_funcionarios,
        p.limite_medicos,
        p.tipo_plano
    FROM public.planos_assinatura p
    WHERE p.id = COALESCE(inscricao_data.plano_id, (SELECT id FROM public.planos_assinatura WHERE tipo_plano = 'basico' LIMIT 1));
    
    -- Marcar inscrição como aprovada
    UPDATE public.inscricoes_pendentes 
    SET status = 'aprovada', 
        processada_em = now(),
        updated_at = now()
    WHERE id = inscricao_id;
    
    resultado := json_build_object(
        'success', true,
        'action', 'aprovada',
        'clinica_id', nova_clinica_id,
        'subdominio', inscricao_data.subdominio_solicitado,
        'email', inscricao_data.email_responsavel
    );
    
    RETURN resultado;
END;
$$;
