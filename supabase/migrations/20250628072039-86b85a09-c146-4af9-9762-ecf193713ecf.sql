
-- Adicionar coluna de valor na tabela categorias_exames
ALTER TABLE categorias_exames 
ADD COLUMN valor NUMERIC(10,2) DEFAULT 0.00;

-- Atualizar função de trigger para sincronizar categorias com exames_valores
CREATE OR REPLACE FUNCTION sync_categoria_valores()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Inserir novo valor na tabela exames_valores quando categoria é criada
    INSERT INTO exames_valores (clinica_id, tipo_exame, valor, descricao, ativo)
    VALUES (NEW.clinica_id, NEW.nome, COALESCE(NEW.valor, 0.00), NEW.descricao, NEW.ativo);
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Atualizar valor na tabela exames_valores quando categoria é modificada
    UPDATE exames_valores 
    SET 
      tipo_exame = NEW.nome,
      valor = COALESCE(NEW.valor, 0.00),
      descricao = NEW.descricao,
      ativo = NEW.ativo
    WHERE clinica_id = NEW.clinica_id AND tipo_exame = OLD.nome;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Desativar valor na tabela exames_valores quando categoria é deletada
    UPDATE exames_valores 
    SET ativo = false
    WHERE clinica_id = OLD.clinica_id AND tipo_exame = OLD.nome;
    
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para sincronizar automaticamente
DROP TRIGGER IF EXISTS sync_categoria_valores_trigger ON categorias_exames;
CREATE TRIGGER sync_categoria_valores_trigger
  AFTER INSERT OR UPDATE OR DELETE ON categorias_exames
  FOR EACH ROW EXECUTE FUNCTION sync_categoria_valores();
