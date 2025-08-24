
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, FileText, Calendar, Heart } from "lucide-react";
import PatientExamsList from "./PatientExamsList";
import PatientAppointmentsList from "./PatientAppointmentsList";
import ClinicInfo from "./ClinicInfo";

interface PatientDashboardProps {
  paciente: any;
  clinica: any;
  clinicaLoading: boolean;
  exames: any[];
  agendamentos: any[];
  onLogout: () => void;
  onProfileOpen: () => void;
  onExamView: (exame: any) => void;
  getStatusColor: (status: string) => string;
  formatDateTime: (dateTime: string) => string;
}

const PatientDashboard = ({
  paciente,
  clinica,
  clinicaLoading,
  exames,
  agendamentos,
  onLogout,
  onProfileOpen,
  onExamView,
  getStatusColor,
  formatDateTime
}: PatientDashboardProps) => {
  // Separar agendamentos futuros dos passados
  const now = new Date();
  const agendamentosFuturos = agendamentos.filter(ag => new Date(ag.data_agendamento) >= now);
  const agendamentosPassados = agendamentos.filter(ag => new Date(ag.data_agendamento) < now);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Olá, {paciente?.nome}!
                </h1>
                <p className="text-gray-600">
                  Bem-vindo ao seu portal de saúde
                  {clinica?.nome && ` - ${clinica.nome}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={onProfileOpen} 
                variant="outline" 
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Meu Perfil</span>
              </Button>
              <Button onClick={onLogout} variant="outline" className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Exames Disponíveis</p>
                  <p className="text-2xl font-bold text-blue-900">{exames.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Próximos Agendamentos</p>
                  <p className="text-2xl font-bold text-green-900">{agendamentosFuturos.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Agendamentos</p>
                  <p className="text-2xl font-bold text-purple-900">{agendamentos.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Agendamentos */}
        <PatientAppointmentsList
          agendamentos={agendamentosFuturos}
          title="Próximos Agendamentos"
          description="Suas consultas e exames agendados"
          icon={<Calendar className="h-5 w-5 text-blue-600" />}
          getStatusColor={getStatusColor}
          formatDateTime={formatDateTime}
          emptyMessage="Nenhum agendamento próximo"
        />

        {/* Meus Exames */}
        <PatientExamsList
          exames={exames}
          onExamView={onExamView}
          getStatusColor={getStatusColor}
        />

        {/* Histórico de Agendamentos */}
        {agendamentosPassados.length > 0 && (
          <PatientAppointmentsList
            agendamentos={agendamentosPassados}
            title="Histórico de Agendamentos"
            description="Agendamentos anteriores"
            icon={<Calendar className="h-5 w-5 text-gray-600" />}
            getStatusColor={getStatusColor}
            formatDateTime={formatDateTime}
            emptyMessage="Nenhum agendamento anterior"
            showPast={true}
          />
        )}

        {/* Informações de Contato da Clínica */}
        <ClinicInfo clinica={clinica} clinicaLoading={clinicaLoading} />
      </div>
    </div>
  );
};

export default PatientDashboard;
