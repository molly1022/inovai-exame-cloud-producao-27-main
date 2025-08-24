
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Activity } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import EnhancedExamModal from "@/components/EnhancedExamModal";
import ExamsDashboard from "@/components/exames/ExamsDashboard";
import ExamsFilters from "@/components/exames/ExamsFilters";
import ExamsTable from "@/components/exames/ExamsTable";

interface Exame {
  id: string;
  tipo: string;
  data_exame: string;
  status?: string;
  comentarios?: string;
  arquivo_nome?: string;
  arquivo_url?: string;
  created_at: string;
  paciente_id: string;
  medico_id?: string;
  categoria_id?: string;
  convenio_id?: string;
  paciente_nome?: string;
  medico_nome?: string;
  categoria_nome?: string;
  convenio_nome?: string;
}

const CentralExames = () => {
  const [exames, setExames] = useState<Exame[]>([]);
  const [filteredExames, setFilteredExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExame, setSelectedExame] = useState<Exame | null>(null);
  const [filtros, setFiltros] = useState({
    termoBusca: '',
    dataInicio: undefined,
    dataFim: undefined,
    categoria: 'todos',
    status: 'todos',
    medico: 'todos',
    convenio: 'todos'
  });
  const { toast } = useToast();
  const { clinicaId, isValid } = useTenantId();

  useEffect(() => {
    if (isValid && clinicaId) {
      fetchExames();
    } else {
      setLoading(false);
      toast({
        title: "Erro de configuração",
        description: "ID da clínica não encontrado. Faça login novamente.",
        variant: "destructive"
      });
    }
  }, [clinicaId, isValid]);

  useEffect(() => {
    applyFilters();
  }, [filtros, exames]);

  const applyFilters = () => {
    let filtered = [...exames];

    // Filtro por termo de busca
    if (filtros.termoBusca) {
      const termo = filtros.termoBusca.toLowerCase();
      filtered = filtered.filter(exame => 
        exame.tipo?.toLowerCase().includes(termo) ||
        exame.paciente_nome?.toLowerCase().includes(termo) ||
        exame.medico_nome?.toLowerCase().includes(termo)
      );
    }

    // Filtro por data
    if (filtros.dataInicio) {
      filtered = filtered.filter(exame => 
        new Date(exame.data_exame) >= new Date(filtros.dataInicio + 'T00:00:00')
      );
    }

    if (filtros.dataFim) {
      filtered = filtered.filter(exame => 
        new Date(exame.data_exame) <= new Date(filtros.dataFim + 'T23:59:59')
      );
    }

    // Filtro por categoria
    if (filtros.categoria !== 'todos') {
      filtered = filtered.filter(exame => exame.tipo === filtros.categoria);
    }

    // Filtro por status
    if (filtros.status !== 'todos') {
      filtered = filtered.filter(exame => exame.status === filtros.status);
    }

    // Filtro por médico
    if (filtros.medico !== 'todos') {
      filtered = filtered.filter(exame => exame.medico_id === filtros.medico);
    }

    // Filtro por convênio
    if (filtros.convenio !== 'todos') {
      if (filtros.convenio === 'particular') {
        filtered = filtered.filter(exame => !exame.convenio_id);
      } else {
        filtered = filtered.filter(exame => exame.convenio_id === filtros.convenio);
      }
    }

    setFilteredExames(filtered);
  };

  const fetchExames = async () => {
    try {
      console.log('🔍 Buscando exames para clínica:', clinicaId);
      
      if (!clinicaId) {
        toast({
          title: "Erro",
          description: "ID da clínica não encontrado",
          variant: "destructive"
        });
        return;
      }

      // Mock para exames - sistema multi-tenant em desenvolvimento
      console.log('Central de Exames - sistema multi-tenant em desenvolvimento');
      
      const mockExames = [
        {
          id: '1',
          tipo: 'Exame Mock',
          data_exame: '2024-01-01',
          paciente_id: '1',
          paciente_nome: 'Paciente Exemplo',
          medico_nome: 'Dr. Exemplo',
          convenio_nome: 'Particular',
          categoria_nome: 'Exames Gerais',
          created_at: new Date().toISOString()
        }
      ];

      setExames(mockExames);
      setFilteredExames(mockExames);
      
      toast({
        title: "Sucesso",
        description: `${mockExames.length} exames carregados com sucesso`,
      });
    } catch (error) {
      console.error('💥 Erro ao buscar exames:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar exames. Verifique sua conexão.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExame = () => {
    console.log('➕ Abrindo modal para adicionar exame');
    setSelectedExame(null);
    setIsModalOpen(true);
  };

  const handleViewExame = (exame: Exame) => {
    console.log('👁️ Abrindo modal para visualizar exame:', exame.id);
    setSelectedExame(exame);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log('❌ Fechando modal e recarregando exames');
    setIsModalOpen(false);
    setSelectedExame(null);
    // Recarregar os exames após fechar o modal
    fetchExames();
  };

  if (!isValid || !clinicaId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Central de Exames</h1>
            <p className="text-muted-foreground">Gerencie todos os exames da clínica</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">Erro: Clínica não identificada. Faça login novamente.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Central de Exames</h1>
            <p className="text-muted-foreground">Gerencie todos os exames da clínica</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando exames...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Central de Exames</h1>
            <p className="text-muted-foreground">Controle completo de todos os exames da clínica</p>
          </div>
        </div>
        <Button onClick={handleAddExame} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Novo Exame</span>
        </Button>
      </div>

      {/* Dashboard de Métricas */}
      <ExamsDashboard exames={exames} />

      {/* Filtros Avançados */}
      <ExamsFilters 
        filtros={filtros}
        onFiltersChange={setFiltros}
      />

      {/* Tabela/Cards de Exames */}
      <ExamsTable 
        exames={filteredExames}
        onViewExame={handleViewExame}
        loading={loading}
      />

      {/* Modal de Exame */}
      <EnhancedExamModal
        isOpen={isModalOpen}
        onClose={closeModal}
        exam={selectedExame}
        onSuccess={closeModal}
      />
    </div>
  );
};

export default CentralExames;
