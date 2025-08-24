
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';

interface Patient {
  id: string;
  nome: string;
  cpf: string;
  convenio_id?: string;
}

export const usePatientSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const { clinica, tenantId } = useClinica();

  const searchPatients = useCallback(async (term: string) => {
    // Garantir isolamento correto de clínica
    const clinicaId = clinica?.id || tenantId;
    
    if (!clinicaId || !term || term.length < 2) {
      setPatients([]);
      return;
    }

    setLoading(true);
    setSearchTerm(term);

    try {
      // Demo: simular busca de pacientes
      console.log('Demo: Buscando pacientes com termo:', term);
      await new Promise(resolve => setTimeout(resolve, 300));

      const pacientesDemo: Patient[] = [
        { id: '1', nome: 'João Silva', cpf: '123.456.789-00', convenio_id: 'conv1' },
        { id: '2', nome: 'Maria Santos', cpf: '987.654.321-00', convenio_id: 'conv2' },
        { id: '3', nome: 'Ana Costa', cpf: '456.789.123-00' },
        { id: '4', nome: 'Carlos Oliveira', cpf: '789.123.456-00', convenio_id: 'conv1' },
        { id: '5', nome: 'Fernanda Lima', cpf: '321.654.987-00' }
      ];

      // Filtrar demo baseado no termo de busca
      const resultados = pacientesDemo.filter(p => 
        p.nome.toLowerCase().includes(term.toLowerCase()) ||
        p.cpf.includes(term)
      ).slice(0, 10);

      console.log(`Demo: Pacientes encontrados para clínica ${clinicaId}:`, resultados.length);
      setPatients(resultados);
    } catch (error) {
      console.error('Erro demo na busca de pacientes:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [clinica?.id, tenantId]);

  return {
    searchPatients,
    patients,
    loading
  };
};
