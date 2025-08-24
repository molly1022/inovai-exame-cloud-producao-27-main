
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, CheckCircle, Loader2 } from "lucide-react";
import { usePatientSearch } from '@/hooks/usePatientSearch';

interface Patient {
  id: string;
  nome: string;
  cpf: string;
}

interface PatientSelectProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
}

const PatientSelect = ({ 
  selectedPatient, 
  onPatientSelect
}: PatientSelectProps) => {
  const [isOpen, setIsOpen] = useState(!selectedPatient);
  const [searchTerm, setSearchTerm] = useState('');
  const { searchPatients, patients, loading } = usePatientSearch();

  // Buscar pacientes quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      searchPatients(searchTerm);
    }
  }, [searchTerm, searchPatients]);

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setIsOpen(false);
    setSearchTerm('');
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (selectedPatient && !isOpen) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Paciente *</Label>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-sm text-green-900">{selectedPatient.nome}</p>
                  <p className="text-xs text-green-700">CPF: {formatCPF(selectedPatient.cpf)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(true);
                  setSearchTerm('');
                }}
              >
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Paciente *</Label>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar paciente por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>
      
      <div className="max-h-48 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-500">Buscando...</span>
          </div>
        ) : patients.length > 0 ? (
          patients.map((patient) => (
            <Card
              key={patient.id}
              className="cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => handlePatientSelect(patient)}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">{patient.nome}</p>
                    <p className="text-xs text-gray-500">CPF: {formatCPF(patient.cpf)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            {searchTerm.length < 2 
              ? 'Digite pelo menos 2 caracteres para buscar pacientes' 
              : searchTerm 
                ? 'Nenhum paciente encontrado' 
                : 'Digite para buscar pacientes'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSelect;
