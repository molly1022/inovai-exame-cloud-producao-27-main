import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Iniciando processamento de teleconsultas pendentes...');

    // Buscar teleconsultas com status 'agendada' e URLs NULL (salas ainda não criadas)
    const { data: teleconsultasPendentes, error: fetchError } = await supabaseAdmin
      .from('teleconsultas')
      .select(`
        *,
        agendamentos!inner(
          data_agendamento,
          eh_telemedicina,
          pacientes!inner(nome, cpf),
          medicos!inner(nome_completo)
        )
      `)
      .eq('status', 'agendada')
      .is('url_medico', null)
      .is('url_paciente', null);

    if (fetchError) {
      console.error('Erro ao buscar teleconsultas pendentes:', fetchError);
      throw fetchError;
    }

    console.log(`Encontradas ${teleconsultasPendentes?.length || 0} teleconsultas pendentes`);

    if (!teleconsultasPendentes || teleconsultasPendentes.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhuma teleconsulta pendente encontrada',
        processadas: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let processadas = 0;
    let erros = 0;

    // Processar cada teleconsulta pendente
    for (const teleconsulta of teleconsultasPendentes) {
      try {
        console.log(`Processando teleconsulta ID: ${teleconsulta.id}`);

        // Chamar a função de criação de sala Daily.co
        const { data: roomData, error: roomError } = await supabaseAdmin.functions.invoke(
          'create-daily-room',
          {
            body: {
              agendamento_id: teleconsulta.agendamento_id,
              clinica_id: teleconsulta.clinica_id
            }
          }
        );

        if (roomError) {
          console.error(`Erro ao criar sala para teleconsulta ${teleconsulta.id}:`, roomError);
          
          // Marcar como erro
          await supabaseAdmin
            .from('teleconsultas')
            .update({
              status: 'erro_criacao_sala',
              updated_at: new Date().toISOString()
            })
            .eq('id', teleconsulta.id);

          erros++;
          continue;
        }

        console.log(`Sala criada com sucesso para teleconsulta ${teleconsulta.id}`);
        processadas++;

      } catch (error) {
        console.error(`Erro inesperado ao processar teleconsulta ${teleconsulta.id}:`, error);
        erros++;
      }
    }

    // Log do resultado
    await supabaseAdmin
      .from('logs_acesso')
      .insert({
        acao: 'PROCESSAMENTO_TELECONSULTAS_BATCH',
        tabela_afetada: 'teleconsultas',
        detalhes: {
          total_pendentes: teleconsultasPendentes.length,
          processadas: processadas,
          erros: erros,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(JSON.stringify({
      success: true,
      message: `Processamento concluído: ${processadas} salas criadas, ${erros} erros`,
      total_pendentes: teleconsultasPendentes.length,
      processadas: processadas,
      erros: erros
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no processamento de teleconsultas:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Erro interno do servidor'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});