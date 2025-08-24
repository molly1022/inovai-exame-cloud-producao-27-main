
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Eye, Edit, Trash2, Calendar, MapPin, Phone, Mail } from "lucide-react";
import { getPatientAvatar } from "@/utils/getPatientAvatar";

interface Patient {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento?: string;
  telefone?: string;
  email?: string;
  convenio_id?: string;
  genero?: string;
  foto_perfil_url?: string;
  convenios?: {
    nome: string;
    cor: string;
  };
}

interface PatientCardProps {
  patient: Patient;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
}

const PatientCard = ({ patient, onView, onEdit, onDelete, showActions = true }: PatientCardProps) => {
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={getPatientAvatar({
                  foto_perfil_url: patient.foto_perfil_url,
                  genero: patient.genero,
                  nome: patient.nome
                })} 
                alt={patient.nome} 
              />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold truncate">{patient.nome}</h3>
                {patient.data_nascimento && (
                  <Badge variant="outline" className="text-xs">
                    {calculateAge(patient.data_nascimento)} anos
                  </Badge>
                )}
                {patient.convenios && (
                  <Badge 
                    className="text-xs text-white"
                    style={{ backgroundColor: patient.convenios.cor }}
                  >
                    {patient.convenios.nome}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="truncate">CPF: {patient.cpf}</span>
                </div>
                
                {patient.data_nascimento && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Nasc: {new Date(patient.data_nascimento).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                
                {patient.telefone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span className="truncate">{patient.telefone}</span>
                  </div>
                )}
                
                {patient.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={onView}
              size="sm"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4 mr-1" />
              Detalhes do Paciente
            </Button>
            
            {showActions && (
              <>
                <Button
                  onClick={onEdit}
                  size="sm"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <Button
                  onClick={onDelete}
                  size="sm"
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
