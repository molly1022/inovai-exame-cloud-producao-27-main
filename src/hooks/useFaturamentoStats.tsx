
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';

interface FaturamentoStats {
  faturamentoHoje: number;
  faturamentoTotal: number;
  faturamentoAReceber: number;
}

export const useFaturamentoStats = () => {
  const [stats, setStats] = useState<FaturamentoStats>({
    faturamentoHoje: 0,
    faturamentoTotal: 0,
    faturamentoAReceber: 0
  });
  const [loading, setLoading] = useState(true);
  const { clinica } = useClinica();

  useEffect(() => {
    if (clinica?.id && clinica.id !== 'temp-id') {
      fetchFaturamentoStats();
    } else {
      setLoading(false);
    }
  }, [clinica?.id]);

  const fetchFaturamentoStats = async () => {
    if (!clinica?.id || clinica.id === 'temp-id') return;

    try {
      setLoading(true);
      
      console.log('Gerando estatísticas demo de faturamento...');
      
      // Dados demo para demonstração
      const faturamentoHoje = 2500.00;
      const faturamentoTotal = 45000.00;
      const faturamentoAReceber = 8750.00;

      setStats({
        faturamentoHoje,
        faturamentoTotal,
        faturamentoAReceber
      });

      console.log('Stats demo calculadas:', { faturamentoHoje, faturamentoTotal, faturamentoAReceber });

    } catch (error) {
      console.error('Erro ao buscar estatísticas de faturamento:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    refetch: fetchFaturamentoStats
  };
};
