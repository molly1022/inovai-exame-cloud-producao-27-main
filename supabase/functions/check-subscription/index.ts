
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
    const { clinicaId } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get subscription data
    const { data: assinatura, error } = await supabase
      .from('assinaturas')
      .select('*')
      .eq('clinica_id', clinicaId)
      .single()

    if (error) {
      // No subscription found
      return new Response(
        JSON.stringify({ 
          subscription: null, 
          status: 'inactive',
          dias_restantes: 0 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Check with Stripe if subscription exists
    if (assinatura.stripe_subscription_id) {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
        apiVersion: '2022-11-15',
      })

      try {
        const subscription = await stripe.subscriptions.retrieve(assinatura.stripe_subscription_id)
        
        // Update database with current status
        const status = subscription.status === 'active' ? 'ativa' : 'inativa'
        const proximoPagamento = subscription.current_period_end ? 
          new Date(subscription.current_period_end * 1000).toISOString().split('T')[0] : null

        // Calculate days remaining
        let diasRestantes = 0
        if (proximoPagamento) {
          const hoje = new Date()
          const dataProximoPagamento = new Date(proximoPagamento)
          diasRestantes = Math.max(0, Math.ceil((dataProximoPagamento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)))
        }

        // Update subscription in database
        await supabase
          .from('assinaturas')
          .update({
            status,
            proximo_pagamento: proximoPagamento,
            dias_restantes: diasRestantes,
            updated_at: new Date().toISOString()
          })
          .eq('id', assinatura.id)

        return new Response(
          JSON.stringify({ 
            subscription: {
              ...assinatura,
              status,
              proximo_pagamento: proximoPagamento,
              dias_restantes: diasRestantes
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      } catch (stripeError) {
        console.error('Stripe error:', stripeError)
        // Return database data if Stripe fails
        return new Response(
          JSON.stringify({ subscription: assinatura }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
    }

    return new Response(
      JSON.stringify({ subscription: assinatura }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error checking subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
