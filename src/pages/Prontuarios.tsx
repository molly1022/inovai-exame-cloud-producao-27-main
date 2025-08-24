
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Calendar, AlertCircle, Eye, Clock, Heart } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useClinica } from '@/hooks/useClinica';
import { Badge } from "@/components/ui/badge";

interface ProntuarioData {
  id: string;
  nome: string;
  cpf: string;
  idade?: number;
  telefone?: string;
  convenio_nome?: string;
  convenio_cor?: string;
  ultima_consulta?: string;
  proximo_agendamento?: string;
  total_consultas: number;
  total_exames: number;
  anotacoes_recentes: number;
  status_tratamento: 'ativo' | 'inativo' | 'aguardando';
}

const Prontuarios = () => {
  const [prontuarios, setProntuarios] = useState<ProntuarioData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedico, setSelectedMedico] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [medicos, setMedicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tenantId, loading: clinicaLoading } = useClinica();

  const fetchMedicos = useCallback(async () => {
    // Mock doctors data since we don't have operational tables in central DB
    setMedicos([
      { id: '1', nome_completo: 'Dr. João Silva' },
      { id: '2', nome_completo: 'Dra. Maria Santos' },
      { id: '3', nome_completo: 'Dr. Pedro Costa' }
    ]);
  }, []);

  const fetchProntuarios = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock patient data since we don't have operational tables in central DB
      const mockPacientes = [
        {
          id: '1',
          nome: 'Ana Silva',
          cpf: '123.456.789-10',
          idade: 35,
          telefone: '(11) 99999-9999',
          convenios: { nome: 'Plano Saúde', cor: '#2563eb' }
        },
        {
          id: '2',
          nome: 'João Santos',
          cpf: '987.654.321-00',
          idade: 42,
          telefone: '(11) 88888-8888',
          convenios: { nome: 'Particular', cor: '#16a34a' }
        },
        {
          id: '3',
          nome: 'Maria Costa',
          cpf: '456.789.123-45',
          idade: 28,
          telefone: '(11) 77777-7777',
          convenios: { nome: 'Unimed', cor: '#dc2626' }
        }
      ];

      // Mock additional data for each patient
      const prontuariosComDados = mockPacientes.map((paciente) => {
        // Mock data for demonstration
        const mockUltimoAgendamento = Math.random() > 0.3 ? 
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : 
          undefined;
        
        const mockProximoAgendamento = Math.random() > 0.6 ? 
          new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : 
          undefined;

        const mockTotalConsultas = Math.floor(Math.random() * 20) + 1;
        const mockTotalExames = Math.floor(Math.random() * 10);
        const mockAnotacoesRecentes = Math.floor(Math.random() * 5);

        // Determine treatment status
        let statusTratamento: 'ativo' | 'inativo' | 'aguardando' = 'inativo';
        if (mockProximoAgendamento) {
          statusTratamento = 'aguardando';
        } else if (mockUltimoAgendamento && new Date(mockUltimoAgendamento) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
          statusTratamento = 'ativo';
        }

        return {
          id: paciente.id,
          nome: paciente.nome,
          cpf: paciente.cpf,
          idade: paciente.idade,
          telefone: paciente.telefone,
          convenio_nome: paciente.convenios?.nome,
          convenio_cor: paciente.convenios?.cor,
          ultima_consulta: mockUltimoAgendamento,
          proximo_agendamento: mockProximoAgendamento,
          total_consultas: mockTotalConsultas,
          total_exames: mockTotalExames,
          anotacoes_recentes: mockAnotacoesRecentes,
          status_tratamento: statusTratamento
        };
      });

      setProntuarios(prontuariosComDados);
    } catch (error: any) {
      console.error('Erro ao carregar prontuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar prontuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [tenantId, toast]);

  useEffect(() => {
    if (!clinicaLoading && tenantId) {
      fetchProntuarios();
      fetchMedicos();
    }
  }, [clinicaLoading, tenantId, fetchProntuarios, fetchMedicos]);

  const filteredProntuarios = prontuarios.filter(prontuario => {
    const matchesSearch = prontuario.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prontuario.cpf?.includes(searchTerm);
    const matchesStatus = !selectedStatus || prontuario.status_tratamento === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'aguardando':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Aguardando</Badge>;
      case 'inativo':
        return <Badge variant="secondary">Inativo</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (clinicaLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando prontuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prontuários Médicos</h1>
          <p className="text-gray-600 dark:text-gray-400">Acesso rápido aos prontuários dos pacientes</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status do Tratamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="aguardando">Aguardando</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMedico} onValueChange={setSelectedMedico}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Médicos</SelectItem>
                {medicos.map((medico) => (
                  <SelectItem key={medico.id} value={medico.id}>
                    {medico.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Prontuários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProntuarios.map((prontuario) => (
          <Card key={prontuario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {prontuario.nome}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    CPF: {prontuario.cpf} • {prontuario.idade ? `${prontuario.idade} anos` : 'Idade não informada'}
                  </p>
                  {prontuario.convenio_nome && (
                    <Badge 
                      variant="outline" 
                      className="mt-1"
                      style={{ backgroundColor: prontuario.convenio_cor, color: 'white' }}
                    >
                      {prontuario.convenio_nome}
                    </Badge>
                  )}
                </div>
                {getStatusBadge(prontuario.status_tratamento)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Estatísticas Médicas */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{prontuario.total_consultas}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Consultas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{prontuario.total_exames}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Exames</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{prontuario.anotacoes_recentes}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Anotações (30d)</p>
                </div>
              </div>

              {/* Informações de Consultas */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Última consulta:</span>
                  <span className="font-medium">{formatDate(prontuario.ultima_consulta)}</span>
                </div>
                
                {prontuario.proximo_agendamento && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Próximo agendamento:</span>
                    <span className="font-medium text-blue-600">{formatDate(prontuario.proximo_agendamento)}</span>
                  </div>
                )}
              </div>

              {/* Alertas */}
              {prontuario.status_tratamento === 'inativo' && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    Paciente sem consultas recentes
                  </span>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => navigate(`/prontuarios/${prontuario.id}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Prontuário Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProntuarios.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum prontuário encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedStatus ? 'Tente ajustar os filtros de busca' : 'Nenhum paciente com prontuário disponível'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Prontuarios;
