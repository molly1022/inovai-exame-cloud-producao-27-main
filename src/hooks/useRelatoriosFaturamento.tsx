import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook temporário para relatórios de faturamento
 * Retorna dados mockados até as clínicas operacionais estarem configuradas
 */
export const useRelatoriosFaturamento = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calcularResumo = async () => {
    setLoading(true);
    console.log('📊 Sistema em fase de configuração - relatório de faturamento mockado');
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Sistema em Configuração",
      description: "Relatórios estarão disponíveis após configuração das clínicas operacionais",
    });
    
    setLoading(false);
    return {
      totalFaturado: 15000,
      totalPago: 12500,
      totalPendente: 2500,
      totalAgendamentos: 85,
      ticketMedio: 176.47
    };
  };

  const gerarRelatorio = async () => {
    return await calcularResumo();
  };

  return {
    calcularResumo,
    gerarRelatorio,
    loading
  };
};