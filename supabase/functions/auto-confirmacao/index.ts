
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Iniciando processo de auto-confirmação...')

    // Buscar configurações de automação ativas
    const { data: configuracoes, error: configError } = await supabaseClient
      .from('configuracoes_automacao')
      .select('*')
      .eq('ativo', true)

    if (configError) {
      console.error('Erro ao buscar configurações:', configError)
      throw configError
    }

    let totalConfirmados = 0

    for (const config of configuracoes || []) {
      console.log(`Processando clínica ${config.clinica_id}`)

      // Calcular o tempo limite para auto-confirmação
      const agora = new Date()
      const tempoLimite = new Date(agora.getTime() + (config.auto_confirmacao_minutos * 60 * 1000))

      // Buscar agendamentos que devem ser auto-confirmados
      const { data: agendamentos, error: agendError } = await supabaseClient
        .from('agendamentos')
        .select('*')
        .eq('clinica_id', config.clinica_id)
        .eq('status', 'agendado')
        .gte('data_agendamento', agora.toISOString())
        .lte('data_agendamento', tempoLimite.toISOString())

      if (agendError) {
        console.error('Erro ao buscar agendamentos:', agendError)
        continue
      }

      console.log(`Encontrados ${agendamentos?.length || 0} agendamentos para confirmar`)

      // Auto-confirmar cada agendamento
      for (const agendamento of agendamentos || []) {
        const { error: updateError } = await supabaseClient
          .from('agendamentos')
          .update({
            status: 'confirmado',
            auto_confirmado: true
          })
          .eq('id', agendamento.id)

        if (updateError) {
          console.error(`Erro ao confirmar agendamento ${agendamento.id}:`, updateError)
        } else {
          console.log(`Agendamento ${agendamento.id} auto-confirmado`)
          totalConfirmados++
        }
      }
    }

    console.log(`Total de agendamentos auto-confirmados: ${totalConfirmados}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `${totalConfirmados} agendamentos auto-confirmados`,
        totalConfirmados
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erro na auto-confirmação:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
