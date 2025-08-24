// Simple demo page replacements to avoid type inference issues
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClinica } from '@/hooks/useClinica';
import { useToast } from '@/hooks/use-toast';

// Simple Funcionarios Page
export const SimpleFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([
    {
      id: '1',
      nome_completo: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      cargo: 'Enfermeiro',
      data_admissao: new Date().toISOString(),
      status: 'ativo'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Funcionários</h1>
        <Button>Novo Funcionário</Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Sistema em modo demonstração</p>
            <p className="text-sm text-gray-400">Funcionários: {funcionarios.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple Categorias Page
export const SimpleCategorias = () => {
  const [categorias, setCategorias] = useState([
    {
      id: '1',
      nome: 'Cardiologia',
      descricao: 'Exames do coração',
      cor: '#ff6b6b',
      valor: 150.00,
      ativo: true
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categorias de Exames</h1>
        <Button>Nova Categoria</Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Sistema em modo demonstração</p>
            <p className="text-sm text-gray-400">Categorias: {categorias.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple Convenios Page  
export const SimpleConvenios = () => {
  const [convenios, setConvenios] = useState([
    {
      id: '1',
      nome: 'Unimed',
      descricao: 'Convênio Unimed',
      ativo: true
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Convênios</h1>
        <Button>Novo Convênio</Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Sistema em modo demonstração</p>
            <p className="text-sm text-gray-400">Convênios: {convenios.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple Exames Page
export const SimpleExames = () => {
  const [exames, setExames] = useState([
    {
      id: '1',
      tipo_exame: 'Raio-X',
      data_exame: new Date().toISOString(),
      status: 'concluido',
      observacoes: 'Exame demo'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exames</h1>
        <Button>Novo Exame</Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Sistema em modo demonstração</p>
            <p className="text-sm text-gray-400">Exames: {exames.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple FilaEspera Page
export const SimpleFilaEspera = () => {
  const [filaEspera, setFilaEspera] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fila de Espera</h1>
        <Button>Adicionar à Fila</Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Sistema em modo demonstração</p>
            <p className="text-sm text-gray-400">Fila vazia</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple Medicos Page
export const SimpleMedicos = () => {
  const [medicos, setMedicos] = useState([
    {
      id: '1',
      nome_completo: 'Dr. Maria Santos',
      crm: '12345',
      especialidade: 'Cardiologia',
      ativo: true
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Médicos</h1>
        <Button>Novo Médico</Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Sistema em modo demonstração</p>
            <p className="text-sm text-gray-400">Médicos: {medicos.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple Pacientes Page
export const SimplePacientes = () => {
  const [pacientes, setPacientes] = useState([
    {
      id: '1',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      convenio_id: null
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <Button>Novo Paciente</Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Sistema em modo demonstração</p>
            <p className="text-sm text-gray-400">Pacientes: {pacientes.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple Receitas Page
export const SimpleReceitas = () => {
  const [receitas, setReceitas] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Receitas</h1>
        <Button>Nova Receita</Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Sistema em modo demonstração</p>
            <p className="text-sm text-gray-400">Receitas: {receitas.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};