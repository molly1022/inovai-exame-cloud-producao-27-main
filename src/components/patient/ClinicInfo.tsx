
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Heart, Clock } from "lucide-react";

interface ClinicInfoProps {
  clinica: any;
  clinicaLoading: boolean;
}

const ClinicInfo = ({ clinica, clinicaLoading }: ClinicInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-purple-600" />
          <span>Informações da Clínica</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clinicaLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full mr-3"></div>
            <span className="text-gray-600">Carregando informações da clínica...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {clinica?.nome && (
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{clinica.nome}</p>
                    <p className="text-sm text-gray-600">Nome da Clínica</p>
                  </div>
                </div>
              )}
              {clinica?.telefone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-gray-700">{clinica.telefone}</p>
                    <p className="text-sm text-gray-600">Telefone</p>
                  </div>
                </div>
              )}
              {clinica?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-gray-700">{clinica.email}</p>
                    <p className="text-sm text-gray-600">Email</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {clinica?.endereco && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-gray-700">{clinica.endereco}</p>
                    <p className="text-sm text-gray-600">Endereço</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-gray-700">Segunda a Sexta: 8h às 18h</p>
                  <p className="text-gray-700">Sábado: 8h às 12h</p>
                  <p className="text-sm text-gray-600">Horário de Funcionamento</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClinicInfo;
