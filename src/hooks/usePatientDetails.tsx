
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PatientDetails {
  id: string;
  nome: string;
  cpf: string;
  convenio_id?: string;
  numero_convenio?: string;
}

export const usePatientDetails = () => {
  const [loading, setLoading] = useState(false);

  const fetchPatientDetails = useCallback(async (patientId: string): Promise<PatientDetails | null> => {
    if (!patientId) return null;

    setLoading(true);
    try {
      // Demo: simular busca de detalhes do paciente
      console.log('Demo: Buscando detalhes do paciente:', patientId);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const pacienteDemo: PatientDetails = {
        id: patientId,
        nome: 'João Silva',
        cpf: '12345678901',
        convenio_id: 'conv_123',
        numero_convenio: '123456789'
      };

      console.log('Demo: Detalhes do paciente carregados:', pacienteDemo);
      return pacienteDemo;
    } catch (error) {
      console.error('Erro demo ao buscar paciente:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchPatientDetails,
    loading
  };
};
