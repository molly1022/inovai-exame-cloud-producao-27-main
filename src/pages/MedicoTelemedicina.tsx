import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMedicoAuth } from '@/hooks/useMedicoAuth';
import { useTeleconsultaAccess } from '@/hooks/useTeleconsultaAccess';
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, PhoneOff, Clock, User, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

const MedicoTelemedicina = () => {
  const { agendamento_id } = useParams();
  const navigate = useNavigate();
  const { medico } = useMedicoAuth();
  const [consultaIniciada, setConsultaIniciada] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  
  // Usar hook de controle de acesso (mock)
  const { verificarAcesso, iniciarTeleconsulta, loading } = useTeleconsultaAccess();
  
  // Dados mock para demonstração
  const teleconsultaMock = {
    id: agendamento_id || 'mock-id',
    sala_id: 'sala-demo-123',
    url_medico: 'https://exemplo-teleconsulta.com/room/123',
    status: consultaIniciada ? 'em_andamento' : 'agendada',
    agendamento: {
      id: agendamento_id || 'mock-agendamento',
      data_agendamento: new Date().toISOString(),
      paciente: { nome: 'Maria da Silva' },
      medico: { nome_completo: 'Dr. João Silva' }
    }
  };

  useEffect(() => {
    if (!medico) {
      navigate('/portal-medico');
      return;
    }
  }, [medico, navigate]);

  const iniciarConsulta = async () => {
    try {
      setConsultaIniciada(true);
      toast.success('✅ Consulta iniciada! Demonstração de telemedicina ativa.');
    } catch (error) {
      console.error('❌ Erro ao iniciar consulta:', error);
      toast.error('Erro ao iniciar a consulta');
    }
  };

  const encerrarConsulta = async () => {
    try {
      setConsultaIniciada(false);
      toast.success('Consulta encerrada com sucesso!');
      navigate('/portal-medico');
    } catch (error) {
      console.error('Erro ao encerrar consulta:', error);
      toast.error('Erro ao encerrar a consulta');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando teleconsulta...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-500';
      case 'em_andamento': return 'bg-green-500';
      case 'concluida': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-6 w-6" />
                  Portal do Médico - Telemedicina
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Dr(a). {medico?.nome_completo}
                </p>
              </div>
              <Badge className={getStatusColor(teleconsultaMock.status)}>
                {teleconsultaMock.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Informações da Consulta */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{teleconsultaMock.agendamento.paciente.nome}</p>
              <p className="text-sm text-muted-foreground">Paciente da teleconsulta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">
                {new Date(teleconsultaMock.agendamento.data_agendamento).toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-muted-foreground">Teleconsulta agendada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5" />
                Sala Virtual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Sala: {teleconsultaMock.sala_id}</p>
              <p className="text-sm text-green-600">
                ✅ Sistema pronto para videochamada
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status de Acesso */}
        {!consultaIniciada && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <Video className="h-5 w-5" />
                <span className="font-medium">
                  ✅ Acesso liberado - Consulta pode ser iniciada
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Área de Videochamada */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Videochamada</CardTitle>
          </CardHeader>
          <CardContent>
            {!consultaIniciada ? (
              <div className="text-center py-12">
                <Video className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Pronto para iniciar a consulta</h3>
                <p className="text-muted-foreground mb-6">
                  Clique no botão abaixo para iniciar e entrar na videochamada
                </p>
                <Button 
                  onClick={iniciarConsulta}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Video className="h-5 w-5 mr-2" />
                  Iniciar Consulta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Simulação da videochamada */}
                <div className="aspect-video bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <Video className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Consulta Iniciada ✅</p>
                    <p className="text-sm opacity-90">
                      Demonstração da interface de telemedicina
                    </p>
                    <p className="text-xs opacity-75 mt-2">
                      URL da sala: {teleconsultaMock.url_medico}
                    </p>
                  </div>
                </div>

                {/* Controles da Videochamada */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={videoEnabled ? "default" : "destructive"}
                    size="lg"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                  >
                    {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant={audioEnabled ? "default" : "destructive"}
                    size="lg"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                  >
                    {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant={screenSharing ? "default" : "outline"}
                    size="lg"
                    onClick={() => setScreenSharing(!screenSharing)}
                  >
                    {screenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={encerrarConsulta}
                  >
                    <PhoneOff className="h-5 w-5 mr-2" />
                    Encerrar Consulta
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão Prontuário durante consulta */}
        {consultaIniciada && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    // Abrir prontuário (mock)
                    toast.info('Abrir prontuário do paciente (demonstração)');
                    window.open('/prontuarios', '_blank', 'width=1200,height=800');
                  }}
                  className="bg-white hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Abrir Prontuário do Paciente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções para Médicos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Iniciar:</strong> Clique em "Iniciar Consulta" para criar/entrar na sala</p>
            <p>• <strong>Prontuário:</strong> Use o botão "Prontuário" durante a consulta para acessar dados do paciente</p>
            <p>• <strong>Áudio/Vídeo:</strong> Teste sua câmera e microfone antes de iniciar</p>
            <p>• <strong>Ambiente:</strong> Mantenha boa iluminação e local silencioso</p>
            <p>• <strong>Encerrar:</strong> Sempre clique em "Encerrar Consulta" ao finalizar</p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                <strong>Modo Demonstração:</strong> Esta é uma simulação do sistema de telemedicina. 
                Na versão operacional, aqui seria exibida a videochamada real com Daily.co.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicoTelemedicina;