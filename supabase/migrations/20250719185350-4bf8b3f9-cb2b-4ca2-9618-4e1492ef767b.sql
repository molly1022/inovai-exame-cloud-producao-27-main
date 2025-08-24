
-- Atualizar clínica principal com subdomínio
UPDATE clinicas 
SET subdominio = 'clinica1' 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Atualizar clínica Jackson com subdomínio (se existir)
UPDATE clinicas 
SET subdominio = 'jackson' 
WHERE id = 'dbf65fd4-004b-4a35-8201-bb1eb45bf66b';

-- Garantir que todas as clínicas tenham subdomínios únicos
UPDATE clinicas 
SET subdominio = COALESCE(subdominio, 'clinica' || substr(id::text, 1, 8))
WHERE subdominio IS NULL OR subdominio = '';
