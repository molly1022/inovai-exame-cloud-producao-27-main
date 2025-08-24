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
    const { room_name } = await req.json();
    
    if (!room_name) {
      throw new Error('Nome da sala é obrigatório');
    }

    // Verificar se a chave API está disponível no ambiente
    const apiKey = Deno.env.get('DAILY_API_KEY');
    if (!apiKey) {
      console.error('DAILY_API_KEY não configurada');
      throw new Error('Daily.co API Key não configurada');
    }

    console.log('Deletando sala Daily.co:', room_name);
    
    const dailyResponse = await fetch(`https://api.daily.co/v1/rooms/${room_name}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!dailyResponse.ok) {
      if (dailyResponse.status === 404) {
        console.log('Sala não encontrada (já foi deletada):', room_name);
      } else {
        const errorText = await dailyResponse.text();
        console.error('Erro da Daily.co API:', errorText);
        throw new Error(`Erro ao deletar sala: ${dailyResponse.statusText}`);
      }
    }

    console.log('Sala deletada com sucesso:', room_name);

    return new Response(JSON.stringify({
      success: true,
      message: `Sala ${room_name} deletada com sucesso`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao deletar sala:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Erro interno do servidor'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});