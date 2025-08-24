import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  FileText, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Eye,
  LogOut,
  Stethoscope,
  Edit,
  Search,
  Plus,
  Printer,
  FileX,
  UserCheck,
  AlertTriangle,
  PlayCircle,
  Users,
  RefreshCw,
  Video
} from "lucide-react";
import { useMedicoAuth } from '@/hooks/useMedicoAuth';
import { supabase } from '@/integrations/supabase/client';
import ExameViewModal from '@/components/ExameViewModal';
import ExamEditModal from '@/components/ExamEditModal';
import { ReceitaModal } from '@/components/ReceitaModal';
import ReceitaViewModal from '@/components/ReceitaViewModal';
import AtestadoModal from '@/components/AtestadoModal';
import AtestadoViewModal from '@/components/AtestadoViewModal';
import ProntuarioModal from '@/components/ProntuarioModal';
import MedicoAgendamentoCard from '@/components/medico/MedicoAgendamentoCard';
import AgendaSection from '@/components/AgendaSection';
import PatientCard from '@/components/PatientCard';
import { useQuery } from '@tanstack/react-query';
import { useMedicoData } from '@/hooks/useMedicoData';
import { ProcessarTeleconsultasButton } from '@/components/ProcessarTeleconsultasButton';

const PortalMedico = () => {
  const { cpf, senha } = useParams();
  const navigate = useNavigate();
  const { medico, login, logout, isAuthenticated, loading } = useMedicoAuth();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({
    cpf: cpf || '',
    senha: senha || ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // Usar o novo hook de dados do médico
  const {
    agendamentos,
    pacientes: pacientesFromHook,
    exames,
    receitas,
    atestados,
    stats,
    isLoading: loading2,
    refetchAll,
    hasErrors
  } = useMedicoData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedExame, setSelectedExame] = useState(null);
  const [isExameModalOpen, setIsExameModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [exameToEdit, setExameToEdit] = useState(null);
  const [isReceitaModalOpen, setIsReceitaModalOpen] = useState(false);
  const [isReceitaViewModalOpen, setIsReceitaViewModalOpen] = useState(false);
  const [selectedReceita, setSelectedReceita] = useState(null);
  const [isProntuarioModalOpen, setIsProntuarioModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [isAddReceitaModalOpen, setIsAddReceitaModalOpen] = useState(false);
  const [isAtestadoModalOpen, setIsAtestadoModalOpen] = useState(false);
  const [isAtestadoViewModalOpen, setIsAtestadoViewModalOpen] = useState(false);
  const [selectedAtestado, setSelectedAtestado] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estados para filtros de busca
  const [searchTermAgendamentos, setSearchTermAgendamentos] = useState('');
  const [searchTermExames, setSearchTermExames] = useState('');
  const [searchTermReceitas, setSearchTermReceitas] = useState('');
  const [searchTermAtestados, setSearchTermAtestados] = useState('');
  const [searchTermPacientes, setSearchTermPacientes] = useState('');

  // Usar pacientes do hook otimizado
  const pacientes = pacientesFromHook;

  useEffect(() => {
    if (cpf && senha && !isAuthenticated && !loading) {
      handleAutoLogin();
    }
  }, [cpf, senha, isAuthenticated, loading]);

  // Efeito para mostrar erros se houver
  useEffect(() => {
    if (hasErrors && isAuthenticated) {
      toast({
        title: "Erro ao carregar dados",
        description: "Alguns dados podem não estar atualizados",
        variant: "destructive"
      });
    }
  }, [hasErrors, isAuthenticated]);

  // Auto-refresh com polling de 30 segundos
  useEffect(() => {
    if (!isAuthenticated || !medico || !autoRefreshEnabled) return;

    const interval = setInterval(() => {
      refetchAll(); // Usar função otimizada
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [isAuthenticated, medico, autoRefreshEnabled, refetchAll]);

  // Supabase Realtime subscription para agendamentos
  useEffect(() => {
    if (!isAuthenticated || !medico) return;

    const channel = supabase
      .channel('agendamentos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos',
          filter: `medico_id=eq.${medico.id}`
        },
        (payload) => {
          console.log('Agendamento atualizado em tempo real:', payload);
          refetchAll(); // Usar função otimizada
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, medico]);

  // Refresh quando foco volta para a aba
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && medico) {
        refetchAll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, medico]);

  const handleAutoLogin = async () => {
    if (cpf && senha) {
      setIsLoggingIn(true);
      const success = await login(cpf, senha);
      if (!success) {
        navigate('/');
      }
      setIsLoggingIn(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.cpf || !loginForm.senha) {
      toast({
        title: "Erro",
        description: "Preencha CPF e senha",
        variant: "destructive"
      });
      return;
    }

    setIsLoggingIn(true);
    console.log('🔐 Tentando login médico:', { 
      cpf: loginForm.cpf.replace(/\D/g, ''), 
      senha: '***hidden***' 
    });
    
    const success = await login(loginForm.cpf, loginForm.senha);
    if (success) {
      setLoginForm({ cpf: '', senha: '' });
      toast({
        title: "✅ Login realizado com sucesso!",
        description: "Bem-vindo ao Portal Médico",
      });
    } else {
      toast({
        title: "❌ Erro no login",
        description: "CPF ou senha incorretos. Verifique as credenciais na página de médicos.",
        variant: "destructive"
      });
    }
    setIsLoggingIn(false);
  };

  // Função de refresh manual
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetchAll();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewExame = async (exame: any) => {
    try {
      // Demo: usar dados do exame passado como parâmetro
      setSelectedExame(exame);
      setIsExameModalOpen(true);
    } catch (error) {
      console.error('Erro ao buscar exame:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do exame",
        variant: "destructive"
      });
    }
  };

  const handleEditExame = (exame: any) => {
    setExameToEdit(exame);
    setIsEditModalOpen(true);
  };

  const handleViewReceita = async (receita: any) => {
    try {
      // Demo: usar dados da receita passada como parâmetro
      setSelectedReceita(receita);
      setIsReceitaViewModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar receita:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da receita",
        variant: "destructive"
      });
    }
  };

  const handleAddReceita = () => {
    setIsAddReceitaModalOpen(true);
  };

  const handleViewAtestado = async (atestado: any) => {
    try {
      // Demo: usar dados do atestado passado como parâmetro  
      setSelectedAtestado(atestado);
      setIsAtestadoViewModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar atestado:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do atestado",
        variant: "destructive"
      });
    }
  };

  const handleAddAtestado = () => {
    setIsAtestadoModalOpen(true);
  };

  const handleViewProntuario = async (agendamento: any) => {
    try {
      // Demo: usar dados do paciente do agendamento
      const pacienteDemo = agendamento.pacientes || {
        id: 'demo-paciente-1',
        nome: 'João Silva Demo',
        cpf: '12345678901',
        data_nascimento: '1980-01-01',
        telefone: '(11) 99999-9999',
        email: 'joao@demo.com',
        convenios: { nome: 'SUS', cor: '#22c55e' }
      };

      setSelectedPaciente(pacienteDemo);
      setIsProntuarioModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar prontuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do prontuário",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>;
      case 'realizado':
        return <Badge className="bg-green-100 text-green-800">Realizado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const filteredAgendamentos = agendamentos.filter((agendamento: any) => {
    const searchTerm = searchTermAgendamentos.toLowerCase();
    const nome = agendamento.pacientes?.nome?.toLowerCase() || '';
    const cpf = agendamento.pacientes?.cpf?.toLowerCase() || '';
    return nome.includes(searchTerm) || cpf.includes(searchTerm);
  });

  const filteredExames = exames.filter((exame: any) => {
    const searchTerm = searchTermExames.toLowerCase();
    const nome = exame.pacientes?.nome?.toLowerCase() || '';
    const cpf = exame.pacientes?.cpf?.toLowerCase() || '';
    return nome.includes(searchTerm) || cpf.includes(searchTerm);
  });

  const filteredReceitas = receitas.filter((receita: any) => {
    const searchTerm = searchTermReceitas.toLowerCase();
    const nome = receita.pacientes?.nome?.toLowerCase() || '';
    const cpf = receita.pacientes?.cpf?.toLowerCase() || '';
    return nome.includes(searchTerm) || cpf.includes(searchTerm);
  });

  const filteredAtestados = atestados.filter((atestado: any) => {
    const searchTerm = searchTermAtestados.toLowerCase();
    const nome = atestado.pacientes?.nome?.toLowerCase() || '';
    const cpf = atestado.pacientes?.cpf?.toLowerCase() || '';
    return nome.includes(searchTerm) || cpf.includes(searchTerm);
  });

  const filteredPacientes = pacientes.filter((paciente: any) => {
    const searchTerm = searchTermPacientes.toLowerCase();
    const nome = paciente.nome?.toLowerCase() || '';
    const cpf = paciente.cpf?.toLowerCase() || '';
    return nome.includes(searchTerm) || cpf.includes(searchTerm);
  });

  // NOVA ORDEM: Próximos agendamentos primeiro!
  const now = new Date();
  const toleranciaMinutos = 15;

  const agendamentosProximos = filteredAgendamentos.filter((ag: any) => {
    const agendamentoTime = new Date(ag.data_agendamento);
    return agendamentoTime > now && ['agendado', 'confirmado'].includes(ag.status);
  });

  const agendamentosEmAndamento = filteredAgendamentos.filter((ag: any) => 
    ['paciente_chegou', 'em_andamento'].includes(ag.status)
  );

  const agendamentosAtrasados = filteredAgendamentos.filter((ag: any) => {
    const agendamentoTime = new Date(ag.data_agendamento);
    const minutosAtraso = (now.getTime() - agendamentoTime.getTime()) / (1000 * 60);
    
    return agendamentoTime < now && 
           ['agendado', 'confirmado'].includes(ag.status) &&
           minutosAtraso <= toleranciaMinutos;
  });

  const agendamentosConcluidos = filteredAgendamentos.filter((ag: any) => 
    ag.status === 'concluido'
  );

  const agendamentosCancelados = filteredAgendamentos.filter((ag: any) => {
    const agendamentoTime = new Date(ag.data_agendamento);
    const minutosAtraso = (now.getTime() - agendamentoTime.getTime()) / (1000 * 60);
    
    return ['cancelado', 'faltou'].includes(ag.status) ||
           (agendamentoTime < now && 
            ['agendado', 'confirmado'].includes(ag.status) &&
            minutosAtraso > toleranciaMinutos);
  });

  if (loading || isLoggingIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Portal do Médico</CardTitle>
              <p className="text-gray-600">Acesse com seu CPF e senha</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualLogin} className="space-y-4">
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={loginForm.cpf}
                    onChange={(e) => setLoginForm({ ...loginForm, cpf: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Sua senha de acesso"
                    value={loginForm.senha}
                    onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Portal do Médico</h1>
                <p className="text-blue-200 text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                  Dr(a). {medico?.nome_completo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ProcessarTeleconsultasButton />
              {/* Auto-refresh indicator - hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 text-white/70 text-sm">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>
                  {autoRefreshEnabled 
                    ? (isRefreshing ? 'Atualizando...' : 'Auto-atualização ativa') 
                    : 'Auto-atualização pausada'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  {autoRefreshEnabled ? 'Pausar' : 'Ativar'}
                </Button>
              </div>
              {/* Mobile auto-refresh toggle */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className="md:hidden text-white/70 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                size="sm"
                className="text-black border-white/20 hover:bg-purple/10"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 sm:space-x-4 mb-6 overflow-x-auto">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dashboard')}
            size="sm"
            className={activeTab === 'dashboard' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0'
            }
          >
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <Button
            variant={activeTab === 'agendamentos' ? 'default' : 'outline'}
            onClick={() => setActiveTab('agendamentos')}
            size="sm"
            className={activeTab === 'agendamentos' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0'
            }
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Agendamentos</span>
            <span className="sm:hidden">Agenda</span>
          </Button>
          <Button
            variant={activeTab === 'prontuarios' ? 'default' : 'outline'}
            onClick={() => setActiveTab('prontuarios')}
            size="sm"
            className={activeTab === 'prontuarios' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0'
            }
          >
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Prontuários</span>
            <span className="sm:hidden">Pacientes</span>
          </Button>
          <Button
            variant={activeTab === 'exames' ? 'default' : 'outline'}
            onClick={() => setActiveTab('exames')}
            size="sm"
            className={activeTab === 'exames' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0'
            }
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exames</span>
          </Button>
          <Button
            variant={activeTab === 'receitas' ? 'default' : 'outline'}
            onClick={() => setActiveTab('receitas')}
            size="sm"
            className={activeTab === 'receitas' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0'
            }
          >
            <FileX className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Receitas</span>
          </Button>
          <Button
            variant={activeTab === 'atestados' ? 'default' : 'outline'}
            onClick={() => setActiveTab('atestados')}
            size="sm"
            className={activeTab === 'atestados' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0'
            }
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Atestados</span>
          </Button>
          <Button
            variant={activeTab === 'telemedicina' ? 'default' : 'outline'}
            onClick={() => setActiveTab('telemedicina')}
            size="sm"
            className={activeTab === 'telemedicina' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0'
            }
          >
            <Video className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Telemedicina</span>
          </Button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Próximos Agendamentos</p>
                      <p className="text-2xl font-bold">{stats.agendamentosFuturos}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Agendamentos Realizados</p>
                      <p className="text-2xl font-bold">{stats.agendamentosPassados}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Exames Realizados</p>
                      <p className="text-2xl font-bold">{stats.examesRealizados}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receitas Emitidas</p>
                      <p className="text-2xl font-bold">{stats.receitasEmitidas}</p>
                    </div>
                    <FileX className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Atestados Emitidos</p>
                      <p className="text-2xl font-bold">{stats.atestadosEmitidos}</p>
                    </div>
                    <FileText className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Próximo Agendamento</p>
                      <p className="text-sm font-bold">
                        {stats.proximoAgendamento 
                          ? formatDate(stats.proximoAgendamento.data_agendamento)
                          : 'Nenhum'
                        }
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NOVA ORDEM: Próximos em primeiro lugar */}
            {agendamentosProximos.length > 0 && (
              <AgendaSection
                title="Próximos Agendamentos"
                agendamentos={agendamentosProximos}
                onUpdate={handleManualRefresh}
                variant="info"
                showPrintButton={false}
                hidePaymentInfo={true}
                hideCancelAction={true}
                showProntuario={true}
                    onProntuarioClick={(agendamento) => handleViewProntuario(agendamento)}
                isPortalMedico={true}
                emptyMessage="Nenhum agendamento futuro"
              />
            )}

            {/* Em Andamento - Alta prioridade */}
            {agendamentosEmAndamento.length > 0 && (
                    <AgendaSection
                      title="Em Andamento"
                      agendamentos={agendamentosEmAndamento}
                      onUpdate={handleManualRefresh}
                      variant="warning"
                      showPrintButton={false}
                      hidePaymentInfo={true}
                      hideCancelAction={true}
                      showProntuario={true}
                      onProntuarioClick={(agendamento) => handleViewProntuario(agendamento)}
                      isPortalMedico={true}
                      emptyMessage="Nenhuma consulta em andamento"
                    />
            )}

            {/* Atrasados */}
            {agendamentosAtrasados.length > 0 && (
              <AgendaSection
                title="Atrasados"
                agendamentos={agendamentosAtrasados}
                onUpdate={handleManualRefresh}
                variant="warning"
                showPrintButton={false}
                hidePaymentInfo={true}
                hideCancelAction={true}
                showProntuario={true}
                onProntuarioClick={(agendamento) => handleViewProntuario(agendamento)}
                isPortalMedico={true}
                emptyMessage="Nenhum agendamento atrasado"
              />
            )}
          </div>
        )}

        {activeTab === 'agendamentos' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Meus Agendamentos</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou CPF do paciente..."
                      value={searchTermAgendamentos}
                      onChange={(e) => setSearchTermAgendamentos(e.target.value)}
                      className="pl-9 w-80"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading2 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Carregando agendamentos...</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {/* NOVA ORDEM: Próximos primeiro! */}
                    <AgendaSection
                      title="Próximos Agendamentos"
                      agendamentos={agendamentosProximos}
                      onUpdate={handleManualRefresh}
                      variant="info"
                      showPrintButton={false}
                      hidePaymentInfo={true}
                      hideCancelAction={true}
                      showProntuario={true}
                       onProntuarioClick={(agendamento) => handleViewProntuario(agendamento)}
                      isPortalMedico={true}
                      emptyMessage="Nenhum agendamento futuro"
                    />

                    {/* Em Andamento */}
                    <AgendaSection
                      title="Em Andamento"
                      agendamentos={agendamentosEmAndamento}
                      onUpdate={handleManualRefresh}
                      variant="warning"
                      showPrintButton={false}
                      hidePaymentInfo={true}
                      hideCancelAction={true}
                      showProntuario={true}
                       onProntuarioClick={(agendamento) => handleViewProntuario(agendamento)}
                      isPortalMedico={true}
                      emptyMessage="Nenhuma consulta em andamento"
                    />

                    {/* Atrasados */}
                    <AgendaSection
                      title="Atrasados (até 15 min)"
                      agendamentos={agendamentosAtrasados}
                      onUpdate={handleManualRefresh}
                      variant="warning"
                      showProntuario={true}
                      onProntuarioClick={(agendamento) => handleViewProntuario(agendamento)}
                      isPortalMedico={true}
                      showPrintButton={false}
                      hidePaymentInfo={true}
                      hideCancelAction={true}
                      emptyMessage="Nenhum agendamento atrasado"
                    />

                    {/* Concluídos */}
                    <AgendaSection
                      title="Concluídos"
                      agendamentos={agendamentosConcluidos}
                      onUpdate={handleManualRefresh}
                      variant="success"
                      showPrintButton={false}
                      hidePaymentInfo={true}
                      hideCancelAction={true}
                      showProntuario={true}
                       onProntuarioClick={(agendamento) => handleViewProntuario(agendamento)}
                      isPortalMedico={true}
                      emptyMessage="Nenhuma consulta concluída"
                    />

                    {/* Cancelados/Perdidos */}
                    <AgendaSection
                      title="Cancelados/Perdidos"
                      agendamentos={agendamentosCancelados}
                      onUpdate={handleManualRefresh}
                      variant="default"
                      showPrintButton={false}
                      hidePaymentInfo={true}
                      hideCancelAction={true}
                      showProntuario={true}
                      onProntuarioClick={(agendamento) => handleViewProntuario(agendamento)}
                      isPortalMedico={true}
                      emptyMessage="Nenhum agendamento cancelado"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'prontuarios' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Prontuários dos Meus Pacientes</span>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou CPF..."
                    value={searchTermPacientes}
                    onChange={(e) => setSearchTermPacientes(e.target.value)}
                    className="pl-9 w-80"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading2 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p>Carregando prontuários...</p>
                </div>
              ) : filteredPacientes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTermPacientes ? 'Nenhum prontuário encontrado para a busca' : 'Nenhum prontuário encontrado'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPacientes.map((paciente: any) => (
                    <PatientCard
                      key={paciente.id}
                      patient={paciente}
                      onView={() => handleViewProntuario(paciente)}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'exames' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Exames Realizados</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou CPF do paciente..."
                    value={searchTermExames}
                    onChange={(e) => setSearchTermExames(e.target.value)}
                    className="pl-9 w-80"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading2 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Carregando exames...</p>
                </div>
              ) : filteredExames.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTermExames ? 'Nenhum exame encontrado para a busca' : 'Nenhum exame encontrado'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExames.map((exame: any) => (
                    <div key={exame.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{exame.tipo}</h3>
                          <p className="text-gray-600">
                            Paciente: {exame.pacientes?.nome}
                          </p>
                          <p className="text-sm text-gray-500">
                            CPF: {exame.pacientes?.cpf}
                          </p>
                          <p className="text-sm text-gray-500">
                            Data: {formatDate(exame.data_exame)}
                          </p>
                          {exame.comentarios && (
                            <p className="text-sm text-gray-600 mt-2">
                              Comentários: {exame.comentarios}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          <div>
                            <Badge className="bg-purple-100 text-purple-800">{exame.status}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleViewExame(exame)}
                              size="sm"
                              variant="outline"
                              className="border-purple-600 text-purple-600 hover:bg-purple-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button
                              onClick={() => handleEditExame(exame)}
                              size="sm"
                              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'receitas' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Receitas Médicas</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou CPF do paciente..."
                      value={searchTermReceitas}
                      onChange={(e) => setSearchTermReceitas(e.target.value)}
                      className="pl-9 w-80"
                    />
                  </div>
                  <Button
                    onClick={() => setIsReceitaModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Receita
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading2 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Carregando receitas...</p>
                </div>
              ) : filteredReceitas.length === 0 ? (
                <div className="text-center py-8">
                  <FileX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTermReceitas ? 'Nenhuma receita encontrada para a busca' : 'Nenhuma receita encontrada'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReceitas.map((receita: any) => (
                    <div key={receita.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">Receita Médica</h3>
                          <p className="text-gray-600">
                            Paciente: {receita.pacientes?.nome || 'Carregando...'}
                          </p>
                          <p className="text-sm text-gray-500">
                            CPF: {receita.pacientes?.cpf || 'Carregando...'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Data: {formatDate(receita.data_emissao)}
                          </p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {receita.medicamentos.length > 100 
                              ? `${receita.medicamentos.substring(0, 100)}...` 
                              : receita.medicamentos}
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleViewReceita(receita)}
                              size="sm"
                              variant="outline"
                              className="border-purple-600 text-purple-600 hover:bg-purple-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Visualizar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'atestados' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Atestados Médicos</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou CPF do paciente..."
                      value={searchTermAtestados}
                      onChange={(e) => setSearchTermAtestados(e.target.value)}
                      className="pl-9 w-80"
                    />
                  </div>
                  <Button
                    onClick={() => setIsAtestadoModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Atestado
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading2 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Carregando atestados...</p>
                </div>
              ) : filteredAtestados.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTermAtestados ? 'Nenhum atestado encontrado para a busca' : 'Nenhum atestado encontrado'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAtestados.map((atestado: any) => (
                    <div key={atestado.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">Atestado Médico</h3>
                          <p className="text-gray-600">
                            Paciente: {atestado.pacientes?.nome || 'Carregando...'}
                          </p>
                          <p className="text-sm text-gray-500">
                            CPF: {atestado.pacientes?.cpf || 'Carregando...'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Data de Emissão: {formatDate(atestado.data_emissao)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Afastamento: {formatDate(atestado.data_inicio_afastamento)} a {formatDate(atestado.data_fim_afastamento)} ({atestado.dias_afastamento} dias)
                          </p>
                          {atestado.cid && (
                            <p className="text-sm text-gray-600">
                              CID: {atestado.cid}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {atestado.observacoes.length > 100 
                              ? `${atestado.observacoes.substring(0, 100)}...` 
                              : atestado.observacoes}
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleViewAtestado(atestado)}
                              size="sm"
                              variant="outline"
                              className="border-purple-600 text-purple-600 hover:bg-purple-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button
                              onClick={() => handleViewAtestado(atestado)}
                              size="sm"
                              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700"
                            >
                              <Printer className="h-4 w-4 mr-1" />
                              Imprimir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'telemedicina' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Teleconsultas Agendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agendamentos.filter(ag => ag.eh_telemedicina).length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma teleconsulta agendada</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Teleconsultas aparecerão aqui quando agendadas com a opção "Telemedicina"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agendamentos
                      .filter(ag => ag.eh_telemedicina)
                      .sort((a, b) => new Date(a.data_agendamento).getTime() - new Date(b.data_agendamento).getTime())
                      .map((agendamento) => (
                        <MedicoAgendamentoCard
                          key={agendamento.id}
                          agendamento={agendamento}
                          onStatusChange={handleManualRefresh}
                          hidePaymentInfo={true}
                          hideCancelAction={true}
                          showProntuario={true}
                          onProntuarioClick={handleViewProntuario}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instruções para Telemedicina */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Como Usar a Telemedicina</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">🎯 Para Consultas de Telemedicina:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• O botão "📹 Videochamada" aparece nos agendamentos marcados como telemedicina</li>
                    <li>• Acesso liberado 15 minutos antes do horário agendado</li>
                    <li>• Clique no botão para entrar na sala de videochamada</li>
                    <li>• Use fones de ouvido para melhor qualidade de áudio</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Requisitos Técnicos:</h4>
                  <ul className="space-y-1 text-green-700">
                    <li>• Conexão estável de internet (mínimo 2 Mbps)</li>
                    <li>• Navegador atualizado (Chrome, Firefox, Safari, Edge)</li>
                    <li>• Câmera e microfone funcionando</li>
                    <li>• Ambiente silencioso e bem iluminado</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Configuração Daily.co:</h4>
                  <p className="text-yellow-700">
                    Para que as videochamadas funcionem, a API Key do Daily.co deve estar configurada nos secrets do Supabase. 
                    Consulte a documentação de telemedicina para mais detalhes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ExameViewModal
        isOpen={isExameModalOpen}
        onClose={() => setIsExameModalOpen(false)}
        exame={selectedExame}
      />

      <ExamEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        exame={exameToEdit}
        onSuccess={handleManualRefresh}
      />

      <ReceitaModal
        isOpen={isReceitaModalOpen}
        onClose={() => setIsReceitaModalOpen(false)}
        medicoId={medico?.id || ''}
        clinicaId={medico?.clinica_id || ''}
        onSuccess={handleManualRefresh}
      />

      <ReceitaViewModal
        isOpen={isReceitaViewModalOpen}
        onClose={() => setIsReceitaViewModalOpen(false)}
        receita={selectedReceita}
      />

      <ProntuarioModal
        isOpen={isProntuarioModalOpen}
        onClose={() => setIsProntuarioModalOpen(false)}
        paciente={selectedPaciente}
        showAddReceitaButton={true}
        onAddReceita={handleAddReceita}
      />

      <ReceitaModal
        isOpen={isAddReceitaModalOpen}
        onClose={() => setIsAddReceitaModalOpen(false)}
        medicoId={medico?.id || ''}
        clinicaId={medico?.clinica_id || ''}
        onSuccess={() => {
          setIsAddReceitaModalOpen(false);
          handleManualRefresh();
        }}
      />

      <AtestadoModal
        isOpen={isAtestadoModalOpen}
        onClose={() => setIsAtestadoModalOpen(false)}
        medicoId={medico?.id || ''}
        onSuccess={handleManualRefresh}
      />

      <AtestadoViewModal
        isOpen={isAtestadoViewModalOpen}
        onClose={() => setIsAtestadoViewModalOpen(false)}
        atestado={selectedAtestado}
        clinica={null}
      />
    </div>
  );
};

export default PortalMedico;
