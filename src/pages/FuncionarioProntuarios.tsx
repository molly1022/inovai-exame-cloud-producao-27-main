import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFuncionarioProntuariosMock } from '@/hooks/useFuncionarioMock';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Search, User, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FuncionarioProntuarios = () => {
  const { pacientes, loading } = useFuncionarioProntuariosMock();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Prontuários | Sistema Clínica';
  }, []);

  const filteredPacientes = pacientes.filter(paciente => {
    if (!searchTerm) return true;
    
    return (
      paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.cpf.includes(searchTerm)
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
          <h1 className="text-2xl font-bold">Prontuários</h1>
          <p className="text-muted-foreground">
            Acesso aos prontuários médicos dos pacientes
          </p>
        </div>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Modo Simulação
        </Badge>
      </div>

      {/* Barra de Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar paciente por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Prontuários */}
      <Card>
        <CardHeader>
          <CardTitle>Prontuários Disponíveis ({filteredPacientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredPacientes.length > 0 ? (
              filteredPacientes.map((paciente) => (
                <Card key={paciente.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{paciente.nome}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>CPF: {paciente.cpf}</span>
                            <span>
                              {calculateAge(paciente.data_nascimento)} anos
                            </span>
                            <span>
                              Nasc: {format(new Date(paciente.data_nascimento), 'dd/MM/yyyy')}
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
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Prontuário
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">Nenhum prontuário encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca.' 
                    : 'Nenhum prontuário disponível no momento.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal do Prontuário */}
      {isModalOpen && selectedPaciente && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Prontuário de {selectedPaciente.nome}
              </CardTitle>
              <p className="text-muted-foreground">
                CPF: {selectedPaciente.cpf} • {calculateAge(selectedPaciente.data_nascimento)} anos
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center py-8">
                  <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Prontuário Eletrônico</h3>
                  <p className="text-muted-foreground mb-4">
                    Sistema multi-tenant em desenvolvimento. Interface do prontuário será implementada.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      Consultas
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      Exames
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      Receitas
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      Atestados
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="border-t p-4">
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPaciente(null);
                }}
                className="w-full"
              >
                Fechar Prontuário
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Aviso sobre modo simulação */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Sistema Multi-Tenant em Desenvolvimento</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Os prontuários exibidos são simulados. O sistema está sendo preparado para acessar os dados específicos de cada clínica.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuncionarioProntuarios;