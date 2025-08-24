import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se o email existe no sistema
    const { data: clinica, error: clinicaError } = await supabase
      .from('clinicas')
      .select('id, nome')
      .eq('email', email)
      .single();

    if (clinicaError || !clinica) {
      return new Response(
        JSON.stringify({ error: "Email não encontrado no sistema" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEm = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Salvar código no banco
    const { error: saveError } = await supabase
      .from('codigos_recuperacao')
      .insert({
        clinica_id: clinica.id,
        email: email,
        codigo: codigo,
        expira_em: expiraEm.toISOString(),
        usado: false
      });

    if (saveError) {
      console.error('Erro ao salvar código:', saveError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enviar email com código
    const emailResponse = await resend.emails.send({
      from: "Unovai Exame Cloud <noreply@unovai.com>",
      to: [email],
      subject: "Código de Recuperação de Senha",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Unovai Exame Cloud</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin-top: 0;">Recuperação de Senha</h2>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Olá, <strong>${clinica.nome}</strong>!
            </p>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Você solicitou a recuperação da senha da sua clínica. Use o código abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px; display: inline-block;">
                ${codigo}
              </div>
            </div>
            
            <p style="color: #ef4444; font-weight: 600; text-align: center;">
              ⏰ Este código expira em 15 minutos
            </p>
          </div>
          
          <div style="color: #64748b; font-size: 14px; line-height: 1.6;">
            <p><strong>Importante:</strong></p>
            <ul>
              <li>Este código é válido apenas uma vez</li>
              <li>Não compartilhe este código com ninguém</li>
              <li>Se você não solicitou esta recuperação, ignore este email</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
            © ${new Date().getFullYear()} Unovai Exame Cloud - Sistema de Gestão de Clínicas
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Erro ao enviar email:', emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('✅ Código de recuperação enviado para:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Código enviado com sucesso",
        expira_em: expiraEm.toISOString()
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