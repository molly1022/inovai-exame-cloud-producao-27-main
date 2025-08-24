-- Modify sync_categoria_valores function to properly delete instead of just deactivate
CREATE OR REPLACE FUNCTION public.sync_categoria_valores()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
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
    -- Deletar o valor na tabela exames_valores quando categoria é deletada
    DELETE FROM exames_valores
    WHERE clinica_id = OLD.clinica_id AND tipo_exame = OLD.nome;
    
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure there is a trigger that uses this function for DELETE operations
DROP TRIGGER IF EXISTS categorias_exames_trigger ON categorias_exames;
CREATE TRIGGER categorias_exames_trigger
AFTER INSERT OR UPDATE OR DELETE ON categorias_exames
FOR EACH ROW EXECUTE FUNCTION sync_categoria_valores();