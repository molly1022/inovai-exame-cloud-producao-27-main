import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email, codigo, nova_senha } = await req.json();

    if (!email || !codigo || !nova_senha) {
      return new Response(
        JSON.stringify({ error: "Email, código e nova senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar código
    const { data: codigoData, error: codigoError } = await supabase
      .from('codigos_recuperacao')
      .select('*')
      .eq('email', email)
      .eq('codigo', codigo)
      .eq('usado', false)
      .gte('expira_em', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (codigoError || !codigoData) {
      return new Response(
        JSON.stringify({ error: "Código inválido ou expirado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar clínica
    const { data: clinica, error: clinicaError } = await supabase
      .from('clinicas')
      .select('id')
      .eq('id', codigoData.clinica_id)
      .single();

    if (clinicaError || !clinica) {
      return new Response(
        JSON.stringify({ error: "Clínica não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Atualizar senha
    const { error: updateError } = await supabase
      .from('configuracoes_clinica')
      .update({ senha_acesso_clinica: nova_senha })
      .eq('clinica_id', clinica.id);

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return new Response(
        JSON.stringify({ error: "Erro ao atualizar senha" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Marcar código como usado
    await supabase
      .from('codigos_recuperacao')
      .update({ usado: true })
      .eq('id', codigoData.id);

    console.log('✅ Senha atualizada com sucesso para clínica:', clinica.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Senha atualizada com sucesso" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);