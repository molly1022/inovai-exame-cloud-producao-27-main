import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Send, 
  Settings, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";
import { useEmailControl } from "@/hooks/useEmailControl";
import { useNavigate } from "react-router-dom";
import MiniSparkline from './MiniSparkline';

const EmailControlCard = () => {
  const {
    stats,
    loading,
    enviandoManual,
    enviarLembretesAgora,
    alternarSistema,
    recarregarStats
  } = useEmailControl();
  
  const navigate = useNavigate();

  const getStatusColor = () => {
    if (stats.sistemaAtivo) return "bg-green-500";
    return "bg-yellow-500";
  };

  const getStatusText = () => {
    if (stats.sistemaAtivo) return "Ativo";
    return "Pausado";
  };

  // Dados para o mini gráfico (simular histórico de envios)
  const chartData = [
    stats.lembretesEnviadosHoje > 0 ? stats.lembretesEnviadosHoje - 3 : 0,
    stats.lembretesEnviadosHoje > 0 ? stats.lembretesEnviadosHoje - 1 : 0,
    stats.lembretesEnviadosHoje,
    stats.proximosLembretes
  ];

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 overflow-hidden animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-cyan-700 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Lembretes por Email
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
          <Badge variant="outline" className="text-xs">
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="space-y-3">
          {/* Estatísticas principais */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-cyan-900">{stats.proximosLembretes}</div>
              <p className="text-xs text-cyan-600 mt-1 truncate">Próximos lembretes</p>
            </div>
            <div className="w-16 flex-shrink-0">
              <MiniSparkline data={chartData} color="#0891B2" />
            </div>
          </div>


          {/* Botões de ação */}
          <div className="flex gap-1 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={enviarLembretesAgora}
              disabled={enviandoManual || stats.proximosLembretes === 0}
            >
              {enviandoManual ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2"
              onClick={() => alternarSistema()}
            >
              {stats.sistemaAtivo ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2"
              onClick={() => navigate('/configuracao-emails')}
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>

          {/* Alerta se sistema pausado */}
          {!stats.sistemaAtivo && (
            <div className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 p-1 rounded">
              <AlertCircle className="h-3 w-3" />
              <span>Sistema pausado</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailControlCard;