import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, Stethoscope, Search, Database } from "lucide-react";
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaSemanalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

const AgendaSemanalModal = ({ isOpen, onClose, selectedDate }: AgendaSemanalModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <TenantGuard requiresOperationalDB={true}>
          <ModalContent selectedDate={selectedDate} onClose={onClose} />
        </TenantGuard>
      </DialogContent>
    </Dialog>
  );
};

const ModalContent = ({ selectedDate, onClose }: { selectedDate: Date; onClose: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Dados simulados para demonstração
  const agendamentosSimulados = [
    {
      id: '1',
      data_agendamento: '09:00',
      status: 'confirmado',
      tipo_exame: 'Consulta Cardiológica',
      pacientes: { nome: 'João Silva', cpf: '123.456.789-00' },
      medicos: { nome_completo: 'Dr. Carlos Santos', crm: '12345' },
      observacoes: 'Primeira consulta'
    },
    {
      id: '2',
      data_agendamento: '10:30',
      status: 'agendado',
      tipo_exame: 'Ultrassom Abdominal',
      pacientes: { nome: 'Maria Costa', cpf: '987.654.321-00' },
      medicos: { nome_completo: 'Dra. Ana Paula', crm: '67890' },
      observacoes: null
    },
    {
      id: '3',
      data_agendamento: '14:00',
      status: 'em_andamento',
      tipo_exame: 'Consulta Neurológica',
      pacientes: { nome: 'Pedro Santos', cpf: '456.789.123-00' },
      medicos: { nome_completo: 'Dr. Roberto Lima', crm: '54321' },
      observacoes: 'Paciente com histórico de enxaqueca'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmado":
        return "bg-green-100 text-green-800 border-green-200";
      case "em_andamento":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "realizado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredAgendamentos = agendamentosSimulados.filter((agendamento) =>
    agendamento.pacientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.tipo_exame.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.medicos?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <>
      <DialogHeader className="flex-shrink-0 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Agendamentos do Dia
              </DialogTitle>
              <p className="text-sm text-gray-600 capitalize">
                {formatDate(selectedDate)}
              </p>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-hidden flex flex-col space-y-4">
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Demonstração de Agendamentos</strong> - Dados reais estarão disponíveis quando acessado via subdomínio da clínica específica.
          </AlertDescription>
        </Alert>

        {/* Barra de busca */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por paciente, médico ou tipo de exame..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Lista de agendamentos */}
        <div className="flex-1 overflow-y-auto space-y-3 opacity-75">
          {filteredAgendamentos.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "Nenhum resultado encontrado" : "Nenhum agendamento"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Tente alterar os termos da busca"
                  : "Não há agendamentos para este dia"
                }
              </p>
            </div>
          ) : (
            filteredAgendamentos.map((agendamento) => (
              <Card key={agendamento.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 text-blue-600">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {agendamento.data_agendamento}
                            </span>
                          </div>
                          <Badge className={getStatusColor(agendamento.status)}>
                            {agendamento.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {agendamento.pacientes?.nome}
                              </p>
                              <p className="text-sm text-gray-500">
                                CPF: {agendamento.pacientes?.cpf}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {agendamento.medicos?.nome_completo || "Médico não informado"}
                              </p>
                              {agendamento.medicos && (
                                <p className="text-sm text-gray-500">
                                  CRM: {agendamento.medicos.crm}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <p className="font-medium text-purple-700">
                          {agendamento.tipo_exame}
                        </p>
                        {agendamento.observacoes && (
                          <p className="text-sm text-gray-600 mt-1">
                            Obs: {agendamento.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="flex-shrink-0 pt-4 border-t">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredAgendamentos.length} agendamento{filteredAgendamentos.length !== 1 ? 's' : ''} encontrado{filteredAgendamentos.length !== 1 ? 's' : ''}
          </p>
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    </>
  );
};

export default AgendaSemanalModal;