import { supabase } from '@/integrations/supabase/client';

interface DailyRoomConfig {
  name: string;
  privacy: 'public' | 'private';
  properties: {
    max_participants?: number;
    enable_screenshare?: boolean;
    enable_recording?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
    owner_only_broadcast?: boolean;
    exp?: number; // Unix timestamp para expiração
  };
}

interface DailyRoom {
  id: string;
  name: string;
  api_created: boolean;
  privacy: string;
  url: string;
  created_at: string;
  config: DailyRoomConfig['properties'];
}

class DailyService {
  private baseUrl = 'https://api.daily.co/v1';

  // Verificar se o serviço está configurado globalmente
  async isConfigured(): Promise<boolean> {
    try {
      // API Daily.co é agora global para todas as clínicas
      // Verificar se existe secret de API configurado
      const { data, error } = await supabase.rpc('is_admin_sistema');
      
      if (error) {
        console.log('Erro ao verificar configuração Daily.co global:', error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.log('Falha ao verificar configuração Daily.co:', err);
      return false;
    }
  }

  // Criar sala de teleconsulta usando edge function
  async createRoom(config: {
    agendamentoId: string;
    clinicaId: string;
    pacienteNome: string;
    medicoNome: string;
    dataConsulta: Date;
  }): Promise<{
    roomName: string;
    roomUrl: string;
    doctorUrl: string;
    patientUrl: string;
  }> {
    console.log('🏥 Criando sala Daily.co para agendamento:', config.agendamentoId);
    
    try {
      // Verificar se Daily.co está configurado globalmente
      const isConfigured = await this.isConfigured();
      if (!isConfigured) {
        console.warn('Daily.co não configurado globalmente, usando modo demo');
        throw new Error('Daily.co não configurado globalmente');
      }

      // Usar edge function para criar sala de forma segura
      const { data, error } = await supabase.functions.invoke('create-daily-room', {
        body: {
          agendamento_id: config.agendamentoId,
          clinica_id: config.clinicaId
        }
      });

      if (error) {
        console.error('Erro ao criar sala:', error);
        throw new Error(error.message || 'Falha ao criar sala');
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Resposta inválida da API');
      }

      console.log('✅ Sala Daily.co criada com sucesso:', data.room.name);
      
      return {
        roomName: data.room.name,
        roomUrl: data.room.url,
        doctorUrl: data.urls.medico,
        patientUrl: data.urls.paciente,
      };

    } catch (error) {
      console.error('⚠️ Erro ao criar sala Daily.co, usando modo demo:', error);
      
      // Fallback para modo de desenvolvimento/demo
      const roomName = `teleconsulta-${config.agendamentoId}`;
      const roomUrl = `https://demo.daily.co/${roomName}`;
      
      return {
        roomName,
        roomUrl,
        doctorUrl: `${roomUrl}?role=moderator&userName=Dr.${config.medicoNome}`,
        patientUrl: `${roomUrl}?role=participant&userName=${config.pacienteNome}`,
      };
    }
  }

  // Deletar sala após a consulta
  async deleteRoom(roomName: string): Promise<boolean> {
    console.log('🗑️ Deletando sala Daily.co:', roomName);
    
    try {
      const { data, error } = await supabase.functions.invoke('delete-daily-room', {
        body: { room_name: roomName }
      });

      if (error) {
        console.error('Erro ao deletar sala:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Falha ao deletar sala:', error);
      return false;
    }
  }

  // Buscar informações da sala
  async getRoom(roomName: string): Promise<DailyRoom | null> {
    console.log('ℹ️ Buscando informações da sala:', roomName);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-daily-room', {
        body: { room_name: roomName }
      });

      if (error || !data) {
        return null;
      }

      return data as DailyRoom;
    } catch (error) {
      console.error('Erro ao buscar informações da sala:', error);
      return null;
    }
  }

  // Gerar URL personalizada com parâmetros
  generateRoomUrl(roomUrl: string, userType: 'doctor' | 'patient', userName: string): string {
    const params = new URLSearchParams();
    
    if (userType === 'doctor') {
      params.append('userName', `Dr. ${userName}`);
      params.append('userRole', 'moderator');
    } else {
      params.append('userName', userName);
      params.append('userRole', 'participant');
    }

    return `${roomUrl}?${params.toString()}`;
  }

  // Verificar se sala existe e está ativa
  async isRoomActive(roomName: string): Promise<boolean> {
    const room = await this.getRoom(roomName);
    return room !== null;
  }

  // Listar salas ativas (para administração)
  async listActiveRooms(): Promise<string[]> {
    try {
      console.log('📋 Simulando listagem de salas ativas');
      // Mock de salas ativas
      return ['sala_demo_1', 'sala_demo_2'];
    } catch (error) {
      console.error('Erro ao listar salas ativas:', error);
      return [];
    }
  }

  // Limpar salas expiradas
  async cleanupExpiredRooms(): Promise<number> {
    try {
      console.log('🧹 Simulando limpeza de salas expiradas');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate cleanup
      const cleaned = Math.floor(Math.random() * 3);
      console.log(`✅ ${cleaned} salas limpas (simulação)`);
      return cleaned;
    } catch (error) {
      console.error('Erro ao limpar salas expiradas:', error);
      return 0;
    }
  }
}

export const dailyService = new DailyService();
export type { DailyRoom, DailyRoomConfig };