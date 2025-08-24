
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

    console.log('Iniciando processo de auto-início de consultas...')

    // Buscar configurações de automação ativas
    const { data: configuracoes, error: configError } = await supabaseClient
      .from('configuracoes_automacao')
      .select('*')
      .eq('ativo', true)

    if (configError) {
      console.error('Erro ao buscar configurações:', configError)
      throw configError
    }

    let totalIniciados = 0

    for (const config of configuracoes || []) {
      console.log(`Processando clínica ${config.clinica_id}`)

      const agora = new Date()
      const diaAtual = agora.getDay() // 0 = Domingo, 1 = Segunda, etc.

      // Verificar se é dia de funcionamento
      if (!config.dias_funcionamento.includes(diaAtual)) {
        console.log(`Hoje não é dia de funcionamento para clínica ${config.clinica_id}`)
        continue
      }

      // Verificar se está no horário de funcionamento
      const horaAtual = agora.toTimeString().substring(0, 5) // HH:MM
      if (horaAtual < config.horario_inicio || horaAtual > config.horario_fim) {
        console.log(`Fora do horário de funcionamento para clínica ${config.clinica_id}`)
        continue
      }

      // Buscar consultas que devem ser iniciadas automaticamente
      // Apenas consultas com paciente_chegou que chegaram no horário
      const { data: agendamentos, error: agendError } = await supabaseClient
        .from('agendamentos')
        .select('*')
        .eq('clinica_id', config.clinica_id)
        .eq('status', 'paciente_chegou')
        .lte('data_agendamento', agora.toISOString())

      if (agendError) {
        console.error('Erro ao buscar agendamentos:', agendError)
        continue
      }

      console.log(`Encontrados ${agendamentos?.length || 0} agendamentos para iniciar`)

      // Auto-iniciar cada agendamento
      for (const agendamento of agendamentos || []) {
        const { error: updateError } = await supabaseClient
          .from('agendamentos')
          .update({
            status: 'em_andamento',
            auto_iniciado: true
          })
          .eq('id', agendamento.id)

        if (updateError) {
          console.error(`Erro ao iniciar agendamento ${agendamento.id}:`, updateError)
        } else {
          console.log(`Agendamento ${agendamento.id} auto-iniciado`)
          totalIniciados++
        }
      }
    }

    console.log(`Total de consultas auto-iniciadas: ${totalIniciados}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `${totalIniciados} consultas auto-iniciadas`,
        totalIniciados
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erro no auto-início:', error)
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
