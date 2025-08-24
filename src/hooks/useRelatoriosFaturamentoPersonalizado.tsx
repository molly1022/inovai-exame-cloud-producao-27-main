import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook temporário para relatórios de faturamento personalizado
 * Retorna dados mockados até as clínicas operacionais estarem configuradas
 */
export interface FiltrosFaturamentoPersonalizado {
  dataInicio?: string;
  dataFim?: string;
  medicoId?: string;
  convenioId?: string;
  statusPagamento?: string;
  incluirGraficos?: boolean;
  incluirDetalhamento?: boolean;
  agruparPor?: string;
  ordenarPor?: string;
}

export const useRelatoriosFaturamentoPersonalizado = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gerarRelatorioPersonalizado = async (filtros?: FiltrosFaturamentoPersonalizado) => {
    setLoading(true);
    console.log('📊 Sistema em fase de configuração - relatório personalizado mockado', filtros);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Sistema em Configuração",
      description: "Relatórios personalizados estarão disponíveis após configuração das clínicas operacionais",
    });
    
    setLoading(false);
    return { 
      success: true, 
      message: 'Relatório personalizado gerado (dados demo)',
      data: {
        faturamentoPorPeriodo: [
          { mes: 'Janeiro', valor: 45000 },
          { mes: 'Fevereiro', valor: 52000 },
          { mes: 'Março', valor: 48000 }
        ],
        faturamentoPorMedico: [
          { medico: 'Dr. João Silva', valor: 25000 },
          { medico: 'Dra. Maria Santos', valor: 30000 },
          { medico: 'Dr. Pedro Costa', valor: 20000 }
        ],
        faturamentoPorConvenio: [
          { convenio: 'Particular', valor: 35000 },
          { convenio: 'Unimed', valor: 25000 },
          { convenio: 'Bradesco Saúde', valor: 15000 }
        ]
      }
    };
  };

  return {
    gerarRelatorioPersonalizado,
    gerarRelatorioPDF: gerarRelatorioPersonalizado,
    dados: null,
    loading
  };
};