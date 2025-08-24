-- Atualizar valores das assinaturas das clínicas de teste
UPDATE assinaturas 
SET valor = 125.00
WHERE clinica_id IN (
  SELECT id FROM clinicas WHERE email IN ('teste.basico@exemplo.com')
) AND status = 'ativa';

UPDATE assinaturas 
SET valor = 190.00
WHERE clinica_id IN (
  SELECT id FROM clinicas WHERE email IN ('teste.intermediario@exemplo.com')
) AND status = 'ativa';

UPDATE assinaturas 
SET valor = 299.00
WHERE clinica_id IN (
  SELECT id FROM clinicas WHERE email IN ('teste.avancado@exemplo.com')
) AND status = 'ativa';

-- Criar trigger para todas as operações em médicos (insert/update/delete)
DROP TRIGGER IF EXISTS trigger_update_subscription_value ON medicos;

CREATE TRIGGER trigger_update_subscription_value
  AFTER INSERT OR UPDATE OR DELETE ON medicos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_valor_assinatura_por_medicos();