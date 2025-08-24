
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { clinicaId, motivo, feedback } = body;

    console.log('Cancelamento solicitado:', { clinicaId, motivo, feedback });

    // Verificar se o Access Token está configurado
    const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpAccessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN não configurado");
      return new Response(JSON.stringify({ 
        error: "Access Token do Mercado Pago não configurado" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Conectar ao Supabase
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.50.0");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Credenciais do Supabase não configuradas.");
      return new Response(JSON.stringify({ 
        error: "Supabase não configurado" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar assinatura atual
    const { data: assinatura, error: assinaturaError } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("clinica_id", clinicaId)
      .single();

    if (assinaturaError || !assinatura) {
      console.error("Assinatura não encontrada:", assinaturaError);
      return new Response(JSON.stringify({ 
        error: "Assinatura não encontrada" 
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Atualizar status da assinatura para cancelada
    const { error: updateError } = await supabase
      .from("assinaturas")
      .update({
        status: "cancelada",
        updated_at: new Date().toISOString()
      })
      .eq("clinica_id", clinicaId);

    if (updateError) {
      console.error("Erro ao cancelar assinatura:", updateError);
      return new Response(JSON.stringify({ 
        error: "Erro ao cancelar assinatura" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Log do cancelamento
    console.log(`Assinatura cancelada para clínica ${clinicaId}:`, {
      motivo,
      feedback,
      dataAnterior: assinatura.proximo_pagamento
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Assinatura cancelada com sucesso",
      gracePeriod: "Você ainda pode usar o sistema até o final do período já pago"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Erro no cancelamento:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Erro interno do servidor" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
