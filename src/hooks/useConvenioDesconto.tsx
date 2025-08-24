
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useConvenioDesconto = () => {
  const [conveniosDesconto, setConveniosDesconto] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const buscarPercentualDesconto = useCallback(async (convenioId: string): Promise<number> => {
    if (!convenioId) return 0;
    
    // Se já temos o desconto em cache, retornar
    if (conveniosDesconto[convenioId] !== undefined) {
      return conveniosDesconto[convenioId];
    }

    try {
      setLoading(true);
      
      // Retorna desconto demo para demonstração
      const descontoDemo = 10; // 10% de desconto padrão para demonstração
      
      // Armazenar no cache
      setConveniosDesconto(prev => ({
        ...prev,
        [convenioId]: descontoDemo
      }));

      return descontoDemo;
    } catch (error) {
      console.error('Erro ao buscar percentual de desconto:', error);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [conveniosDesconto]);

  const calcularValorComDesconto = useCallback((valorOriginal: number, percentualDesconto: number): number => {
    if (!valorOriginal || !percentualDesconto) return valorOriginal;
    
    const desconto = (valorOriginal * percentualDesconto) / 100;
    return valorOriginal - desconto;
  }, []);

  const calcularDesconto = useCallback((valorOriginal: number, percentualDesconto: number): number => {
    if (!valorOriginal || !percentualDesconto) return 0;
    
    return (valorOriginal * percentualDesconto) / 100;
  }, []);

  return {
    buscarPercentualDesconto,
    calcularValorComDesconto,
    calcularDesconto,
    loading
  };
};
