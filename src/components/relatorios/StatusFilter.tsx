
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  loading?: boolean;
  type: 'agendamentos' | 'exames';
}

const StatusFilter = ({ selectedStatus, onStatusChange, loading, type }: StatusFilterProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
      </div>
    );
  }

  const getStatusOptions = () => {
    if (type === 'agendamentos') {
      return [
        { value: 'todos', label: 'Todos os Status' },
        { value: 'agendado', label: 'Agendados' },
        { value: 'confirmado', label: 'Confirmados' },
        { value: 'paciente_chegou', label: 'Paciente Chegou' },
        { value: 'em_andamento', label: 'Em Andamento' },
        { value: 'concluido', label: 'Concluídos' },
        { value: 'cancelado', label: 'Cancelados' },
        { value: 'faltou', label: 'Faltou' }
      ];
    } else {
      return [
        { value: 'todos', label: 'Todos os Status' },
        { value: 'disponivel', label: 'Disponíveis' },
        { value: 'entregue', label: 'Entregues' },
        { value: 'pendente', label: 'Pendentes' }
      ];
    }
  };

  return (
    <div className="space-y-2">
      <Label>Filtrar por Status</Label>
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um status" />
        </SelectTrigger>
        <SelectContent>
          {getStatusOptions().map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusFilter;
