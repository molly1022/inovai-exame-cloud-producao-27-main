import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook temporário para relatórios de exames
 * Retorna dados mockados até as clínicas operacionais estarem configuradas
 */
export const useRelatoriosExames = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gerarRelatorio = async () => {
    setLoading(true);
    console.log('📊 Sistema em fase de configuração - relatório de exames mockado');
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Sistema em Configuração",
      description: "Relatórios de exames estarão disponíveis após configuração das clínicas operacionais",
    });
    
    setLoading(false);
    return { 
      success: true, 
      message: 'Relatório gerado (dados demo)',
      data: {
        totalExames: 150,
        examesRealizados: 125,
        examesPendentes: 25
      }
    };
  };

  return {
    gerarRelatorio,
    loading
  };
};