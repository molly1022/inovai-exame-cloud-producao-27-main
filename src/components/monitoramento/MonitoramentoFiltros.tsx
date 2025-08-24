
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import type { AbaTipo } from '@/types/monitoramento';

interface MonitoramentoFiltrosProps {
  funcionarios: any[];
  filtroFuncionario: string;
  setFiltroFuncionario: (value: string) => void;
  filtroAcao: string;
  setFiltroAcao: (value: string) => void;
  filtroDataInicio: string;
  setFiltroDataInicio: (value: string) => void;
  filtroDataFim: string;
  setFiltroDataFim: (value: string) => void;
  abaSelecionada: AbaTipo;
  aplicarFiltros: () => void;
  limparFiltros: () => void;
}

export const MonitoramentoFiltros = ({
  funcionarios,
  filtroFuncionario,
  setFiltroFuncionario,
  filtroAcao,
  setFiltroAcao,
  filtroDataInicio,
  setFiltroDataInicio,
  filtroDataFim,
  setFiltroDataFim,
  abaSelecionada,
  aplicarFiltros,
  limparFiltros
}: MonitoramentoFiltrosProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <Label htmlFor="funcionario">Funcionário</Label>
            <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os funcionários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os funcionários</SelectItem>
                {funcionarios.map((funcionario) => (
                  <SelectItem key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(abaSelecionada === 'logs' || abaSelecionada === 'historico') && (
            <div>
              <Label htmlFor="acao">Ação</Label>
              <Select value={filtroAcao} onValueChange={setFiltroAcao}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as ações</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="CREATE_PATIENT">Criar Paciente</SelectItem>
                  <SelectItem value="UPDATE_PATIENT">Editar Paciente</SelectItem>
                  <SelectItem value="CREATE_EXAM">Criar Exame</SelectItem>
                  <SelectItem value="UPDATE_EXAM">Editar Exame</SelectItem>
                  <SelectItem value="CREATE_APPOINTMENT">Criar Agendamento</SelectItem>
                  <SelectItem value="UPDATE_APPOINTMENT">Editar Agendamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="data-inicio">Data Início</Label>
            <Input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="data-fim">Data Fim</Label>
            <Input
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={aplicarFiltros} className="flex-1">
              Aplicar
            </Button>
            <Button variant="outline" onClick={limparFiltros}>
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
