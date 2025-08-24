import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from './useClinica';

interface TeleconsultaLimits {
  limiteGratuitas: number;
  utilizadas: number;
  pacotesComprados: number;
  totalDisponivel: number;
  podecriar: boolean;
  restantes: number;
  valorPacoteAdicional: number;
  consultasPorPacote: number;
  loading: boolean;
}

export const useTeleconsultaLimits = () => {
  const { clinica } = useClinica();
  const [limits, setLimits] = useState<TeleconsultaLimits>({
    limiteGratuitas: 0,
    utilizadas: 0,
    pacotesComprados: 0,
    totalDisponivel: 0,
    podecriar: false,
    restantes: 0,
    valorPacoteAdicional: 50,
    consultasPorPacote: 10,
    loading: true
  });

  const fetchLimits = useCallback(async () => {
    if (!clinica?.id) return;

    try {
      setLimits(prev => ({ ...prev, loading: true }));

      // Demo data for single tenant
      const demoLimits = {
        limiteGratuitas: 10,
        utilizadas: 3,
        pacotesComprados: 1,
        totalDisponivel: 20,
        podecriar: true,
        restantes: 17,
        valorPacoteAdicional: 50,
        consultasPorPacote: 10,
        loading: false
      };

      setLimits(demoLimits);
    } catch (error) {
      console.error('Erro ao buscar limites de teleconsulta:', error);
      setLimits(prev => ({ ...prev, loading: false }));
    }
  }, [clinica?.id]);

  const comprarPacoteAdicional = useCallback(async () => {
    if (!clinica?.id) return false;

    try {
      // Criar preferência de pagamento no Mercado Pago
      const { data, error } = await supabase.functions.invoke('create-mercadopago-preference', {
        body: {
          clinica_id: clinica.id,
          tipo: 'pacote_teleconsulta',
          valor: limits.valorPacoteAdicional,
          titulo: `Pacote de ${limits.consultasPorPacote} teleconsultas adicionais`,
          descricao: `Pacote adicional de teleconsultas para ${clinica.nome}`
        }
      });

      if (error) {
        console.error('Erro ao criar preferência:', error);
        return false;
      }

      if (data?.init_point) {
        window.open(data.init_point, '_blank');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao comprar pacote:', error);
      return false;
    }
  }, [clinica?.id, clinica?.nome, limits.valorPacoteAdicional, limits.consultasPorPacote]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Refetch quando teleconsultas são criadas
  useEffect(() => {
    if (!clinica?.id) return;

    const channel = supabase
      .channel('teleconsultas-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'teleconsultas',
          filter: `clinica_id=eq.${clinica.id}`
        },
        () => {
          console.log('Teleconsulta alterada, atualizando limites...');
          fetchLimits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinica?.id, fetchLimits]);

  return {
    ...limits,
    refetchLimits: fetchLimits,
    comprarPacoteAdicional
  };
};