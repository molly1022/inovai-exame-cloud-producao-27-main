
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Stethoscope, CheckCircle, Loader2 } from "lucide-react";
import { useDoctorSearch } from '@/hooks/useDoctorSearch';

interface Doctor {
  id: string;
  nome_completo: string;
  crm?: string;
  coren?: string;
  especialidade?: string;
}

interface DoctorSelectProps {
  selectedDoctor: Doctor | null;
  onDoctorSelect: (doctor: Doctor | null) => void;
}

const DoctorSelect = ({ 
  selectedDoctor, 
  onDoctorSelect
}: DoctorSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { searchDoctors, doctors, loading } = useDoctorSearch();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchDoctors(searchTerm.trim());
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchDoctors]);

  const handleDoctorSelect = (doctor: Doctor) => {
    onDoctorSelect(doctor);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (selectedDoctor && !isOpen) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Médico (Opcional)</Label>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-sm text-green-900">Dr(a). {selectedDoctor.nome_completo}</p>
                  <div className="text-xs text-green-700 space-x-2">
                    {selectedDoctor.crm && <span>CRM: {selectedDoctor.crm}</span>}
                    {selectedDoctor.coren && <span>COREN: {selectedDoctor.coren}</span>}
                    {selectedDoctor.especialidade && <span>• {selectedDoctor.especialidade}</span>}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onDoctorSelect(null);
                }}
              >
                Remover
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Médico (Opcional)</Label>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar médico por nome, CRM ou COREN..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>
      
      {isOpen && (
        <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md bg-background p-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Buscando médicos...</span>
            </div>
          ) : doctors.length > 0 ? (
            doctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors"
                onClick={() => handleDoctorSelect(doctor)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">Dr(a). {doctor.nome_completo}</p>
                      <div className="text-xs text-gray-500 space-x-2">
                        {doctor.crm && <span>CRM: {doctor.crm}</span>}
                        {doctor.coren && <span>COREN: {doctor.coren}</span>}
                        {doctor.especialidade && <span>• {doctor.especialidade}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : searchTerm.length >= 2 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              Nenhum médico encontrado para "{searchTerm}"
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Digite pelo menos 2 caracteres para buscar
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorSelect;
