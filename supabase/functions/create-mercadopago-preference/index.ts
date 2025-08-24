
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
    const { 
      clinicaId, 
      clinicaNome, 
      clinicaEmail, 
      planoId,
      periodoMeses,
      valorFinal,
      valorOriginal,
      percentualDesconto,
      tipo,
      quantidade
    } = body;

    console.log('Dados recebidos:', { 
      clinicaId, 
      clinicaNome, 
      clinicaEmail, 
      planoId, 
      periodoMeses, 
      valorFinal,
      valorOriginal,
      percentualDesconto,
      tipo,
      quantidade
    });

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

    console.log('Access Token encontrado, criando preferência...');

    // Determinar se é plano ou pacote de teleconsulta
    const isPacoteTeleconsulta = tipo === 'pacote_teleconsulta';
    const amount = parseFloat(valorFinal) || (isPacoteTeleconsulta ? 50.00 : 250.00);
    
    let title, description, itemId;
    
    if (isPacoteTeleconsulta) {
      const qtd = quantidade || 10;
      title = `MedSys Pro - Pacote de ${qtd} Teleconsultas`;
      description = `Pacote adicional de ${qtd} teleconsultas para ${clinicaNome || 'Clínica'}`;
      itemId = `pacote-teleconsulta-${qtd}`;
    } else {
      const planDescription = periodoMeses === 1 ? "Mensal" : 
                            periodoMeses === 6 ? "6 Meses" : 
                            periodoMeses === 12 ? "Anual" : `${periodoMeses} Meses`;
      title = `MedSys Pro - Plano ${planDescription}`;
      description = `Acesso completo ao sistema de gestão clínica - ${clinicaNome || 'Clínica'} - ${planDescription}`;
      itemId = `assinatura-medsyspro-${periodoMeses}m`;
    }
    
    const payerEmail = clinicaEmail || "assinatura@medsyspro.com";
    const originUrl = req.headers.get("origin") || "https://medsyspro.com";
    
    const successUrl = isPacoteTeleconsulta ? 
      `${originUrl}/telemedicina?success=true` : 
      `${originUrl}/dashboard/pagamentos?success=true`;
    const failureUrl = isPacoteTeleconsulta ? 
      `${originUrl}/telemedicina?failure=true` : 
      `${originUrl}/dashboard/pagamentos?failure=true`;
    const pendingUrl = isPacoteTeleconsulta ? 
      `${originUrl}/telemedicina?pending=true` : 
      `${originUrl}/dashboard/pagamentos?pending=true`;

    // Criação da preferência via API Mercado Pago
    const preferencePayload = {
      items: [
        {
          id: itemId,
          title,
          description,
          quantity: 1,
          currency_id: "BRL",
          unit_price: amount,
        },
      ],
      payer: {
        email: payerEmail,
        name: clinicaNome || "Clínica"
      },
      external_reference: JSON.stringify({
        clinicaId,
        planoId,
        periodoMeses,
        valorFinal,
        valorOriginal,
        percentualDesconto,
        tipo,
        quantidade
      }),
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
      },
      auto_return: "approved",
      notification_url: `https://sxtqlnayloetwlcjtkbj.supabase.co/functions/v1/mercadopago-webhook`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };

    console.log('Enviando preferência para Mercado Pago...');

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    const mpData = await mpResponse.json();
    console.log('Resposta do Mercado Pago:', mpData);

    if (!mpResponse.ok) {
      console.error('Erro na API do Mercado Pago:', mpData);
      return new Response(JSON.stringify({ 
        error: "Erro ao criar preferência no Mercado Pago", 
        details: mpData 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!mpData.init_point) {
      console.error('URL de pagamento não gerada:', mpData);
      return new Response(JSON.stringify({ 
        error: "URL de pagamento não foi gerada pelo Mercado Pago" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log('Preferência criada com sucesso:', mpData.init_point);

    return new Response(JSON.stringify({ 
      url: mpData.init_point,
      preference_id: mpData.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Erro interno do servidor" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
