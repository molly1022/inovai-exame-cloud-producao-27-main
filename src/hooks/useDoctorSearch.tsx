import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';

interface Doctor {
  id: string;
  nome_completo: string;
  crm?: string;
  coren?: string;
  especialidade?: string;
}

export const useDoctorSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const { clinicaId, isValid } = useTenantId();

  const searchDoctors = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setDoctors([]);
      return;
    }

    setLoading(true);
    setSearchTerm(term);

    try {
      // Dados demo para demonstração
      const doctorsDemo: Doctor[] = [
        {
          id: '1',
          nome_completo: 'Dr. João Silva',
          especialidade: 'Cardiologia',
          crm: '12345-SP'
        },
        {
          id: '2',
          nome_completo: 'Dra. Maria Santos',
          especialidade: 'Pediatria',
          crm: '67890-SP'
        },
        {
          id: '3',
          nome_completo: 'Dr. Pedro Costa',
          especialidade: 'Ortopedia',
          crm: '54321-SP'
        },
        {
          id: '4',
          nome_completo: 'Dra. Ana Oliveira',
          especialidade: 'Ginecologia',
          crm: '98765-SP'
        }
      ];

      // Filtrar por termo de busca
      const filteredDoctors = doctorsDemo.filter(doctor =>
        doctor.nome_completo.toLowerCase().includes(term.toLowerCase()) ||
        doctor.especialidade?.toLowerCase().includes(term.toLowerCase()) ||
        doctor.crm?.toLowerCase().includes(term.toLowerCase())
      );

      setDoctors(filteredDoctors);
    } catch (error) {
      console.error('Erro na busca de médicos:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [isValid, clinicaId]);

  return {
    searchDoctors,
    doctors: doctors || [],
    loading
  };
};