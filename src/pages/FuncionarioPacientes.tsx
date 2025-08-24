import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFuncionarioPacientesMock } from '@/hooks/useFuncionarioMock';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, User, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FuncionarioPacientes = () => {
  const { pacientes, loading } = useFuncionarioPacientesMock();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);

  useEffect(() => {
    document.title = 'Pacientes | Sistema Clínica';
  }, []);

  const filteredPacientes = pacientes.filter(paciente => {
    if (!searchTerm) return true;
    
    return (
      paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.cpf.includes(searchTerm) ||
      paciente.telefone?.includes(searchTerm) ||
      paciente.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerenciamento de pacientes da clínica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Modo Simulação
          </Badge>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Barra de Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, CPF, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Pacientes Cadastrados ({filteredPacientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredPacientes.length > 0 ? (
              filteredPacientes.map((paciente) => (
                <Card key={paciente.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold">{paciente.nome}</h3>
                          <Badge variant="outline">
                            {calculateAge(paciente.data_nascimento)} anos
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">CPF:</span>
                            <span>{paciente.cpf}</span>
                          </div>
                          
                          {paciente.telefone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{paciente.telefone}</span>
                            </div>
                          )}
                          
                          {paciente.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{paciente.email}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Nascimento:</span>
                            <span>
                              {format(new Date(paciente.data_nascimento), 'dd/MM/yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPaciente(paciente);
                            setIsModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedPaciente(paciente);
                            // Abrir prontuário
                          }}
                        >
                          Prontuário
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">Nenhum paciente encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca.' 
                    : 'Nenhum paciente cadastrado no momento.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Simplificado */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {selectedPaciente ? 'Editar Paciente' : 'Novo Paciente'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Modal de pacientes em desenvolvimento (modo simulação)
              </p>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPaciente(null);
                }}
                className="w-full"
              >
                Fechar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aviso sobre modo simulação */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Sistema Multi-Tenant em Desenvolvimento</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Os dados de pacientes exibidos são simulados. O sistema está sendo preparado para conectar com os bancos específicos por clínica.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuncionarioPacientes;