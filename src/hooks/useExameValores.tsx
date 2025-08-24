
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExameValor {
  id: string;
  tipo_exame: string;
  valor: number;
  descricao?: string;
}

export const useExameValores = () => {
  const [valores, setValores] = useState<ExameValor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchValores = async () => {
    try {
      // Dados demo para demonstração
      const valoresDemo: ExameValor[] = [
        { id: '1', tipo_exame: 'Consulta', valor: 150.00, descricao: 'Consulta médica padrão' },
        { id: '2', tipo_exame: 'Exame de Sangue', valor: 80.00, descricao: 'Exame laboratorial básico' },
        { id: '3', tipo_exame: 'Raio-X', valor: 120.00, descricao: 'Exame de imagem simples' },
        { id: '4', tipo_exame: 'Ultrassom', valor: 200.00, descricao: 'Ultrassonografia' },
        { id: '5', tipo_exame: 'ECG', valor: 60.00, descricao: 'Eletrocardiograma' }
      ];
      
      console.log('Valores de exames demo carregados:', valoresDemo.length);
      setValores(valoresDemo);
    } catch (error) {
      console.error('Erro demo ao buscar valores dos exames:', error);
      setValores([]);
    } finally {
      setLoading(false);
    }
  };

  const getValorPorTipo = (tipoExame: string): number => {
    const exameValor = valores.find(v => v.tipo_exame === tipoExame);
    return exameValor?.valor || 0;
  };

  useEffect(() => {
    fetchValores();
  }, []);

  // Demo: não configurar realtime

  return {
    valores,
    loading,
    getValorPorTipo,
    refetch: fetchValores
  };
};
