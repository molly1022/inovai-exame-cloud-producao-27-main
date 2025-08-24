import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, Users, Play, Settings, Monitor, TestTube, ExternalLink, AlertCircle } from 'lucide-react';
import { FeaturePageGate } from '@/components/FeaturePageGate';
import { TeleconsultaLimitsCard } from '@/components/TeleconsultaLimitsCard';

import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';
import { useToast } from '@/hooks/use-toast';

// Tipo simplificado para evitar inferência infinita
interface TeleconsultaSimple {
  id: string;
  sala_id: string;
  status: string;
  data_inicio?: string;
  url_medico: string;
  url_paciente: string;
  agendamento_id: string;
  created_at: string;
}

const Telemedicina = () => {
  const [teleconsultas, setTeleconsultas] = useState<TeleconsultaSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const { clinica } = useClinica();
  const { toast } = useToast();

  useEffect(() => {
    fetchTeleconsultas();
  }, [clinica]);

  const fetchTeleconsultas = async () => {
    if (!clinica?.id) return;

    try {
      console.log('🔍 Simulando busca de teleconsultas para clínica:', clinica.id);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data para teleconsultas
      const mockTeleconsultas: TeleconsultaSimple[] = [
        {
          id: '1',
          sala_id: 'sala_demo_1',
          status: 'agendada',
          url_medico: 'https://demo.daily.co/sala_demo_1?role=moderator',
          url_paciente: 'https://demo.daily.co/sala_demo_1?role=participant',
          agendamento_id: 'agend_1',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          sala_id: 'sala_demo_2',
          status: 'finalizada',
          data_inicio: new Date(Date.now() - 3600000).toISOString(),
          url_medico: 'https://demo.daily.co/sala_demo_2?role=moderator',
          url_paciente: 'https://demo.daily.co/sala_demo_2?role=participant',
          agendamento_id: 'agend_2',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      
      setTeleconsultas(mockTeleconsultas);
      toast({
        title: "Teleconsultas carregadas",
        description: "Dados carregados em modo demonstração"
      });
    } catch (error) {
      console.error('Erro ao buscar teleconsultas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar teleconsultas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const criarTeleconsulta = async (agendamentoId: string, medicoId: string, pacienteId: string) => {
    if (!clinica?.id) return;

    try {
      console.log('📞 Simulando criação de teleconsulta:', { agendamentoId, medicoId, pacienteId });
      const salaId = `sala_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simular criação de nova teleconsulta
      const novaTeleconsulta: TeleconsultaSimple = {
        id: `tc_${Date.now()}`,
        sala_id: salaId,
        status: 'agendada',
        url_medico: `${window.location.origin}/telemedicina/medico/${salaId}`,
        url_paciente: `${window.location.origin}/telemedicina/paciente/${salaId}`,
        agendamento_id: agendamentoId,
        created_at: new Date().toISOString()
      };

      setTeleconsultas(prev => [novaTeleconsulta, ...prev]);

      toast({
        title: "Teleconsulta criada",
        description: "Sala de teleconsulta criada com sucesso (modo demonstração)"
      });
    } catch (error) {
      console.error('Erro ao criar teleconsulta:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar teleconsulta",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-100 text-blue-800';
      case 'iniciada': return 'bg-green-100 text-green-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'finalizada': return 'bg-gray-100 text-gray-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      agendada: 'Agendada',
      iniciada: 'Iniciada',
      em_andamento: 'Em Andamento',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada',
      nao_compareceu_medico: 'Médico Faltou',
      nao_compareceu_paciente: 'Paciente Faltou'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de telemedicina...</p>
        </div>
      </div>
    );
  }

  return (
    <FeaturePageGate 
      feature="telemedicina"
      featureName="Telemedicina"
      description="Sistema completo de teleconsultas com videoconferência integrada."
      requiredPlan="intermediario"
    >
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Video className="h-6 w-6" />
              Telemedicina
            </h1>
            <p className="text-gray-600">Consultas por videoconferência</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.open('/telemedicina-diagnostico', '_blank')}
            >
              <TestTube className="h-4 w-4 mr-2" />
              Diagnóstico
            </Button>
          </div>
        </div>

        {/* Alerta de configuração */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Configure a API Daily.co</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Para usar a telemedicina, você precisa configurar sua chave API do Daily.co. 
                Isso permite videochamadas entre médicos e pacientes.
              </p>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  onClick={() => window.open('https://dashboard.daily.co/signup', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Criar Conta Daily.co
                </Button>
                <Button 
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={() => window.open('https://supabase.com/dashboard/project/sxtqlnayloetwlcjtkbj/settings/functions', '_blank')}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Configurar API
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Limites */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TeleconsultaLimitsCard />
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Agendadas</p>
                  <p className="text-2xl font-bold">
                    {teleconsultas.filter(t => t.status === 'agendada').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Em Andamento</p>
                  <p className="text-2xl font-bold">
                    {teleconsultas.filter(t => ['iniciada', 'em_andamento'].includes(t.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Finalizadas</p>
                  <p className="text-2xl font-bold">
                    {teleconsultas.filter(t => t.status === 'finalizada').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{teleconsultas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Teleconsultas */}
        <Card>
          <CardHeader>
            <CardTitle>Teleconsultas Recentes</CardTitle>
            <CardDescription>
              Gerencie suas consultas por videoconferência
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teleconsultas.length === 0 ? (
              <div className="text-center py-8">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma teleconsulta encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece criando teleconsultas a partir dos agendamentos
                </p>
                <Button onClick={() => window.location.href = '/agenda'}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Ir para Agenda
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {teleconsultas.map((teleconsulta) => (
                  <div
                    key={teleconsulta.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            Sala: {teleconsulta.sala_id}
                          </h3>
                          <Badge className={getStatusColor(teleconsulta.status)}>
                            {formatStatus(teleconsulta.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Agendamento ID:</span><br />
                            {teleconsulta.agendamento_id}
                          </div>
                          <div>
                            <span className="font-medium">Criado em:</span><br />
                            {new Date(teleconsulta.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Sala:</span><br />
                            {teleconsulta.sala_id}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {teleconsulta.status === 'agendada' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(teleconsulta.url_medico, '_blank')}
                            >
                              <Monitor className="h-4 w-4 mr-1" />
                              Portal Médico
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => window.open(teleconsulta.url_paciente, '_blank')}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Portal Paciente
                            </Button>
                          </>
                        )}
                        
                        {['iniciada', 'em_andamento'].includes(teleconsulta.status) && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => window.open(teleconsulta.url_medico, '_blank')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Entrar na Consulta
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Como usar a Telemedicina</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ol className="list-decimal list-inside space-y-2">
              <li>Configure a teleconsulta a partir de um agendamento existente</li>
              <li>Compartilhe o link do Portal do Paciente com o paciente</li>
              <li>Use o Portal do Médico para iniciar e conduzir a consulta</li>
              <li>Utilize as ferramentas de chat, compartilhamento de tela e gravação</li>
              <li>Finalize a consulta e acesse as gravações no histórico</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </FeaturePageGate>
  );
};

export default Telemedicina;