import { useState, useEffect } from 'react';

export const useFuncionarioDashboardMock = () => {
  const [stats, setStats] = useState({
    totalPacientes: 45,
    totalMedicos: 8,
    agendamentosHoje: 12,
    examesPendentes: 5
  });

  const [pacientes, setPacientes] = useState([
    { id: '1', nome: 'João Silva', telefone: '(83) 99999-9999', last_visit: '2024-01-15' },
    { id: '2', nome: 'Maria Santos', telefone: '(83) 88888-8888', last_visit: '2024-01-14' }
  ]);

  const [medicos, setMedicos] = useState([
    { id: '1', nome_completo: 'Dr. Pedro Costa', especialidade: 'Cardiologia' },
    { id: '2', nome_completo: 'Dra. Ana Lima', especialidade: 'Dermatologia' }
  ]);

  return {
    stats,
    pacientes,
    medicos,
    loading: false
  };
};

export const useFuncionarioExamesMock = () => {
  const [exames, setExames] = useState([
    {
      id: '1',
      tipo: 'Hemograma Completo',
      data_exame: '2024-01-15',
      paciente_nome: 'João Silva',
      status: 'pendente'
    }
  ]);

  return {
    exames,
    loading: false,
    refetch: () => console.log('Refetch exames (mock)')
  };
};

export const useFuncionarioPacientesMock = () => {
  const [pacientes, setPacientes] = useState([
    {
      id: '1',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      telefone: '(83) 99999-9999',
      email: 'joao@email.com',
      data_nascimento: '1985-05-15'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      cpf: '987.654.321-00', 
      telefone: '(83) 88888-8888',
      email: 'maria@email.com',
      data_nascimento: '1990-08-20'
    }
  ]);

  return {
    pacientes,
    filteredPacientes: pacientes,
    loading: false,
    refetch: () => console.log('Refetch pacientes (mock)')
  };
};

export const useFuncionarioProntuariosMock = () => {
  const [pacientes, setPacientes] = useState([
    {
      id: '1',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      data_nascimento: '1985-05-15'
    }
  ]);

  return {
    pacientes,
    loading: false
  };
};