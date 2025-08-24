-- Atualizar plano da clínica integrammedica123123 para avançado
UPDATE public.assinaturas 
SET tipo_plano = 'avancado_medico',
    valor = 350.00,
    limite_funcionarios = 20,
    limite_medicos = 20,
    updated_at = now()
WHERE clinica_id = '31df6d1a-2723-4d18-9a6e-9debaddee0c3';

-- Ativar telemedicina para a clínica
UPDATE public.configuracoes_clinica 
SET telemedicina_ativa = true,
    valor_adicional_telemedicina = 15.00,
    updated_at = now()
WHERE clinica_id = '31df6d1a-2723-4d18-9a6e-9debaddee0c3';

-- Criar plano avançado se não existir
INSERT INTO public.planos_assinatura (
    tipo_plano,
    periodo_meses,
    valor_base,
    percentual_desconto,
    valor_final,
    limite_funcionarios,
    limite_medicos,
    limite_teleconsultas_gratuitas,
    valor_pacote_adicional_teleconsulta,
    consultas_por_pacote_adicional,
    funcionalidades_bloqueadas,
    modelo_cobranca
) VALUES (
    'avancado_medico',
    1,
    350.00,
    0.00,
    350.00,
    20,
    20,
    50,
    75.00,
    20,
    ARRAY[]::text[],
    'por_medico'
) ON CONFLICT (tipo_plano, periodo_meses) DO UPDATE SET
    limite_teleconsultas_gratuitas = 50,
    valor_pacote_adicional_teleconsulta = 75.00,
    consultas_por_pacote_adicional = 20,
    funcionalidades_bloqueadas = ARRAY[]::text[];

-- Atualizar plano básico para bloquear telemedicina
UPDATE public.planos_assinatura 
SET funcionalidades_bloqueadas = ARRAY['telemedicina', 'relatorios_avancados']
WHERE tipo_plano = 'basico';

-- Garantir que o trigger de teleconsulta existe
CREATE OR REPLACE FUNCTION public.auto_criar_teleconsulta()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  sala_info json;
  limite_check json;
BEGIN
  -- Só criar se for telemedicina e não existir teleconsulta
  IF NEW.eh_telemedicina = true AND NOT EXISTS (
    SELECT 1 FROM teleconsultas WHERE agendamento_id = NEW.id
  ) THEN
    
    -- Verificar limites antes de criar
    SELECT * INTO limite_check FROM verificar_limite_teleconsultas(NEW.clinica_id);
    
    IF (limite_check->>'pode_criar')::boolean = false THEN
      RAISE EXCEPTION 'Limite de teleconsultas excedido para esta clínica';
    END IF;
    
    -- Criar sala Daily.co via service
    sala_info := jsonb_build_object(
      'sala_id', 'sala-' || NEW.id::text,
      'url_medico', 'https://demo.daily.co/sala-' || NEW.id::text || '?role=moderator',
      'url_paciente', 'https://demo.daily.co/sala-' || NEW.id::text || '?role=participant',
      'daily_room_name', 'teleconsulta-' || NEW.id::text
    );
    
    -- Inserir teleconsulta
    INSERT INTO teleconsultas (
      clinica_id,
      agendamento_id,
      medico_id,
      paciente_id,
      sala_id,
      url_medico,
      url_paciente,
      daily_room_name,
      status,
      daily_room_config
    ) VALUES (
      NEW.clinica_id,
      NEW.id,
      NEW.medico_id,
      NEW.paciente_id,
      sala_info->>'sala_id',
      sala_info->>'url_medico',
      sala_info->>'url_paciente',
      sala_info->>'daily_room_name',
      'agendada',
      sala_info
    );
  END IF;
  
  RETURN NEW;
END;
$function$;