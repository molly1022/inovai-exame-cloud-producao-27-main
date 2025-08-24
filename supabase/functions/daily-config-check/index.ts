import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se DAILY_API_KEY está configurada como secret
    const dailyApiKey = Deno.env.get('DAILY_API_KEY');
    
    if (!dailyApiKey) {
      return new Response(
        JSON.stringify({ 
          configured: false, 
          error: 'DAILY_API_KEY não configurada como secret no Supabase' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Testar conexão com a API do Daily.co
    const testResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${dailyApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!testResponse.ok) {
      return new Response(
        JSON.stringify({ 
          configured: false, 
          error: 'API key inválida ou sem permissões' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        configured: true, 
        message: 'Daily.co configurado corretamente' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro ao verificar configuração Daily.co:', error);
    
    return new Response(
      JSON.stringify({ 
        configured: false, 
        error: 'Erro interno ao verificar configuração' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})