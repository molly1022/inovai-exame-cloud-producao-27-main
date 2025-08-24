
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useTenantId } from '@/hooks/useTenantId';

interface Convenio {
  id: string;
  nome: string;
  cor: string;
}

export const useConvenios = () => {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConvenios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando convênios...');
      
      // Dados demo para demonstração
      const conveniosDemo = [
        { id: '1', nome: 'SUS', cor: '#22c55e' },
        { id: '2', nome: 'Unimed', cor: '#3b82f6' },
        { id: '3', nome: 'Bradesco Saúde', cor: '#ef4444' },
        { id: '4', nome: 'Particular', cor: '#8b5cf6' }
      ];
      
      console.log('Convênios demo carregados:', conveniosDemo.length);
      setConvenios(conveniosDemo);
      
      toast({
        title: "Demonstração",
        description: "Exibindo dados de convênios de demonstração.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Erro ao buscar convênios:', error);
      setError(error.message);
      setConvenios([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConvenios();
  }, [fetchConvenios]);

  const refetch = useCallback(() => {
    fetchConvenios();
  }, [fetchConvenios]);

  return {
    convenios,
    loading,
    error,
    refetch
  };
};
