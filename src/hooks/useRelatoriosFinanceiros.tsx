import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook temporário para relatórios financeiros
 * Retorna dados mockados até as clínicas operacionais estarem configuradas
 */
export const useRelatoriosFinanceiros = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gerarRelatorioFinanceiro = async (filtros?: any) => {
    setLoading(true);
    console.log('📊 Sistema em fase de configuração - relatório financeiro mockado', filtros);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    toast({
      title: "Sistema em Configuração",
      description: "Relatórios financeiros estarão disponíveis após configuração das clínicas operacionais",
    });
    
    setLoading(false);
    return { 
      success: true, 
      message: 'Relatório financeiro gerado (dados demo)',
      data: {
        receitas: 75000,
        despesas: 45000,
        lucro: 30000,
        margemLucro: 40,
        fluxoCaixa: [
          { mes: 'Janeiro', entrada: 25000, saida: 15000 },
          { mes: 'Fevereiro', entrada: 30000, saida: 18000 },
          { mes: 'Março', entrada: 28000, saida: 16000 }
        ]
      }
    };
  };

  return {
    gerarRelatorioFinanceiro,
    dados: null,
    loading
  };
};