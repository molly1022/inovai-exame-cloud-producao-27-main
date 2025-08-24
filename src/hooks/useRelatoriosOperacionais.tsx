import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook temporário para relatórios operacionais
 * Retorna dados mockados até as clínicas operacionais estarem configuradas
 */
export const useRelatoriosOperacionais = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gerarRelatorioOperacional = async (filtros?: any) => {
    setLoading(true);
    console.log('📊 Sistema em fase de configuração - relatório operacional mockado', filtros);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2200));
    
    toast({
      title: "Sistema em Configuração",
      description: "Relatórios operacionais estarão disponíveis após configuração das clínicas operacionais",
    });
    
    setLoading(false);
    return { 
      success: true, 
      message: 'Relatório operacional gerado (dados demo)',
      data: {
        totalConsultas: 185,
        consultasRealizadas: 165,
        consultasCanceladas: 20,
        tempoMedioConsulta: 35,
        produtividadeMedicos: [
          { medico: 'Dr. João Silva', consultas: 65, tempoMedio: 32 },
          { medico: 'Dra. Maria Santos', consultas: 70, tempoMedio: 38 },
          { medico: 'Dr. Pedro Costa', consultas: 50, tempoMedio: 35 }
        ],
        estatisticasExames: [
          { tipo: 'Ultrassonografia', quantidade: 45, media: 25 },
          { tipo: 'Ecocardiograma', quantidade: 30, media: 35 },
          { tipo: 'Raio-X', quantidade: 55, media: 15 }
        ]
      }
    };
  };

  return {
    gerarRelatorioOperacional,
    loading
  };
};