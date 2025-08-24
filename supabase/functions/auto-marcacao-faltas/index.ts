
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

    console.log('Iniciando processo de auto-marcação de faltas...')

    // Buscar configurações de automação ativas
    const { data: configuracoes, error: configError } = await supabaseClient
      .from('configuracoes_automacao')
      .select('*')
      .eq('ativo', true)

    if (configError) {
      console.error('Erro ao buscar configurações:', configError)
      throw configError
    }

    let totalFaltas = 0

    for (const config of configuracoes || []) {
      console.log(`Processando clínica ${config.clinica_id}`)

      const agora = new Date()
      
      // Buscar consultas que devem ser marcadas como falta
      // Consultas agendadas/confirmadas que passaram do horário + tolerância (15min)
      const tempoLimite = new Date(agora.getTime() - (15 * 60 * 1000))

      const { data: agendamentos, error: agendError } = await supabaseClient
        .from('agendamentos')
        .select('*')
        .eq('clinica_id', config.clinica_id)
        .in('status', ['agendado', 'confirmado'])
        .lt('data_agendamento', tempoLimite.toISOString())

      if (agendError) {
        console.error('Erro ao buscar agendamentos:', agendError)
        continue
      }

      console.log(`Encontrados ${agendamentos?.length || 0} agendamentos para marcar como falta`)

      // Marcar cada agendamento como falta
      for (const agendamento of agendamentos || []) {
        const dataAgendamento = new Date(agendamento.data_agendamento)
        const minutosAtraso = Math.floor((agora.getTime() - dataAgendamento.getTime()) / (1000 * 60))

        // Só marcar como falta se passou da tolerância de 15 minutos
        if (minutosAtraso > 15) {
          const { error: updateError } = await supabaseClient
            .from('agendamentos')
            .update({
              status: 'faltou'
            })
            .eq('id', agendamento.id)

          if (updateError) {
            console.error(`Erro ao marcar falta no agendamento ${agendamento.id}:`, updateError)
          } else {
            console.log(`Agendamento ${agendamento.id} marcado como falta (${minutosAtraso}min de atraso)`)
            totalFaltas++
          }
        }
      }
    }

    console.log(`Total de faltas auto-marcadas: ${totalFaltas}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `${totalFaltas} faltas auto-marcadas`,
        totalFaltas
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erro na auto-marcação de faltas:', error)
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
