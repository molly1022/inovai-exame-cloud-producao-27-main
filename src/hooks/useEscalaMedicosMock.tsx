import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MedicoEscala {
  id: string;
  nome: string;
  especialidade: string;
  telefone: string;
  email: string;
}

interface MedicoIndisponibilidade {
  id: string;
  medico_id: string;
  data_inicio: string;
  data_fim: string;
  motivo: string;
  tipo: string;
}

export const useEscalaMedicosMock = () => {
  const [medicos, setMedicos] = useState<MedicoEscala[]>([]);
  const [indisponibilidades, setIndisponibilidades] = useState<MedicoIndisponibilidade[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Mock data
    setMedicos([
      {
        id: '1',
        nome: 'Dr. João Silva',
        especialidade: 'Cardiologia',
        telefone: '(83) 99999-9999',
        email: 'joao@clinica.com'
      },
      {
        id: '2',
        nome: 'Dra. Maria Santos',
        especialidade: 'Dermatologia',
        telefone: '(83) 88888-8888',
        email: 'maria@clinica.com'
      }
    ]);

    setIndisponibilidades([
      {
        id: '1',
        medico_id: '1',
        data_inicio: '2024-01-15',
        data_fim: '2024-01-16',
        motivo: 'Férias',
        tipo: 'ferias'
      }
    ]);
  }, []);

  const adicionarIndisponibilidade = async (data: any) => {
    console.log('Adicionando indisponibilidade (mock):', data);
    toast({
      title: "Sucesso",
      description: "Indisponibilidade adicionada com sucesso (modo simulação)"
    });
    return { success: true };
  };

  const removerIndisponibilidade = async (id: string) => {
    console.log('Removendo indisponibilidade (mock):', id);
    toast({
      title: "Sucesso", 
      description: "Indisponibilidade removida com sucesso (modo simulação)"
    });
    return { success: true };
  };

  return {
    medicos,
    indisponibilidades,
    loading,
    adicionarIndisponibilidade,
    removerIndisponibilidade
  };
};