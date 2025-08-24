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
    const { agendamento_id, clinica_id } = await req.json();
    
    console.log(`Criando sala Daily.co para agendamento: ${agendamento_id}`);
    
    // Criar cliente Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se a chave API está disponível no ambiente
    const apiKey = Deno.env.get('DAILY_API_KEY');
    if (!apiKey) {
      console.error('DAILY_API_KEY não configurada');
      
      // Modo demo: criar URLs placeholders
      console.log('Executando em modo demo (sem Daily.co API)');
      const roomName = `demo-teleconsulta-${agendamento_id}`;
      const demoRoomUrl = `https://demo.daily.co/${roomName}`;
      
      const { error: updateError } = await supabaseAdmin
        .from('teleconsultas')
        .update({
          sala_id: roomName,
          url_medico: `${demoRoomUrl}?userName=Medico&userRole=moderator`,
          url_paciente: `${demoRoomUrl}?userName=Paciente&userRole=participant`,
          daily_room_name: roomName,
          status: 'demo_mode',
          updated_at: new Date().toISOString(),
        })
        .eq('agendamento_id', agendamento_id);

      if (updateError) {
        console.error('Erro ao atualizar teleconsulta em modo demo:', updateError);
      }

      return new Response(JSON.stringify({
        success: true,
        demo_mode: true,
        room: { name: roomName, url: demoRoomUrl },
        urls: {
          medico: `${demoRoomUrl}?userName=Medico&userRole=moderator`,
          paciente: `${demoRoomUrl}?userName=Paciente&userRole=participant`,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Buscar dados do agendamento para personalizar URLs
    const { data: agendamento } = await supabaseAdmin
      .from('agendamentos')
      .select(`
        *,
        pacientes!inner(nome, cpf),
        medicos!inner(nome_completo)
      `)
      .eq('id', agendamento_id)
      .single();

    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    const roomName = `teleconsulta-${agendamento_id}`;

    // Verificar se sala já existe
    const checkResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    let room;
    if (checkResponse.ok) {
      console.log('Sala já existe, reutilizando:', roomName);
      room = await checkResponse.json();
    } else {
      console.log('Criando nova sala Daily.co:', roomName);
      
      // CORREÇÃO CRÍTICA: Usar salas públicas para resolver erro de acesso
      const roomConfig = {
        name: roomName,
        privacy: 'public', // Mudança crítica: public rooms não requerem tokens
        properties: {
          max_participants: 5,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          owner_only_broadcast: false,
          exp: Math.floor(new Date(agendamento.data_agendamento).getTime() / 1000) + (4 * 60 * 60), // 4 horas após consulta
          eject_at_room_exp: true, // Ejetar usuários quando expirar
          // Configurações de segurança para salas públicas
          enable_knocking: false,
          enable_screenshare: true,
          enable_chat: true
        },
      };

      console.log('Configuração da sala:', JSON.stringify(roomConfig, null, 2));

      let dailyResponse;
      let retryCount = 0;
      const maxRetries = 3;
      
      // RETRY LOGIC: Tentar até 3 vezes se houver falha
      while (retryCount < maxRetries) {
        try {
          console.log(`Tentativa ${retryCount + 1} de criar sala Daily.co`);
          
          dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(roomConfig),
          });

          if (dailyResponse.ok) {
            console.log('✅ Sala criada com sucesso na tentativa', retryCount + 1);
            break;
          }

          const errorText = await dailyResponse.text();
          console.error(`❌ Tentativa ${retryCount + 1} falhou:`, errorText);
          
          if (retryCount === maxRetries - 1) {
            throw new Error(`Erro ao criar sala Daily.co após ${maxRetries} tentativas: ${dailyResponse.statusText} - ${errorText}`);
          }
          
          retryCount++;
          // Aguardar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          
        } catch (fetchError) {
          console.error(`❌ Erro de rede na tentativa ${retryCount + 1}:`, fetchError);
          
          if (retryCount === maxRetries - 1) {
            throw new Error(`Erro de rede ao criar sala Daily.co após ${maxRetries} tentativas: ${fetchError.message}`);
          }
          
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      room = await dailyResponse.json();
      console.log('Sala criada com sucesso:', room.name);
    }

    // CORREÇÃO: URLs melhoradas com configurações para salas públicas
    const medicoNome = agendamento.medicos.nome_completo.replace(/[^a-zA-Z0-9\s]/g, '');
    const pacienteNome = agendamento.pacientes.nome.replace(/[^a-zA-Z0-9\s]/g, '');
    
    const doctorUrl = `${room.url}?userName=Dr.${encodeURIComponent(medicoNome)}&userRole=moderator&showLeaveButton=true`;
    const patientUrl = `${room.url}?userName=${encodeURIComponent(pacienteNome)}&userRole=participant&showLeaveButton=true`;
    
    console.log('🔗 URLs geradas:', { doctorUrl, patientUrl });

    // Atualizar teleconsulta com informações da sala
    const { error: updateError } = await supabaseAdmin
      .from('teleconsultas')
      .update({
        sala_id: room.name,
        url_medico: doctorUrl,
        url_paciente: patientUrl,
        daily_room_name: room.name,
        daily_room_config: room,
        status: 'pronta',
        updated_at: new Date().toISOString(),
      })
      .eq('agendamento_id', agendamento_id);

    if (updateError) {
      console.error('Erro ao atualizar teleconsulta:', updateError);
      throw updateError;
    }

    console.log(`Teleconsulta atualizada com sucesso para agendamento ${agendamento_id}`);

    return new Response(JSON.stringify({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        url: room.url,
        created_at: room.created_at,
      },
      urls: {
        medico: doctorUrl,
        paciente: patientUrl,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao criar sala:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Erro interno do servidor'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});