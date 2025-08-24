
-- Criar bucket para fotos de perfil dos pacientes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pacientes', 'pacientes', true);

-- Criar políticas para o bucket pacientes
CREATE POLICY "Permitir visualização pública de fotos" ON storage.objects
  FOR SELECT USING (bucket_id = 'pacientes');

CREATE POLICY "Permitir upload de fotos pelos pacientes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pacientes');

CREATE POLICY "Permitir atualização de fotos pelos pacientes" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pacientes');

CREATE POLICY "Permitir deleção de fotos pelos pacientes" ON storage.objects
  FOR DELETE USING (bucket_id = 'pacientes');
