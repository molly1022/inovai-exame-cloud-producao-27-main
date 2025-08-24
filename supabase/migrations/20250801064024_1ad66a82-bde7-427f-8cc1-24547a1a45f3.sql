-- 1. Adicionar campo percentual_repasse na tabela medicos
ALTER TABLE public.medicos 
ADD COLUMN percentual_repasse NUMERIC(5,2) DEFAULT 0.00 CHECK (percentual_repasse >= 0 AND percentual_repasse <= 100);

-- 2. Criar tabela para controle de repasses a médicos
CREATE TABLE public.repasses_medicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID NOT NULL,
    medico_id UUID NOT NULL,
    agendamento_id UUID NOT NULL,
    valor_consulta NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    percentual_repasse NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    valor_repasse NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    mes_referencia DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
    data_pagamento TIMESTAMP WITH TIME ZONE NULL,
    observacoes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Criar tabela para faturas mensais de médicos (para planos multi-mês)
CREATE TABLE public.faturas_medicos_mensais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID NOT NULL,
    mes_referencia DATE NOT NULL,
    total_medicos INTEGER NOT NULL DEFAULT 0,
    medicos_extras INTEGER NOT NULL DEFAULT 0,
    valor_por_medico NUMERIC(10,2) NOT NULL DEFAULT 175.00,
    valor_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencida')),
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE NULL,
    stripe_payment_intent_id TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(clinica_id, mes_referencia)
);

-- 4. Habilitar RLS nas novas tabelas
ALTER TABLE public.repasses_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturas_medicos_mensais ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para repasses_medicos
CREATE POLICY "Repasses isolados por clinica" ON public.repasses_medicos
FOR ALL
USING (clinica_id IN (SELECT clinicas.id FROM clinicas WHERE clinicas.id = repasses_medicos.clinica_id))
WITH CHECK (clinica_id IN (SELECT clinicas.id FROM clinicas WHERE clinicas.id = repasses_medicos.clinica_id));

CREATE POLICY "Medicos podem ver seus repasses" ON public.repasses_medicos
FOR SELECT
USING (medico_id IN (SELECT m.id FROM get_current_medico() m(id, clinica_id, cpf, nome_completo)));

-- 6. Políticas RLS para faturas_medicos_mensais
CREATE POLICY "Faturas medicos isoladas por clinica" ON public.faturas_medicos_mensais
FOR ALL
USING (clinica_id IN (SELECT clinicas.id FROM clinicas WHERE clinicas.id = faturas_medicos_mensais.clinica_id))
WITH CHECK (clinica_id IN (SELECT clinicas.id FROM clinicas WHERE clinicas.id = faturas_medicos_mensais.clinica_id));

-- 7. Função para calcular repasses automaticamente quando consulta é concluída
CREATE OR REPLACE FUNCTION public.calcular_repasse_medico()
RETURNS TRIGGER AS $$
DECLARE
    medico_percentual NUMERIC;
    valor_repasse_calculado NUMERIC;
    mes_ref DATE;
BEGIN
    -- Só processar se status mudou para 'concluido' e há valor_pago
    IF NEW.status = 'concluido' AND OLD.status != 'concluido' AND NEW.valor_pago > 0 AND NEW.medico_id IS NOT NULL THEN
        
        -- Buscar percentual do médico
        SELECT percentual_repasse INTO medico_percentual
        FROM medicos 
        WHERE id = NEW.medico_id AND clinica_id = NEW.clinica_id;
        
        -- Se médico tem percentual definido, calcular repasse
        IF medico_percentual IS NOT NULL AND medico_percentual > 0 THEN
            valor_repasse_calculado := (NEW.valor_pago * medico_percentual / 100);
            mes_ref := DATE_TRUNC('month', NEW.data_agendamento)::DATE;
            
            -- Inserir registro de repasse
            INSERT INTO repasses_medicos (
                clinica_id,
                medico_id,
                agendamento_id,
                valor_consulta,
                percentual_repasse,
                valor_repasse,
                mes_referencia
            ) VALUES (
                NEW.clinica_id,
                NEW.medico_id,
                NEW.id,
                NEW.valor_pago,
                medico_percentual,
                valor_repasse_calculado,
                mes_ref
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para calcular repasses automaticamente
CREATE TRIGGER trigger_calcular_repasse_medico
    AFTER UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_repasse_medico();

-- 9. Função para gerar fatura mensal de médicos (para planos multi-mês)
CREATE OR REPLACE FUNCTION public.gerar_fatura_mensal_medicos(p_clinica_id UUID, p_mes_referencia DATE)
RETURNS JSON AS $$
DECLARE
    assinatura_info RECORD;
    total_medicos_ativos INTEGER;
    medicos_extras INTEGER;
    valor_fatura NUMERIC;
    fatura_id UUID;
    resultado JSON;
BEGIN
    -- Verificar se é plano multi-mês
    SELECT * INTO assinatura_info
    FROM assinaturas
    WHERE clinica_id = p_clinica_id AND status = 'ativa';
    
    IF NOT FOUND OR assinatura_info.periodo_meses = 1 THEN
        RETURN json_build_object('error', 'Fatura mensal só se aplica a planos multi-mês');
    END IF;
    
    -- Contar médicos ativos
    SELECT COUNT(*) INTO total_medicos_ativos
    FROM medicos
    WHERE clinica_id = p_clinica_id AND ativo = true;
    
    -- Calcular médicos extras (acima de 1)
    medicos_extras := GREATEST(total_medicos_ativos - 1, 0);
    valor_fatura := medicos_extras * 175.00;
    
    -- Inserir/atualizar fatura mensal
    INSERT INTO faturas_medicos_mensais (
        clinica_id,
        mes_referencia,
        total_medicos,
        medicos_extras,
        valor_total,
        data_vencimento
    ) VALUES (
        p_clinica_id,
        p_mes_referencia,
        total_medicos_ativos,
        medicos_extras,
        valor_fatura,
        p_mes_referencia + INTERVAL '1 month'
    )
    ON CONFLICT (clinica_id, mes_referencia)
    DO UPDATE SET
        total_medicos = EXCLUDED.total_medicos,
        medicos_extras = EXCLUDED.medicos_extras,
        valor_total = EXCLUDED.valor_total,
        updated_at = now()
    RETURNING id INTO fatura_id;
    
    resultado := json_build_object(
        'fatura_id', fatura_id,
        'total_medicos', total_medicos_ativos,
        'medicos_extras', medicos_extras,
        'valor_total', valor_fatura,
        'mes_referencia', p_mes_referencia
    );
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;