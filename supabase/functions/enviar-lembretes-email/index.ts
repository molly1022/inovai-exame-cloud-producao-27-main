
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
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

    console.log("🤖 SISTEMA AUTOMÁTICO - Iniciando processamento de lembretes");

    const { teste = false, trigger = 'manual', clinica_id, timestamp } = await req.json().catch(() => ({}));
    console.log(`📋 Tipo: ${trigger}, teste=${teste}, clinica_id=${clinica_id}, timestamp=${timestamp}`);

    let totalEnviados = 0;
    let totalErros = 0;
    let clinicasProcessadas = 0;

    // Se não foi especificada uma clínica, processar TODAS as clínicas ativas
    let clinicasParaProcessar = [];
    
    if (clinica_id) {
      clinicasParaProcessar = [{ id: clinica_id }];
    } else {
      // Buscar todas as clínicas com sistema de email ativo
      const { data: clinicas, error: clinicasError } = await supabase
        .from('configuracoes_email')
        .select('clinica_id')
        .eq('ativo', true);
      
      if (clinicasError) {
        console.error('❌ Erro ao buscar clínicas:', clinicasError);
        throw clinicasError;
      }
      
      clinicasParaProcessar = clinicas?.map(c => ({ id: c.clinica_id })) || [];
    }

    console.log(`🏥 Processando ${clinicasParaProcessar.length} clínica(s)`);

    // Processar cada clínica
    for (const clinica of clinicasParaProcessar) {
      try {
        console.log(`\n🏥 === PROCESSANDO CLÍNICA: ${clinica.id} ===`);
        
        // Buscar configurações desta clínica
        const { data: configuracao, error: configError } = await supabase
          .from('configuracoes_email')
          .select('*')
          .eq('ativo', true)
          .eq('clinica_id', clinica.id)
          .single();

        if (configError || !configuracao) {
          console.log(`⚠️ Clínica ${clinica.id}: Sem configuração ativa`);
          continue;
        }

        if (teste) {
          // Enviar email de teste
          const emailTeste = configuracao.remetente_email;
          
          try {
            const templateHtml = `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
                    .container { max-width: 500px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
                    .test-badge { background: #28a745; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <span class="test-badge">🤖 TESTE AUTOMÁTICO</span>
                      <h1>🏥 Memorial Mangabeira</h1>
                      <p>Sistema Automático de Lembretes</p>
                    </div>
                    <p><strong>✅ Sistema funcionando automaticamente!</strong></p>
                    <p>Teste executado em: <strong>${new Date().toLocaleString('pt-BR')}</strong></p>
                    <p>Clínica: <strong>${clinica.id}</strong></p>
                  </div>
                </body>
              </html>
            `;

            const { error: emailError } = await resend.emails.send({
              from: `${configuracao.remetente_nome} <${configuracao.remetente_email}>`,
              to: [emailTeste],
              subject: `[TESTE AUTOMÁTICO] ${configuracao.assunto_email}`,
              html: templateHtml
            });

            if (emailError) throw emailError;

            totalEnviados++;
            console.log(`✅ Teste enviado para: ${emailTeste}`);
          } catch (error) {
            console.error(`❌ Erro no teste para ${clinica.id}:`, error);
            totalErros++;
          }
          
          continue;
        }

        // Buscar agendamentos do dia seguinte
        console.log(`🔍 Buscando agendamentos para ${clinica.id}...`);
        const { data: agendamentos, error: agendamentosError } = await supabase
          .rpc('buscar_proximos_agendamentos_dia_seguinte', {
            clinica_uuid: clinica.id
          });

        if (agendamentosError) {
          console.error(`❌ Erro ao buscar agendamentos para ${clinica.id}:`, agendamentosError);
          totalErros++;
          continue;
        }

        const qtdAgendamentos = agendamentos?.length || 0;
        console.log(`📊 Encontrados ${qtdAgendamentos} agendamentos para processar na clínica ${clinica.id}`);

        if (qtdAgendamentos === 0) {
          console.log(`✅ Clínica ${clinica.id}: Nenhum agendamento para processar hoje`);
          continue;
        }

        // Processar agendamentos desta clínica
        let enviadosClinica = 0;
        let errosClinica = 0;

        for (const agendamento of agendamentos) {
          try {
            console.log(`📧 Processando: ${agendamento.id} - ${agendamento.paciente_email}`);

            // Template default elegante se não houver personalizado
            let templateHtml = configuracao.template_personalizado || `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f0f2f5; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .header { background: #007bff; color: white; padding: 25px; text-align: center; }
      .content { padding: 30px; }
      .info-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; margin: 20px 0; border-radius: 8px; }
      .info-box h3 { margin-top: 0; color: #495057; }
      .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
      .info-row:last-child { border-bottom: none; }
      .warning-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f39c12; }
      .contact-box { background: #e3f2fd; border: 1px solid #90caf9; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
      .payment-card { background: #e8f5e8; border: 1px solid #4caf50; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 8px; }
      .payment-pending { background: #ffebee; border: 1px solid #f44336; border-left: 4px solid #f44336; }
      .money { font-weight: bold; color: #4caf50; }
      .pending-money { color: #f44336; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="margin: 0;">{clinica_nome}</h1>
        <p style="margin: 5px 0; opacity: 0.9;">Lembrete de Consulta Médica</p>
      </div>
      
      <div class="content">
        <h2 style="color: #007bff;">Olá, {paciente_nome}!</h2>
        <p>Este é um lembrete sobre sua consulta que está se aproximando. Confira todos os detalhes:</p>
        
        <div class="info-box">
          <h3>📅 Informações da Consulta</h3>
          <div class="info-row">
            <span><strong>Data:</strong></span>
            <span>{data_agendamento}</span>
          </div>
          <div class="info-row">
            <span><strong>Horário:</strong></span>
            <span>{horario}</span>
          </div>
          <div class="info-row">
            <span><strong>Tipo de Exame:</strong></span>
            <span>{tipo_exame}</span>
          </div>
          <div class="info-row">
            <span><strong>Médico:</strong></span>
            <span>{medico_nome}</span>
          </div>
          <div class="info-row">
            <span><strong>CRM:</strong></span>
            <span>{medico_crm}</span>
          </div>
          <div class="info-row">
            <span><strong>Convênio:</strong></span>
            <span>{convenio_nome}</span>
          </div>
        </div>

        {pagamento_info}

        <div class="warning-box">
          <h3>⚠️ Orientações Importantes</h3>
          <p><strong>🕐 Chegada:</strong> 15 minutos de antecedência</p>
          <p><strong>📄 Documentos:</strong> RG, CPF e carteirinha do convênio</p>
          <p><strong>⏰ Tolerância:</strong> Máximo 15 minutos de atraso</p>
          <p><strong>🚫 Atenção:</strong> Após 15 min de atraso, será marcado como falta</p>
        </div>

        <div class="contact-box">
          <h3>📞 Contato da Clínica</h3>
          <p><strong>{clinica_nome}</strong></p>
          <p>📍 {clinica_endereco}</p>
          <p>📞 {clinica_telefone}</p>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>{clinica_nome}</strong></p>
        <p>Email automático enviado em {data_envio}</p>
      </div>
    </div>
  </body>
</html>`;

            // Criar informações de convênio formatadas
            const numeroConvenioInfo = agendamento.numero_convenio && agendamento.numero_convenio !== 'N/A' 
              ? `- Nº ${agendamento.numero_convenio}` 
              : '';

            // Criar informação de pagamento condicional
            const valorExame = parseFloat(agendamento.valor_exame) || 0;
            const valorPago = parseFloat(agendamento.valor_pago) || 0;
            const valorPendente = valorExame - valorPago;
            
            let pagamentoInfo = '';
            if (agendamento.status_pagamento === 'pago' || valorPendente <= 0) {
              pagamentoInfo = `
                <div class="payment-card">
                  <h3>✅ Informações de Pagamento</h3>
                  <p><strong>Status:</strong> <span class="money">Pagamento confirmado</span></p>
                  <p><strong>Valor total:</strong> <span class="money">R$ ${valorExame.toFixed(2).replace('.', ',')}</span></p>
                  <p>✅ Sua consulta está totalmente quitada. Não é necessário levar dinheiro.</p>
                </div>
              `;
            } else if (valorExame > 0) {
              pagamentoInfo = `
                <div class="payment-card payment-pending">
                  <h3>💳 Informações de Pagamento</h3>
                  <p><strong>Status:</strong> <span class="pending-money">Pagamento pendente</span></p>
                  <p><strong>Valor total:</strong> R$ ${valorExame.toFixed(2).replace('.', ',')}</p>
                  <p><strong>Valor pago:</strong> R$ ${valorPago.toFixed(2).replace('.', ',')}</p>
                  <p><strong>Saldo pendente:</strong> <span class="pending-money">R$ ${valorPendente.toFixed(2).replace('.', ',')}</span></p>
                  <p>💡 Traga o valor pendente ou cartão para finalizar o pagamento na recepção.</p>
                </div>
              `;
            }

            // Substituir todas as variáveis no template
            templateHtml = templateHtml
              .replace(/{paciente_nome}/g, agendamento.paciente_nome || 'Paciente')
              .replace(/{nome_paciente}/g, agendamento.paciente_nome || 'Paciente')
              .replace(/{data_agendamento}/g, new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR'))
              .replace(/{data_consulta}/g, new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR'))
              .replace(/{horario}/g, agendamento.horario || 'A definir')
              .replace(/{hora_consulta}/g, agendamento.horario || 'A definir')
              .replace(/{tipo_exame}/g, agendamento.tipo_exame || 'Consulta')
              .replace(/{medico_nome}/g, agendamento.medico_nome || 'A definir')
              .replace(/{nome_medico}/g, agendamento.medico_nome || 'A definir')
              .replace(/{medico_crm}/g, agendamento.medico_crm || 'Não informado')
              .replace(/{medico_especialidade}/g, agendamento.medico_especialidade || 'Não informado')
              .replace(/{convenio_nome}/g, agendamento.convenio_nome || 'Particular')
              .replace(/{numero_convenio_info}/g, numeroConvenioInfo)
              .replace(/{clinica_nome}/g, agendamento.clinica_nome || 'Clínica')
              .replace(/{nome_clinica}/g, agendamento.clinica_nome || 'Clínica')
              .replace(/{clinica_email}/g, agendamento.clinica_email || 'contato@clinica.com')
              .replace(/{clinica_telefone}/g, agendamento.clinica_telefone || 'Não informado')
              .replace(/{clinica_endereco}/g, agendamento.clinica_endereco || 'Endereço não informado')
              .replace(/{pagamento_info}/g, pagamentoInfo)
              .replace(/{data_envio}/g, new Date().toLocaleDateString('pt-BR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }));

            // Enviar email com HTML válido
            const { error: emailError } = await resend.emails.send({
              from: `${configuracao.remetente_nome} <${configuracao.remetente_email}>`,
              to: [agendamento.paciente_email],
              subject: configuracao.assunto_email,
              html: templateHtml  // Enviar como HTML, não texto
            });

            if (emailError) throw emailError;

            // Registrar sucesso no banco
            const { error: insertError } = await supabase
              .from('email_lembretes')
              .insert({
                agendamento_id: agendamento.id,
                clinica_id: clinica.id,
                email_paciente: agendamento.paciente_email,
                status_envio: 'enviado',
                data_envio: new Date().toISOString(),
                tentativas: 1
              });

            if (insertError) {
              console.error('⚠️ Erro ao registrar envio no banco:', insertError);
            }

            enviadosClinica++;
            totalEnviados++;
            console.log(`✅ Email enviado: ${agendamento.paciente_email} (${enviadosClinica}/${qtdAgendamentos})`);

          } catch (error) {
            console.error(`❌ Erro ao enviar para ${agendamento.paciente_email}:`, error);
            
            // Registrar erro no banco
            try {
              await supabase.from('email_lembretes').insert({
                agendamento_id: agendamento.id,
                clinica_id: clinica.id,
                email_paciente: agendamento.paciente_email,
                status_envio: 'erro',
                erro_envio: error.message,
                tentativas: 1
              });
            } catch (dbError) {
              console.error('❌ Erro ao registrar falha no banco:', dbError);
            }
            
            errosClinica++;
            totalErros++;
          }
        }

        console.log(`🏥 Clínica ${clinica.id} concluída: ${enviadosClinica} enviados, ${errosClinica} erros`);
        clinicasProcessadas++;

      } catch (error) {
        console.error(`💥 Erro ao processar clínica ${clinica.id}:`, error);
        totalErros++;
      }
    }

    const resultado = {
      success: true,
      trigger,
      teste,
      totalEnviados,
      totalErros,
      clinicasProcessadas,
      message: teste 
        ? `Teste automático concluído: ${totalEnviados} email(s) de teste enviado(s)`
        : `Processamento automático concluído: ${totalEnviados} lembretes enviados para ${clinicasProcessadas} clínica(s)`,
      timestamp: new Date().toISOString()
    };

    console.log(`🎯 RESULTADO FINAL:`, resultado);

    return new Response(
      JSON.stringify(resultado),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("💥 Erro geral na função:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);
