import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AutoProcessResponse {
  success: boolean;
  processadas?: number;
  message?: string;
  timestamp?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Iniciando processamento automático de verificações...');

    // Verificar se verificação automática está ativa
    const { data: configData, error: configError } = await supabase
      .from('configuracoes_sistema')
      .select('verificacao_automatica_ativa')
      .single();

    if (configError) {
      console.error('Erro ao verificar configurações:', configError);
      throw new Error('Erro ao verificar configurações do sistema');
    }

    if (!configData?.verificacao_automatica_ativa) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Verificação automática não está ativa' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Processar inscrições pendentes usando a função RPC
    const { data: resultado, error: rpcError } = await supabase
      .rpc('processar_verificacao_automatica');

    if (rpcError) {
      console.error('Erro ao processar verificação automática:', rpcError);
      throw new Error('Erro ao executar processamento automático');
    }

    console.log('Resultado do processamento:', resultado);

    return new Response(
      JSON.stringify(resultado),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Erro na edge function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);