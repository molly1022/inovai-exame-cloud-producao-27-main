
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers para aceitar chamadas vindas do Mercado Pago
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpAccessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
      return new Response("Access token não configurado", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Recebe a notificação do Mercado Pago
    const url = new URL(req.url);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const type = url.searchParams.get("type") || body.type || "";
    const action = url.searchParams.get("action") || body.action || "";
    const dataId = url.searchParams.get("data.id") || (body.data && body.data.id) || "";

    console.log("[Webhook] type:", type, "action:", action, "id:", dataId);

    // Só processa eventos de pagamento (payment)
    if (type === "payment" && dataId) {
      // Buscar status do pagamento no Mercado Pago
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: {
          "Authorization": `Bearer ${mpAccessToken}`,
          "Content-Type": "application/json"
        },
      });
      const paymentData = await paymentRes.json();

      if (!paymentData || !paymentData.status) {
        console.error("Pagamento não encontrado no Mercado Pago", paymentData);
        return new Response("Pagamento não encontrado", { status: 400, headers: corsHeaders });
      }

      // Determinar status da assinatura
      let novoStatus = "";
      if (paymentData.status === "approved") {
        novoStatus = "ativa";
      } else if (paymentData.status === "pending") {
        novoStatus = "pendente";
      } else {
        novoStatus = "vencida";
      }

      // A referência externa contém os dados do plano
      let referenceData;
      try {
        referenceData = JSON.parse(paymentData.external_reference || "{}");
      } catch (e) {
        // Fallback para formato antigo (só clinicaId)
        referenceData = { clinicaId: paymentData.external_reference };
      }

      const { 
        clinicaId, 
        planoId, 
        periodoMeses = 1, 
        valorFinal = 250.00,
        valorOriginal = 250.00,
        percentualDesconto = 0.00,
        tipo
      } = referenceData;
      
      console.log("[Webhook] Processando:", { tipo, clinicaId, valor: valorFinal });

      if (!clinicaId) {
        console.error("clinicaId não encontrado na referência externa.");
        return new Response("Referencia externa inválida", { status: 400, headers: corsHeaders });
      }

      // Conectar ao Supabase primeiro
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.50.0");
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Credenciais do Supabase não configuradas.");
        return new Response("Supabase não configurado", { status: 500, headers: corsHeaders });
      }
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Processar pagamentos de pacotes de teleconsulta
      if (tipo === 'pacote_teleconsulta' && novoStatus === 'ativa') {
        console.log("[Webhook] Processando compra de pacote de teleconsulta");
        
        const mesReferencia = new Date().toISOString().split('T')[0].substring(0, 7) + '-01'; // YYYY-MM-01
        
        // Inserir ou atualizar uso mensal
        const { error: usoError } = await supabase
          .from('teleconsultas_uso_mensal')
          .upsert({
            clinica_id: clinicaId,
            mes_referencia: mesReferencia,
            pacotes_adicionais_comprados: 1,
            valor_total_pacotes: valorFinal
          }, {
            onConflict: 'clinica_id,mes_referencia',
            ignoreDuplicates: false
          });

        if (usoError) {
          console.error("Erro ao atualizar uso mensal de teleconsultas:", usoError);
        } else {
          console.log("[Webhook] Pacote de teleconsulta adicionado com sucesso");
        }

        return new Response("Pacote teleconsulta processado", { status: 200, headers: corsHeaders });
      }

      // Processar apenas assinaturas regulares daqui para baixo
      if (tipo === 'pacote_teleconsulta') {
        return new Response("Pacote já processado", { status: 200, headers: corsHeaders });
      }

      // Recupera assinatura existente
      const { data: assinatura, error: assinaturaErr } = await supabase
        .from("assinaturas")
        .select("*")
        .eq("clinica_id", clinicaId)
        .maybeSingle();

      if (assinaturaErr) {
        console.error("Erro ao buscar assinatura", assinaturaErr);
        return new Response("Erro ao buscar assinatura", { status: 500, headers: corsHeaders });
      }

      // Calcular data de início e próximo pagamento
      const hoje = new Date();
      const dataInicio = hoje.toISOString().split("T")[0]; // 'YYYY-MM-DD'
      
      let updatePayload: Record<string, any> = {
        status: novoStatus,
        periodo_meses: periodoMeses,
        valor: valorFinal,
        valor_original: valorOriginal,
        percentual_desconto: percentualDesconto,
        data_inicio: dataInicio,
        updated_at: new Date().toISOString(),
      };

      if (novoStatus === "ativa") {
        // Calcular dias restantes baseado no período
        const diasRestantes = periodoMeses * 30; // Aproximação
        updatePayload.dias_restantes = diasRestantes;
      }

      // Se não existe assinatura ainda, criar
      if (!assinatura) {
        const { error: insertErr } = await supabase
          .from("assinaturas")
          .insert({
            clinica_id: clinicaId,
            ...updatePayload,
            created_at: new Date().toISOString(),
          });
        if (insertErr) {
          console.error("Erro ao inserir assinatura", insertErr);
          return new Response("Erro ao salvar assinatura", { status: 500, headers: corsHeaders });
        }
        console.log("Assinatura criada para a clínica", clinicaId, "status:", novoStatus, "período:", periodoMeses, "meses");
      } else {
        // Atualizar assinatura existente
        const { error: updateErr } = await supabase
          .from("assinaturas")
          .update(updatePayload)
          .eq("clinica_id", clinicaId);
        if (updateErr) {
          console.error("Erro ao atualizar assinatura", updateErr);
          return new Response("Erro ao atualizar assinatura", { status: 500, headers: corsHeaders });
        }
        console.log("Assinatura atualizada para clínica", clinicaId, "para status:", novoStatus, "período:", periodoMeses, "meses");
      }

      return new Response("Notificação processada", { status: 200, headers: corsHeaders });
    }

    // Outros tipos
    return new Response("Evento ignorado", { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error("Erro no webhook do Mercado Pago", e);
    return new Response("Erro interno", { status: 500, headers: corsHeaders });
  }
});
