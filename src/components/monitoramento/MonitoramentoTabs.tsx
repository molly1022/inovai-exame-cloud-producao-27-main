
import { Button } from "@/components/ui/button";
import { Activity, Clock, Calendar, BarChart, Timer } from "lucide-react";
import type { AbaTipo } from '@/types/monitoramento';

interface MonitoramentoTabsProps {
  abaSelecionada: AbaTipo;
  setAbaSelecionada: (aba: AbaTipo) => void;
}

export const MonitoramentoTabs = ({ abaSelecionada, setAbaSelecionada }: MonitoramentoTabsProps) => {
  return (
    <div className="mb-4">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
        <Button
          variant={abaSelecionada === 'logs' ? 'default' : 'ghost'}
          onClick={() => setAbaSelecionada('logs')}
          className="rounded-md whitespace-nowrap"
        >
          <Activity className="h-4 w-4 mr-2" />
          Logs de Atividades
        </Button>
        <Button
          variant={abaSelecionada === 'sessoes' ? 'default' : 'ghost'}
          onClick={() => setAbaSelecionada('sessoes')}
          className="rounded-md whitespace-nowrap"
        >
          <Clock className="h-4 w-4 mr-2" />
          Sessões de Login
        </Button>
        <Button
          variant={abaSelecionada === 'horarios' ? 'default' : 'ghost'}
          onClick={() => setAbaSelecionada('horarios')}
          className="rounded-md whitespace-nowrap"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Horários de Trabalho
        </Button>
        <Button
          variant={abaSelecionada === 'produtividade' ? 'default' : 'ghost'}
          onClick={() => setAbaSelecionada('produtividade')}
          className="rounded-md whitespace-nowrap"
        >
          <BarChart className="h-4 w-4 mr-2" />
          Produtividade
        </Button>
        <Button
          variant={abaSelecionada === 'historico' ? 'default' : 'ghost'}
          onClick={() => setAbaSelecionada('historico')}
          className="rounded-md whitespace-nowrap"
        >
          <Timer className="h-4 w-4 mr-2" />
          Histórico Completo
        </Button>
      </div>
    </div>
  );
};
