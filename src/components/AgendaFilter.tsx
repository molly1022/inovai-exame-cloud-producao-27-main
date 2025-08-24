import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, X, Database } from "lucide-react";
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AgendaFilterProps {
  selectedMedico: string;
  selectedStatus: string;
  selectedData: string;
  onMedicoChange: (medico: string) => void;
  onStatusChange: (status: string) => void;
  onDataChange: (data: string) => void;
  onClearFilters: () => void;
}

const AgendaFilter = ({
  selectedMedico,
  selectedStatus,
  selectedData,
  onMedicoChange,
  onStatusChange,
  onDataChange,
  onClearFilters
}: AgendaFilterProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <FilterContent
        selectedMedico={selectedMedico}
        selectedStatus={selectedStatus}
        selectedData={selectedData}
        onMedicoChange={onMedicoChange}
        onStatusChange={onStatusChange}
        onDataChange={onDataChange}
        onClearFilters={onClearFilters}
      />
    </TenantGuard>
  );
};

const FilterContent = ({
  selectedMedico,
  selectedStatus,
  selectedData,
  onMedicoChange,
  onStatusChange,
  onDataChange,
  onClearFilters
}: AgendaFilterProps) => {
  const medicosSimulados = [
    { id: '1', nome_completo: 'Dr. João Silva' },
    { id: '2', nome_completo: 'Dra. Maria Santos' },
    { id: '3', nome_completo: 'Dr. Pedro Costa' }
  ];

  const hasActiveFilters = selectedMedico !== 'todos' || selectedStatus !== 'todos' || selectedData !== '';

  return (
    <div className="space-y-4">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Demonstração de Filtros</strong> - Dados reais estarão disponíveis quando acessado via subdomínio da clínica específica.
        </AlertDescription>
      </Alert>

      <Card className="opacity-75">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros da Agenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Médico</label>
              <Select value={selectedMedico} onValueChange={onMedicoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar médico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os médicos</SelectItem>
                  {medicosSimulados.map((medico) => (
                    <SelectItem key={medico.id} value={medico.id}>
                      {medico.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="faltou">Faltou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data</label>
              <input
                type="date"
                value={selectedData}
                onChange={(e) => onDataChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaFilter;