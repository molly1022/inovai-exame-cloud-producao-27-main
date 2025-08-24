import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook temporário para relatórios de pacientes
 * Retorna dados mockados até as clínicas operacionais estarem configuradas
 */
export const useRelatoriosPacientes = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gerarRelatorioPacientes = async (filtros?: any) => {
    setLoading(true);
    console.log('📊 Sistema em fase de configuração - relatório de pacientes mockado', filtros);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1600));
    
    toast({
      title: "Sistema em Configuração",
      description: "Relatórios de pacientes estarão disponíveis após configuração das clínicas operacionais",
    });
    
    setLoading(false);
    return { 
      success: true, 
      message: 'Relatório de pacientes gerado (dados demo)',
      data: {
        totalPacientes: 450,
        novosPacientes: 85,
        pacientesAtivos: 380,
        pacientesInativos: 70,
        distribuicaoPorIdade: [
          { faixaEtaria: '0-18', quantidade: 95 },
          { faixaEtaria: '19-35', quantidade: 140 },
          { faixaEtaria: '36-60', quantidade: 155 },
          { faixaEtaria: '60+', quantidade: 60 }
        ],
        distribuicaoPorConvenio: [
          { convenio: 'Particular', quantidade: 180 },
          { convenio: 'Unimed', quantidade: 150 },
          { convenio: 'Bradesco Saúde', quantidade: 120 }
        ]
      }
    };
  };

  return {
    gerarRelatorioPacientes,
    loading
  };
};