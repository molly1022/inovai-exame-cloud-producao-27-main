import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook temporário para controle de acesso de teleconsultas
 * Simula verificação de permissões até as clínicas operacionais estarem configuradas
 */
export const useTeleconsultaAccess = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const verificarAcesso = async (agendamentoId: string, tipoUsuario: 'medico' | 'paciente') => {
    setLoading(true);
    console.log('🔐 Verificando acesso teleconsulta (mock):', agendamentoId, tipoUsuario);
    
    // Simular verificação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular permissão válida na maioria das vezes
    const temPermissao = Math.random() > 0.2;
    
    setLoading(false);
    
    if (!temPermissao) {
      toast({
        title: "Acesso negado",
        description: "Não foi possível verificar permissões para esta teleconsulta",
        variant: "destructive"
      });
      return { success: false, canAccess: false };
    }

    return {
      success: true,
      canAccess: true,
      agendamento: {
        id: agendamentoId,
        data_agendamento: new Date().toISOString(),
        eh_telemedicina: true,
        status: 'agendado',
        medico: { nome_completo: 'Dr. João Silva' },
        paciente: { nome: 'Maria da Silva' }
      }
    };
  };

  const iniciarTeleconsulta = async (agendamentoId: string) => {
    setLoading(true);
    console.log('🎥 Iniciando teleconsulta (mock):', agendamentoId);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Teleconsulta iniciada",
      description: "Teleconsulta iniciada com sucesso (modo demonstração)",
    });
    
    setLoading(false);
    return { success: true, roomUrl: 'https://exemplo-teleconsulta.com/room/123' };
  };

  return {
    verificarAcesso,
    iniciarTeleconsulta,
    loading
  };
};