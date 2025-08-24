-- Atualizar a assinatura ativa para refletir os novos limites do plano básico
UPDATE assinaturas 
SET limite_medicos = 10,
    updated_at = NOW()
WHERE clinica_id = '00000000-0000-0000-0000-000000000001' 
AND status = 'ativa' 
AND tipo_plano = 'basico';