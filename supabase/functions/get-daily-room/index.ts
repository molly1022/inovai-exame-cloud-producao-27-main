import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { room_name } = await req.json();

    if (!room_name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nome da sala é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se a chave API está disponível no ambiente
    const apiKey = Deno.env.get('DAILY_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Daily.co API Key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar sala via Daily.co API
    const dailyResponse = await fetch(`https://api.daily.co/v1/rooms/${room_name}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!dailyResponse.ok) {
      if (dailyResponse.status === 404) {
        return new Response(
          JSON.stringify({ success: false, error: 'Sala não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorData = await dailyResponse.text();
      console.error('Erro ao buscar sala Daily.co:', errorData);
      throw new Error(`Falha na Daily.co API: ${dailyResponse.status}`);
    }

    const roomData = await dailyResponse.json();
    
    return new Response(
      JSON.stringify(roomData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao buscar sala Daily.co:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})