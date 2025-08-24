-- Corrigir problemas de RLS - Habilitar nas tabelas que estão sem
ALTER TABLE public.teleconsulta_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsulta_mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas para teleconsulta_participantes
CREATE POLICY "Participantes isolados por clinica" ON public.teleconsulta_participantes
FOR ALL
USING (teleconsulta_id IN (SELECT id FROM teleconsultas WHERE clinica_id IN (SELECT clinicas.id FROM clinicas WHERE clinicas.id = teleconsultas.clinica_id)))
WITH CHECK (teleconsulta_id IN (SELECT id FROM teleconsultas WHERE clinica_id IN (SELECT clinicas.id FROM clinicas WHERE clinicas.id = teleconsultas.clinica_id)));

-- Políticas para teleconsulta_mensagens  
CREATE POLICY "Mensagens isoladas por clinica" ON public.teleconsulta_mensagens
FOR ALL
USING (teleconsulta_id IN (SELECT id FROM teleconsultas WHERE clinica_id IN (SELECT clinicas.id FROM clinicas WHERE clinicas.id = teleconsultas.clinica_id)))
WITH CHECK (teleconsulta_id IN (SELECT id FROM teleconsultas WHERE clinica_id IN (SELECT clinicas.id FROM clinicas WHERE clinicas.id = teleconsultas.clinica_id)));