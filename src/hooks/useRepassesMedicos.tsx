import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook temporário para relatórios e gestão de repasses médicos
 * Retorna dados mockados até as clínicas operacionais estarem configuradas
 */
export const useRepassesMedicos = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calcularRepasses = async (filtros?: any) => {
    setLoading(true);
    console.log('📊 Sistema em fase de configuração - repasses médicos mockados', filtros);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    toast({
      title: "Sistema em Configuração",
      description: "Sistema de repasses médicos estará disponível após configuração das clínicas operacionais",
    });
    
    setLoading(false);
    return { 
      success: true, 
      message: 'Relatório de repasses gerado (dados demo)',
      data: {
        totalRepasses: 18500,
        repassesPendentes: 3200,
        repassesPagos: 15300,
        repassesMedicos: [
          { 
            medico: 'Dr. João Silva', 
            consultas: 65, 
            valorBruto: 9750,
            percentualRepasse: 40,
            valorRepasse: 3900,
            status: 'pago'
          },
          { 
            medico: 'Dra. Maria Santos', 
            consultas: 70, 
            valorBruto: 10500,
            percentualRepasse: 45,
            valorRepasse: 4725,
            status: 'pendente'
          },
          { 
            medico: 'Dr. Pedro Costa', 
            consultas: 50, 
            valorBruto: 7500,
            percentualRepasse: 40,
            valorRepasse: 3000,
            status: 'pago'
          }
        ]
      }
    };
  };

  const processarRepasse = async (repasseId: string) => {
    setLoading(true);
    console.log('💰 Processando repasse (mock):', repasseId);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Repasse Processado",
      description: "Repasse processado com sucesso (modo demonstração)",
    });
    
    setLoading(false);
    return { success: true };
  };

  const gerarRelatorioRepasses = async (filtros?: any) => {
    return await calcularRepasses(filtros);
  };

  // Mock data para UI
  const mockData = {
    repasses: [],
    resumo: {
      totalPendente: 3200,
      totalPago: 15300,
      percentualMedio: 42,
      totalMes: 18500,
      repassesPorMedico: [
        { 
          nome: 'Dr. João Silva', 
          totalPendente: 1200,
          totalPago: 3900,
          percentualMedio: 40
        },
        { 
          nome: 'Dra. Maria Santos', 
          totalPendente: 1500,
          totalPago: 4725,
          percentualMedio: 45
        }
      ]
    }
  };

  const marcarRepasePago = async (repasseId: string) => {
    console.log('✅ Marcando repasse como pago (mock):', repasseId);
    return { success: true };
  };

  const marcarMultiplosRepassesPagos = async (repasseIds: string[]) => {
    console.log('✅ Marcando múltiplos repasses como pagos (mock):', repasseIds);
    return { success: true };
  };

  const cancelarRepasse = async (repasseId: string) => {
    console.log('❌ Cancelando repasse (mock):', repasseId);
    return { success: true };
  };

  const fetchRepasses = async () => {
    console.log('📥 Buscando repasses (mock)');
    return { success: true, data: mockData };
  };

  return {
    calcularRepasses,
    processarRepasse,
    gerarRelatorioRepasses,
    repasses: mockData.repasses,
    resumo: mockData.resumo,
    marcarRepasePago,
    marcarMultiplosRepassesPagos,
    cancelarRepasse,
    fetchRepasses,
    loading
  };
};