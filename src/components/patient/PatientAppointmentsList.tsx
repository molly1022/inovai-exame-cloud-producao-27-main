
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientAppointmentsListProps {
  agendamentos: any[];
  title: string;
  description: string;
  icon: React.ReactNode;
  getStatusColor: (status: string) => string;
  formatDateTime: (dateTime: string) => string;
  emptyMessage: string;
  showPast?: boolean;
}

const PatientAppointmentsList = ({ 
  agendamentos, 
  title, 
  description, 
  icon,
  getStatusColor, 
  formatDateTime,
  emptyMessage,
  showPast = false
}: PatientAppointmentsListProps) => {
  const navigate = useNavigate();

  const handleTelemedicina = (agendamento: any) => {
    // Usar CPF do localStorage como senha também (padrão)
    const pacienteCpf = localStorage.getItem('paciente_cpf');
    const cpfSemFormatacao = pacienteCpf?.replace(/\D/g, '') || '';
    
    if (pacienteCpf && agendamento.id) {
      const telemedicineUrl = `/paciente-telemedicina/${agendamento.id}?cpf=${encodeURIComponent(pacienteCpf)}&senha=${encodeURIComponent(cpfSemFormatacao)}`;
      window.open(telemedicineUrl, '_blank', 'width=1200,height=800');
    } else {
      // Fallback - redirecionar na mesma página
      navigate(`/paciente-telemedicina/${agendamento.id}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {agendamentos.length > 0 ? (
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <div 
                key={agendamento.id} 
                className={`p-4 border rounded-lg transition-colors ${
                  showPast ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getStatusColor(agendamento.status)}>
                        {agendamento.status}
                      </Badge>
                      <h3 className="font-semibold text-gray-900">{agendamento.tipo_exame}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateTime(agendamento.data_agendamento)}</span>
                      </div>
                      {agendamento.medicos && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Dr(a). {agendamento.medicos.nome_completo}</span>
                        </div>
                      )}
                    </div>
                    {agendamento.observacoes && (
                      <p className="text-sm text-gray-500 mt-2">{agendamento.observacoes}</p>
                    )}
                  </div>
                  
                   {/* Botão de Telemedicina para agendamentos de telemedicina */}
                   {agendamento.eh_telemedicina && !showPast && (
                     <div className="flex flex-col space-y-2 mt-2 md:mt-0">
                       <Button
                         size="sm"
                         onClick={() => handleTelemedicina(agendamento)}
                         className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 min-w-[200px]"
                       >
                          <Video className="h-4 w-4" />
                          <span>🖥️ Entrar na Consulta Online</span>
                       </Button>
                       <p className="text-xs text-muted-foreground text-center">
                         Login: CPF • Senha: CPF (apenas números)
                       </p>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientAppointmentsList;
