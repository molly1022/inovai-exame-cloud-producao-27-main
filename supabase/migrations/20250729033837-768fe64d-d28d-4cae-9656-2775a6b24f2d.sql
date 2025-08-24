-- Alterar valor do plano básico para R$ 250
UPDATE planos_assinatura 
SET valor_base = 250.00 
WHERE tipo_plano = 'basico' AND periodo_meses = 1;

-- Ajustar também valores das assinaturas ativas do plano básico mensal
UPDATE assinaturas 
SET valor = 250.00 
WHERE tipo_plano = 'basico' AND periodo_meses = 1;

-- Criar função corrigida para estender assinatura (corrigir bug)
CREATE OR REPLACE FUNCTION public.estender_assinatura_dias(clinica_uuid uuid, dias_adicionar integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    resultado JSON;
    nova_data DATE;
BEGIN
    -- Verificar se a assinatura existe
    IF NOT EXISTS (SELECT 1 FROM public.assinaturas WHERE clinica_id = clinica_uuid) THEN
        RETURN '{"success": false, "error": "Assinatura não encontrada"}';
    END IF;
    
    -- Estender pelos dias especificados
    UPDATE public.assinaturas 
    SET proximo_pagamento = proximo_pagamento + (dias_adicionar || ' days')::interval,
        updated_at = now()
    WHERE clinica_id = clinica_uuid
    RETURNING proximo_pagamento INTO nova_data;
    
    -- Registrar a extensão
    INSERT INTO public.admin_logs (
        acao, 
        detalhes, 
        admin_session_id,
        ip_address
    ) VALUES (
        'EXTENSAO_ASSINATURA',
        jsonb_build_object(
            'clinica_id', clinica_uuid,
            'nova_data_vencimento', nova_data,
            'dias_adicionados', dias_adicionar
        ),
        'admin_extension',
        'sistema'
    );
    
    resultado := json_build_object(
        'success', true,
        'nova_data_vencimento', nova_data,
        'dias_adicionados', dias_adicionar
    );
    
    RETURN resultado;
END;
$function$;

-- Habilitar cadastro automático de clínicas (remover verificação manual)
UPDATE configuracoes_sistema 
SET verificacao_automatica_ativa = true,
    updated_at = now()
WHERE id IS NOT NULL;

-- Se não existir configuração do sistema, criar uma
INSERT INTO configuracoes_sistema (verificacao_automatica_ativa, tempo_verificacao_minutos)
SELECT true, 5
WHERE NOT EXISTS (SELECT 1 FROM configuracoes_sistema);