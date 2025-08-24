import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar as CalendarIcon, ToggleLeft, ToggleRight, Filter, Search, ChevronDown, ChevronUp } from "lucide-react";
import { useClinica } from '@/hooks/useClinica';
import AgendamentoModal from '@/components/AgendamentoModal';
import AgendaTimeGrid from '@/components/AgendaTimeGrid';
import AgendaSection from '@/components/AgendaSection';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AgendaAlertas from '@/components/AgendaAlertas';
import AgendaTour from '@/components/AgendaTour';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFuncionarioAgendaMock } from '@/hooks/useFuncionarioAgendaMock';

interface Agendamento {
  id: string;
  tipo_exame: string;
  data_agendamento: string;
  horario?: string;
  status: string;
  observacoes?: string;
  data_conclusao?: string;
  pacientes?: {
    nome: string;
    cpf: string;
    convenio_id?: string;
  };
  medicos?: {
    nome_completo: string;
    crm?: string;
    coren?: string;
  };
}

const FuncionarioAgenda = () => {
  const { agendamentos, pacientes, medicos, loading } = useFuncionarioAgendaMock();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [viewMode, setViewMode] = useState<'organized' | 'grid'>('organized');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    medico: '',
    exame: '',
    search: ''
  });
  
  const { toast } = useToast();
  const { clinica } = useClinica();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.title = 'Agenda | Sistema Clínica';
  }, []);

  // ... resto da lógica de filtros e componentes continua igual
  
  const filteredAgendamentos = agendamentos.filter((agendamento: any) => {
    const matchesStatus = !filters.status || agendamento.status === filters.status;
    const matchesMedico = !filters.medico || agendamento.medico_id === filters.medico;
    const matchesSearch = !filters.search || 
      agendamento.tipo_exame?.toLowerCase().includes(filters.search.toLowerCase()) ||
      agendamento.pacientes?.nome?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesMedico && matchesSearch;
  });

  const handleCreateAgendamento = () => {
    setSelectedAgendamento(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditAgendamento = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewAgendamento = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    handleCreateAgendamento();
  };

  const refreshData = () => {
    console.log('Refreshing agenda data (mock mode)');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'organized' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('organized')}
              className="text-sm"
            >
              Lista
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="text-sm"
            >
              Grade
            </Button>
          </div>
          
          <Button
            onClick={handleCreateAgendamento}
            className="whitespace-nowrap"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Calendário e Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendário */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-4 h-4" />
              <span className="font-medium">Calendário</span>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filtros */}
          <Card>
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleTrigger asChild>
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="font-medium">Filtros</span>
                  </div>
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                    
                    <select 
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Todos os status</option>
                      <option value="agendado">Agendado</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                    
                    <select 
                      value={filters.medico}
                      onChange={(e) => setFilters({ ...filters, medico: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Todos os médicos</option>
                      {medicos.map((medico: any) => (
                        <option key={medico.id} value={medico.id}>{medico.nome}</option>
                      ))}
                    </select>
                    
                    <Button
                      variant="outline"
                      onClick={() => setFilters({ status: '', medico: '', exame: '', search: '' })}
                      className="w-full"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Alertas */}
          <AgendaAlertas />

          {/* Conteúdo da Agenda */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Agenda Funcionário (Modo Simulação)</h3>
                <p className="text-muted-foreground mb-4">
                  Sistema multi-tenant em desenvolvimento. Dados simulados exibidos.
                </p>
                <div className="grid gap-2">
                  {filteredAgendamentos.map((ag: any) => (
                    <div key={ag.id} className="border rounded p-3 text-left">
                      <div className="font-medium">{ag.tipo_consulta || 'Consulta'}</div>
                      <div className="text-sm text-muted-foreground">
                        {ag.data_agendamento} às {ag.horario}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Agendamento - Simplificado para modo simulação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Agendamento (Simulação)</h2>
              <p className="text-muted-foreground mb-4">
                Sistema multi-tenant em desenvolvimento. Modal simplificado.
              </p>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedAgendamento(null);
                  setSelectedTimeSlot(null);
                }}
                className="w-full"
              >
                Fechar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tour de Apresentação */}
      <AgendaTour />
    </div>
  );
};

export default FuncionarioAgenda;