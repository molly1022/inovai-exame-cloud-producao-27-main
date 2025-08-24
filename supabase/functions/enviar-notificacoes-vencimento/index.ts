import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar clientes
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

    console.log('Iniciando verificação de vencimentos...');

    // Buscar clínicas com vencimento próximo
    const { data: clinicasVencimento, error: vencimentoError } = await supabase
      .rpc('obter_clinicas_vencimento');

    if (vencimentoError) {
      console.error('Erro ao buscar vencimentos:', vencimentoError);
      throw new Error('Erro ao buscar clínicas com vencimento próximo');
    }

    let notificacoesEnviadas = 0;
    const resultados = [];

    for (const clinica of (clinicasVencimento || [])) {
      try {
        const diasRestantes = clinica.dias_restantes;
        let tipoNotificacao = '';
        
        // Determinar tipo de notificação baseado nos dias restantes
        if (diasRestantes <= 0) {
          tipoNotificacao = 'vencido';
        } else if (diasRestantes === 1) {
          tipoNotificacao = '1_dia';
        } else if (diasRestantes === 3) {
          tipoNotificacao = '3_dias';
        } else if (diasRestantes === 7) {
          tipoNotificacao = '7_dias';
        } else {
          continue; // Pular se não é um ponto de notificação
        }

        // Verificar se já foi enviada notificação deste tipo para esta clínica hoje
        const { data: notificacaoExistente } = await supabase
          .from('notificacoes_pagamento')
          .select('id')
          .eq('clinica_id', clinica.clinica_id)
          .eq('tipo_notificacao', tipoNotificacao)
          .eq('data_vencimento', clinica.data_vencimento)
          .eq('status_envio', 'enviado')
          .single();

        if (notificacaoExistente) {
          console.log(`Notificação ${tipoNotificacao} já enviada para ${clinica.nome_clinica}`);
          continue;
        }

        // Preparar conteúdo do email
        let assunto = '';
        let conteudo = '';
        
        switch (tipoNotificacao) {
          case '7_dias':
            assunto = '🔔 Sua assinatura vence em 7 dias';
            conteudo = `
              <h2>Olá, ${clinica.nome_clinica}!</h2>
              <p>Sua assinatura do sistema de gestão clínica vence em <strong>7 dias</strong> (${new Date(clinica.data_vencimento).toLocaleDateString('pt-BR')}).</p>
              <p>Para manter seu acesso ativo, renove sua assinatura o quanto antes.</p>
              <p><strong>Valor:</strong> R$ ${Number(clinica.valor_assinatura).toFixed(2)}</p>
              <p>Entre em contato conosco para renovar!</p>
            `;
            break;
          case '3_dias':
            assunto = '⚠️ URGENTE: Sua assinatura vence em 3 dias';
            conteudo = `
              <h2>Atenção, ${clinica.nome_clinica}!</h2>
              <p>Sua assinatura vence em apenas <strong style="color: red;">3 dias</strong> (${new Date(clinica.data_vencimento).toLocaleDateString('pt-BR')}).</p>
              <p>Para evitar a suspensão do serviço, renove sua assinatura imediatamente.</p>
              <p><strong>Valor:</strong> R$ ${Number(clinica.valor_assinatura).toFixed(2)}</p>
              <p>Entre em contato urgentemente!</p>
            `;
            break;
          case '1_dia':
            assunto = '🚨 ÚLTIMA CHANCE: Sua assinatura vence AMANHÃ';
            conteudo = `
              <h2>ÚLTIMA CHANCE, ${clinica.nome_clinica}!</h2>
              <p>Sua assinatura vence <strong style="color: red;">AMANHÃ</strong> (${new Date(clinica.data_vencimento).toLocaleDateString('pt-BR')}).</p>
              <p>Seu acesso será suspenso se o pagamento não for processado hoje.</p>
              <p><strong>Valor:</strong> R$ ${Number(clinica.valor_assinatura).toFixed(2)}</p>
              <p>AÇÃO URGENTE NECESSÁRIA!</p>
            `;
            break;
          case 'vencido':
            assunto = '❌ ACESSO SUSPENSO: Assinatura vencida';
            conteudo = `
              <h2>Acesso Suspenso - ${clinica.nome_clinica}</h2>
              <p>Sua assinatura venceu em ${new Date(clinica.data_vencimento).toLocaleDateString('pt-BR')}.</p>
              <p>Seu acesso ao sistema foi suspenso temporariamente.</p>
              <p>Para reativar, entre em contato e efetue o pagamento de R$ ${Number(clinica.valor_assinatura).toFixed(2)}</p>
            `;
            break;
        }

        // Registrar tentativa de notificação
        const { data: notificacaoRecord, error: insertError } = await supabase
          .from('notificacoes_pagamento')
          .insert([{
            clinica_id: clinica.clinica_id,
            tipo_notificacao: tipoNotificacao,
            data_vencimento: clinica.data_vencimento,
            status_envio: 'pendente'
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar registro de notificação:', insertError);
          continue;
        }

        // Enviar email
        const emailResponse = await resend.emails.send({
          from: 'Sistema Clínica <noreply@clinica.com>',
          to: [clinica.email_clinica],
          subject: assunto,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${conteudo}
              <hr style="margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">
                Esta é uma notificação automática do sistema. Não responda este email.
              </p>
            </div>
          `,
        });

        if (emailResponse.error) {
          // Marcar como erro
          await supabase
            .from('notificacoes_pagamento')
            .update({ 
              status_envio: 'erro',
              ultimo_erro: emailResponse.error.message,
              tentativas: 1
            })
            .eq('id', notificacaoRecord.id);

          console.error(`Erro ao enviar email para ${clinica.nome_clinica}:`, emailResponse.error);
        } else {
          // Marcar como enviado
          await supabase
            .from('notificacoes_pagamento')
            .update({ status_envio: 'enviado' })
            .eq('id', notificacaoRecord.id);

          notificacoesEnviadas++;
          console.log(`Notificação ${tipoNotificacao} enviada para ${clinica.nome_clinica}`);
        }

        resultados.push({
          clinica: clinica.nome_clinica,
          tipo: tipoNotificacao,
          status: emailResponse.error ? 'erro' : 'enviado'
        });

      } catch (error) {
        console.error(`Erro ao processar ${clinica.nome_clinica}:`, error);
        resultados.push({
          clinica: clinica.nome_clinica,
          tipo: 'erro',
          status: 'erro',
          erro: error.message
        });
      }
    }

    console.log(`Processamento concluído. ${notificacoesEnviadas} notificações enviadas.`);

    return new Response(
      JSON.stringify({
        success: true,
        notificacoes_enviadas: notificacoesEnviadas,
        total_processadas: (clinicasVencimento || []).length,
        resultados: resultados,
        timestamp: new Date().toISOString()
      }),
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