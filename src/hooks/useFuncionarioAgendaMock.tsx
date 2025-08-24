import { useState, useEffect } from 'react';

interface Agendamento {
  id: string;
  data_agendamento: string;
  horario: string;
  paciente_id: string;
  medico_id: string;
  status: string;
  tipo_consulta: string;
}

interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
}

interface Medico {
  id: string;
  nome: string;
  especialidade: string;
}

export const useFuncionarioAgendaMock = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data
    setAgendamentos([
      {
        id: '1',
        data_agendamento: '2024-01-15',
        horario: '09:00',
        paciente_id: '1',
        medico_id: '1',
        status: 'agendado',
        tipo_consulta: 'consulta'
      }
    ]);

    setPacientes([
      {
        id: '1',
        nome: 'João da Silva',
        telefone: '(83) 99999-9999',
        email: 'joao@email.com'
      }
    ]);

    setMedicos([
      {
        id: '1',
        nome: 'Dr. Pedro Santos',
        especialidade: 'Cardiologia'
      }
    ]);
  }, []);

  return {
    agendamentos,
    pacientes,
    medicos,
    loading
  };
};