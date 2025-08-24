
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Activity, Eye } from "lucide-react";
import { format } from 'date-fns';
import type { FuncionarioLog, FuncionarioSessao } from '@/types/monitoramento';

interface MonitoramentoCardsProps {
  funcionarios: any[];
  sessoes: FuncionarioSessao[];
  logs: FuncionarioLog[];
}

export const MonitoramentoCards = ({ funcionarios, sessoes, logs }: MonitoramentoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Funcionários Ativos</p>
              <p className="text-2xl font-bold">{funcionarios.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessões Ativas</p>
              <p className="text-2xl font-bold">{sessoes.filter(s => s.ativa).length}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ações Hoje</p>
              <p className="text-2xl font-bold">
                {logs.filter(log => 
                  format(new Date(log.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                ).length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Logs</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
            <Eye className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
