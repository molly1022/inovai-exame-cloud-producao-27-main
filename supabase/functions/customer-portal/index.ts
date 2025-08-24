
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
    console.log('Customer portal function called');

    // Para Mercado Pago, não temos um portal de cliente como o Stripe
    // Vamos retornar uma URL que leva para a página de pagamentos da clínica
    const origin = req.headers.get("origin") || "https://medsyspro.com";
    const managementUrl = `${origin}/dashboard/pagamentos`;

    console.log('Redirecting to management page:', managementUrl);

    return new Response(
      JSON.stringify({ 
        url: managementUrl,
        message: "Redirecionando para página de gerenciamento de assinatura"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error('Error in customer portal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
