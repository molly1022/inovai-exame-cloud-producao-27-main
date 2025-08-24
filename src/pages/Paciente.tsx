
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  FileText, 
  Download, 
  LogOut, 
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Weight,
  Ruler
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Paciente = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock patient data
  const patient = {
    name: 'Maria Silva Santos',
    cpf: '123.456.789-01',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-1234',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    birthDate: '15/03/1985',
    weight: '65 kg',
    height: '1.65 m',
    bloodType: 'O+'
  };

  // Mock exams data
  const exams = [
    {
      id: '1',
      type: 'Raio-X Tórax',
      date: '2024-01-16',
      status: 'Disponível',
      fileName: 'raio_x_torax_maria.jpg',
      observations: 'Exame normal, sem alterações detectadas'
    },
    {
      id: '2',
      type: 'Exame de Sangue',
      date: '2024-01-20',
      status: 'Disponível',
      fileName: 'exame_sangue_maria.pdf',
      observations: 'Todos os parâmetros dentro da normalidade'
    },
    {
      id: '3',
      type: 'Ultrassom Abdominal',
      date: '2024-01-25',
      status: 'Em Processamento',
      fileName: 'ultrassom_maria.pdf',
      observations: 'Aguardando liberação médica'
    }
  ];

  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponível': return 'bg-green-100 text-green-800';
      case 'Em Processamento': return 'bg-yellow-100 text-yellow-800';
      case 'Em Revisão': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Portal do Paciente
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Bem-vindo(a), {patient.name}
                </p>
              </div>
            </div>
            
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl">{patient.name}</CardTitle>
                <CardDescription>CPF: {patient.cpf}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{patient.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Nascimento: {patient.birthDate}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Informações Físicas
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <Weight className="h-3 w-3 text-gray-400" />
                      <span>{patient.weight}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Ruler className="h-3 w-3 text-gray-400" />
                      <span>{patient.height}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                      Total de Exames
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                      {exams.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-2">Bem-vindo ao seu Portal!</h2>
                <p className="opacity-90">
                  Aqui você pode visualizar e baixar todos os seus exames médicos de forma segura e prática.
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {exams.filter(e => e.status === 'Disponível').length}
                  </p>
                  <p className="text-sm text-gray-600">Disponíveis</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {exams.filter(e => e.status === 'Em Processamento').length}
                  </p>
                  <p className="text-sm text-gray-600">Processando</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Date().getMonth() + 1}
                  </p>
                  <p className="text-sm text-gray-600">Este Mês</p>
                </CardContent>
              </Card>
            </div>

            {/* Exams List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Meus Exames</span>
                </CardTitle>
                <CardDescription>Histórico completo dos seus exames médicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{exam.type}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(exam.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                              {exam.status}
                            </span>
                          </div>
                          
                          <div className="ml-11">
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Arquivo:</strong> {exam.fileName}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Observações:</strong> {exam.observations}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {exam.status === 'Disponível' && (
                            <>
                              <Button variant="outline" size="sm" title="Visualizar">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" title="Download">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {exams.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhum exame encontrado
                    </h3>
                    <p className="text-gray-500">
                      Seus exames aparecerão aqui quando estiverem disponíveis.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paciente;
