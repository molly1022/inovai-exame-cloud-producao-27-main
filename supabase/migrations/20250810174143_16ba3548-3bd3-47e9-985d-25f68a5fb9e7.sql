-- Instalar extensão pgcrypto se não existir
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Testar se a função de login está funcionando
DO $$
BEGIN
  -- Testar função de verificação
  PERFORM verify_clinic_login_improved('teste@clinica.com', 'clinica@segura2024');
  RAISE NOTICE 'Função de login testada com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro na função de login: %', SQLERRM;
END;
$$;