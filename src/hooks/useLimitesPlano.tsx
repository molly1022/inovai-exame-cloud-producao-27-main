
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from './useClinica';

interface LimitesPlano {
  limiteFuncionarios: number;
  limiteMedicos: number;
  funcionariosAtivos: number;
  medicosAtivos: number;
  podeCriarFuncionario: boolean;
  podeCriarMedico: boolean;
  tipoPlano: string;
  loading: boolean;
}

export const useLimitesPlano = (): LimitesPlano & { refetchLimites: () => Promise<void> } => {
  const { clinica } = useClinica();
  const [limites, setLimites] = useState<LimitesPlano>({
    limiteFuncionarios: 4,
    limiteMedicos: 10,
    funcionariosAtivos: 2, // Demo
    medicosAtivos: 3, // Demo
    podeCriarFuncionario: true,
    podeCriarMedico: true,
    tipoPlano: 'avancado_medico', // Demo
    loading: true
  });

  // Ref para evitar multiple calls simultâneas
  const fetchingRef = useRef(false);

  const fetchLimites = useCallback(async () => {
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      setLimites(prev => ({ ...prev, loading: true }));
      
      // Demo: dados simulados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const limiteFuncionarios = 10;
      const limiteMedicos = 50; // Plano avançado
      const funcionariosAtivos = 2;
      const medicosAtivos = 3;

      setLimites({
        limiteFuncionarios,
        limiteMedicos,
        funcionariosAtivos,
        medicosAtivos,
        podeCriarFuncionario: funcionariosAtivos < limiteFuncionarios,
        podeCriarMedico: medicosAtivos < limiteMedicos,
        tipoPlano: 'avancado_medico',
        loading: false
      });

      console.log('Limites demo atualizados:', {
        funcionariosAtivos,
        limiteFuncionarios,
        medicosAtivos,
        limiteMedicos,
        podeCriarFuncionario: funcionariosAtivos < limiteFuncionarios,
        podeCriarMedico: medicosAtivos < limiteMedicos
      });

    } catch (error) {
      console.error('Erro demo ao buscar limites do plano:', error);
      setLimites(prev => ({ ...prev, loading: false }));
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchLimites();
  }, [fetchLimites]);

  // Demo: não configurar real-time updates

  return {
    ...limites,
    refetchLimites: fetchLimites
  };
};
