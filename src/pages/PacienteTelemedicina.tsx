import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Clock, User, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { validarUrlTeleconsulta } from '@/utils/teleconsultaUtils';

interface TeleconsultaData {
  id: string;
  sala_id: string;
  url_medico: string;
  url_paciente: string;
  status: string;
  agendamento: {
    id: string;
    data_agendamento: string;
    horario: string;
    tipo_exame: string;
    paciente: {
      nome: string;
      cpf: string;
    };
    medico: {
      nome_completo: string;
      especialidade?: string;
    };
  };
  pode_acessar?: boolean;
  minutos_restantes?: number;
}

const PacienteTelemedicina = () => {
  const { agendamento_id } = useParams();
  const navigate = useNavigate();
  const [teleconsulta, setTeleconsulta] = useState<TeleconsultaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [consultaIniciada, setConsultaIniciada] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [urlValidada, setUrlValidada] = useState(false);
  
  // Pegar CPF e senha da URL ou localStorage
  const urlParams = new URLSearchParams(location.search);
  const cpfFromUrl = urlParams.get('cpf');
  const senhaFromUrl = urlParams.get('senha');
  
  const [formData, setFormData] = useState({
    cpf: cpfFromUrl || localStorage.getItem('paciente_cpf') || '',
    senha: senhaFromUrl || (cpfFromUrl ? cpfFromUrl.replace(/\D/g, '') : '') || localStorage.getItem('paciente_senha') || ''
  });

  useEffect(() => {
    if (formData.cpf && formData.senha && agendamento_id) {
      // Se temos credenciais, tentar autenticar automaticamente
      handleAuth();
    }
  }, [agendamento_id]);

  // Validar URL quando teleconsulta for carregada
  useEffect(() => {
    if (teleconsulta?.url_paciente && consultaIniciada) {
      validarUrlTeleconsulta(teleconsulta.url_paciente)
        .then(setUrlValidada)
        .catch(() => setUrlValidada(false));
    }
  }, [teleconsulta?.url_paciente, consultaIniciada]);

  const handleAuth = async () => {
    try {
      setLoading(true);

      // Demo: simular autenticação
      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      
      if (!cpfLimpo || cpfLimpo.length !== 11) {
        toast.error('CPF deve ter 11 dígitos');
        return;
      }

      if (formData.senha !== cpfLimpo) {
        toast.error('Senha incorreta. Use seu CPF como senha.');
        return;
      }

      // Simular dados de teleconsulta
      const teleconsultaData = {
        id: 'demo-teleconsulta-1',
        sala_id: 'demo-room-123',
        url_medico: 'https://inovai.daily.co/demo-room-123?t=medico',
        url_paciente: 'https://inovai.daily.co/demo-room-123?t=paciente',
        status: 'agendada',
        agendamento: {
          id: agendamento_id || 'demo-agenda-1',
          data_agendamento: new Date().toISOString(),
          horario: '14:30',
          tipo_exame: 'Consulta Médica',
          paciente: {
            nome: 'João Silva Demo',
            cpf: cpfLimpo
          },
          medico: {
            nome_completo: 'Dr. Pedro Santos Demo',
            especialidade: 'Clínico Geral'
          }
        },
        pode_acessar: true,
        minutos_restantes: 0
      };

      setTeleconsulta(teleconsultaData);
      setAuthenticated(true);
      toast.success('Acesso autorizado!');

    } catch (error) {
      console.error('Erro ao autenticar:', error);
      toast.error('Erro ao verificar credenciais');
    } finally {
      setLoading(false);
    }
  };

  const entrarNaConsulta = async () => {
    if (!teleconsulta) return;

    try {
      toast.info('Entrando na consulta...');
      
      // Garantir que existe uma sala criada
      if (!teleconsulta.url_paciente || !teleconsulta.sala_id) {
        console.log('🔗 URLs não encontradas, solicitando criação de sala...');
        toast.info('🔄 Aguardando médico criar a sala de videochamada...');
        
        // Tentar criar sala (caso médico ainda não tenha criado)
        const { data: salaData, error: criarSalaError } = await supabase.functions.invoke('create-daily-room', {
          body: {
            agendamento_id: agendamento_id
          }
        });

        if (criarSalaError) {
          console.warn('⚠️ Não foi possível criar sala (normal se médico não iniciou):', criarSalaError);
          toast.warning('Aguarde o médico iniciar a consulta para liberar o acesso');
          return;
        }

        if (salaData?.success) {
          console.log('✅ Sala encontrada/criada:', salaData);
          toast.success('Sala encontrada! Recarregando...');
        }

        // Aguardar e recarregar dados
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }

      // Demo: simular registro de entrada
      console.log('Demo: Paciente entrou na teleconsulta:', teleconsulta.id);

      setConsultaIniciada(true);
      toast.success('✅ Conectado à videochamada!');
      
    } catch (error) {
      console.error('❌ Erro ao entrar na consulta:', error);
      toast.error('Erro ao entrar na consulta');
    }
  };

  const sairDaConsulta = () => {
    setConsultaIniciada(false);
    toast.info('Você saiu da consulta');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center gap-2 justify-center">
              <Lock className="h-6 w-6" />
              Acesso à Teleconsulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
               <Label htmlFor="cpf">CPF</Label>
               <Input
                 id="cpf"
                 placeholder="000.000.000-00"
                 value={formData.cpf}
                 onChange={(e) => {
                   const cpf = e.target.value;
                   setFormData(prev => ({ 
                     ...prev, 
                     cpf: cpf,
                     senha: cpf.replace(/\D/g, '') // Automaticamente preenche a senha com CPF
                   }));
                 }}
               />
             </div>
            <div>
              <Label htmlFor="senha">Senha de Acesso</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite seu CPF (apenas números)"
                value={formData.senha}
                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                A senha é seu CPF apenas com números
              </p>
            </div>
            <Button 
              onClick={handleAuth}
              disabled={!formData.cpf || !formData.senha}
              className="w-full"
            >
              Acessar Teleconsulta
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Use seu CPF como login e senha (apenas números)
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teleconsulta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <p>Teleconsulta não encontrada ou você não tem acesso a ela.</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDateTime = (date: string, time: string) => {
    const formattedDate = new Date(date).toLocaleDateString('pt-BR');
    return `${formattedDate} às ${time}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-500';
      case 'em_andamento': return 'bg-green-500';
      case 'concluida': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const canAccessNow = teleconsulta.pode_acessar || teleconsulta.status !== 'finalizada';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-6 w-6" />
                  Portal do Paciente - Teleconsulta
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {teleconsulta.agendamento.paciente.nome}
                </p>
              </div>
              <Badge className={getStatusColor(teleconsulta.status)}>
                {teleconsulta.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Informações da Consulta */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Médico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{teleconsulta.agendamento.medico.nome_completo}</p>
              <p className="text-sm text-muted-foreground">{teleconsulta.agendamento.medico.especialidade}</p>
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
                {formatDateTime(teleconsulta.agendamento.data_agendamento, teleconsulta.agendamento.horario)}
              </p>
              <p className="text-sm text-muted-foreground">{teleconsulta.agendamento.tipo_exame}</p>
            </CardContent>
          </Card>
        </div>

        {/* Status de Acesso */}
        {!canAccessNow && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  Acesso será liberado 15 minutos antes do horário agendado
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Faltam {teleconsulta.minutos_restantes} minutos para liberação do acesso
              </p>
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
                <h3 className="text-xl font-semibold mb-2">Pronto para a consulta</h3>
                <p className="text-muted-foreground mb-6">
                  {teleconsulta.url_paciente ? 
                    'Clique no botão abaixo para entrar na videochamada' :
                    'Aguarde o médico iniciar a consulta para liberar o acesso'
                  }
                </p>
                <Button 
                  onClick={entrarNaConsulta}
                  disabled={!canAccessNow}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Video className="h-5 w-5 mr-2" />
                  {teleconsulta.url_paciente ? 'Entrar na Consulta' : 'Aguardar Médico'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Iframe Daily.co com validação melhorada */}
                {teleconsulta.url_paciente && urlValidada ? (
                  <div className="space-y-2">
                    <iframe
                      src={teleconsulta.url_paciente}
                      allow="microphone; camera; display-capture; fullscreen"
                      className="w-full aspect-video rounded-lg border"
                      style={{ minHeight: '500px' }}
                      title="Videochamada Daily.co"
                      onLoad={() => console.log('✅ Iframe paciente carregado com sucesso')}
                      onError={() => {
                        console.error('❌ Erro ao carregar iframe do paciente');
                        toast.error('Erro ao carregar videochamada');
                      }}
                    />
                    <div className="text-center">
                      <p className="text-sm text-blue-600">
                        ✅ Conectado à sala: {teleconsulta.sala_id}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Video className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg font-semibold">
                        {teleconsulta.url_paciente ? 'Validando acesso...' : 'Conectando à videochamada...'}
                      </p>
                      <p className="text-sm opacity-90">
                        {teleconsulta.url_paciente ? 
                          'Verificando se a sala está disponível...' : 
                          'Aguarde um momento'
                        }
                      </p>
                      <Button 
                        onClick={() => {
                          console.log('🔄 Recarregando página do paciente...');
                          window.location.reload();
                        }} 
                        variant="outline" 
                        className="mt-4 text-white border-white hover:bg-white hover:text-blue-600"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                      </Button>
                    </div>
                  </div>
                )}

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
                    variant="destructive"
                    size="lg"
                    onClick={sairDaConsulta}
                  >
                    <PhoneOff className="h-5 w-5 mr-2" />
                    Sair da Consulta
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções para Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções para a Teleconsulta</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Antes da consulta:</strong> Teste sua câmera e microfone</p>
            <p>• <strong>Ambiente:</strong> Escolha um local silencioso e bem iluminado</p>
            <p>• <strong>Conexão:</strong> Certifique-se de ter uma boa conexão com a internet</p>
            <p>• <strong>Privacidade:</strong> Garanta que não será interrompido durante a consulta</p>
            <p>• <strong>Dispositivos:</strong> Use fones de ouvido para melhor qualidade de áudio</p>
            <p>• <strong>Documentos:</strong> Tenha em mãos exames e medicamentos para mostrar ao médico</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PacienteTelemedicina;