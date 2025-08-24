
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { clinica_id, horario_envio = '20:43' } = await req.json().catch(() => ({}));

    // Converter horário para formato cron (HH:MM para MM HH)
    const [hora, minuto] = horario_envio.split(':');
    const cronExpression = `${minuto} ${hora} * * *`; // Todo dia no horário especificado

    console.log(`🤖 Configurando cron job para ${horario_envio} (${cronExpression})`);
    console.log(`📋 Clínica: ${clinica_id || 'TODAS'}`);

    // Primeiro, remover jobs existentes com o mesmo nome
    try {
      const { error: unscheduleError } = await supabase.rpc('cron.unschedule', { 
        job_name: 'enviar-lembretes-email-diario' 
      });
      
      if (unscheduleError) {
        console.log('⚠️ Job anterior não encontrado ou erro ao remover:', unscheduleError.message);
      } else {
        console.log('✅ Job anterior removido com sucesso');
      }
    } catch (error) {
      console.log('⚠️ Erro ao tentar remover job anterior:', error);
    }

    // Criar novo cron job usando a sintaxe correta
    const sqlCommand = `
      SELECT net.http_post(
        url := '${supabaseUrl}/functions/v1/enviar-lembretes-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ${supabaseAnonKey}'
        ),
        body := jsonb_build_object(
          'trigger', 'cron',
          'timestamp', now()::text,
          'clinica_id', '${clinica_id || ''}'
        )
      );
    `;

    console.log('📝 Comando SQL do cron:', sqlCommand);

    const { data, error } = await supabase.rpc('cron.schedule', {
      job_name: 'enviar-lembretes-email-diario',
      schedule: cronExpression,
      command: sqlCommand
    });

    if (error) {
      console.error('❌ Erro ao criar cron job:', error);
      throw new Error(`Erro ao configurar cron job: ${error.message}`);
    }

    console.log('✅ Cron job configurado com sucesso:', data);

    // Verificar se o job foi realmente criado
    try {
      const { data: jobs, error: listError } = await supabase
        .from('cron.job')
        .select('*')
        .eq('jobname', 'enviar-lembretes-email-diario');

      if (listError) {
        console.log('⚠️ Não foi possível verificar jobs criados:', listError.message);
      } else {
        console.log('📋 Jobs ativos:', jobs);
      }
    } catch (error) {
      console.log('⚠️ Erro ao listar jobs:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `🤖 Cron job configurado com sucesso para ${horario_envio}`,
        schedule: `Todos os dias às ${horario_envio}`,
        cronExpression,
        clinica_id: clinica_id || 'TODAS',
        timestamp: new Date().toISOString(),
        details: {
          job_name: 'enviar-lembretes-email-diario',
          next_execution: `Próxima execução hoje às ${horario_envio} ou amanhã se já passou`
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("💥 Erro ao configurar cron job:", error);
    
    // Verificar se é erro de extensão não habilitada
    const isExtensionError = error.message?.includes('function') && 
                           (error.message?.includes('cron') || error.message?.includes('pg_cron'));
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: isExtensionError 
          ? "As extensões pg_cron e pg_net precisam estar habilitadas no Supabase. Verifique no Dashboard > SQL Editor se estão instaladas."
          : "Erro interno ao configurar automação",
        troubleshooting: {
          step1: "Verifique se pg_cron está habilitado: CREATE EXTENSION IF NOT EXISTS pg_cron;",
          step2: "Verifique se pg_net está habilitado: CREATE EXTENSION IF NOT EXISTS pg_net;",
          step3: "Execute no SQL Editor e tente novamente"
        },
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);
