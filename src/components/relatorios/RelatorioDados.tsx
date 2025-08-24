
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

interface RelatorioDadosProps {
  type: 'pacientes' | 'exames' | 'agendamentos' | 'convenios' | 'faturamento';
  data: any[];
  loading: boolean;
  title: string;
}

const RelatorioDados = ({ type, data, loading, title }: RelatorioDadosProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderPacientes = () => (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 mb-3">Total: {data.length} pacientes</div>
      <ScrollArea className="h-96">
        {data.map((paciente: any) => (
          <div key={paciente.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
            <div>
              <h4 className="font-medium">{paciente.nome}</h4>
              <p className="text-sm text-gray-600">CPF: {paciente.cpf}</p>
              <p className="text-sm text-gray-600">
                Convênio: {paciente.convenios?.nome || 'Particular'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date(paciente.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );

  const renderExames = () => (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 mb-3">Total: {data.length} exames</div>
      <ScrollArea className="h-96">
        {data.map((exame: any) => (
          <div key={exame.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
            <div>
              <h4 className="font-medium">{exame.tipo}</h4>
              <p className="text-sm text-gray-600">Paciente: {exame.pacientes?.nome}</p>
              <p className="text-sm text-gray-600">Médico: {exame.medicos?.nome_completo || 'N/A'}</p>
            </div>
            <div className="text-right">
              <Badge variant={exame.status === 'disponivel' ? 'default' : 'secondary'}>
                {exame.status}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(exame.data_exame).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );

  const renderAgendamentos = () => (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 mb-3">Total: {data.length} agendamentos</div>
      <ScrollArea className="h-96">
        {data.map((agendamento: any) => (
          <div key={agendamento.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
            <div>
              <h4 className="font-medium">{agendamento.tipo_exame}</h4>
              <p className="text-sm text-gray-600">Paciente: {agendamento.pacientes?.nome}</p>
              <p className="text-sm text-gray-600">Médico: {agendamento.medicos?.nome_completo || 'N/A'}</p>
            </div>
            <div className="text-right">
              <Badge variant={agendamento.status === 'concluido' ? 'default' : 'secondary'}>
                {agendamento.status}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );

  const renderConvenios = () => (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 mb-3">Total: {data.length} convênios</div>
      <ScrollArea className="h-96">
        {data.map((convenio: any) => (
          <div key={convenio.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: convenio.cor }}
              />
              <div>
                <h4 className="font-medium">{convenio.nome}</h4>
                <p className="text-sm text-gray-600">{convenio.descricao}</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Pacientes: {convenio.totalPacientes || 0}</p>
              <p>Exames: {convenio.totalExames || 0}</p>
              <p>Agendamentos: {convenio.totalAgendamentos || 0}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );

  const renderFaturamento = () => {
    const totalFaturado = data.reduce((sum, item) => sum + (item.valor_pago || 0), 0);
    const totalPendente = data.reduce((sum, item) => {
      if (item.status_pagamento === 'pendente' || item.status_pagamento === 'pagar_no_dia') {
        return sum + (item.valor_exame || 0);
      } else if (item.status_pagamento === 'parcial') {
        return sum + ((item.valor_exame || 0) - (item.valor_pago || 0));
      }
      return sum;
    }, 0);

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-700 font-medium">Total Faturado</p>
            <p className="text-2xl font-bold text-green-800">{formatCurrency(totalFaturado)}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-orange-700 font-medium">Total Pendente</p>
            <p className="text-2xl font-bold text-orange-800">{formatCurrency(totalPendente)}</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-3">Total: {data.length} registros</div>
        <ScrollArea className="h-96">
          {data.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
              <div>
                <h4 className="font-medium">{item.tipo_exame}</h4>
                <p className="text-sm text-gray-600">Paciente: {item.pacientes?.nome}</p>
                <p className="text-sm text-gray-600">
                  Convênio: {item.convenios?.nome || 'Particular'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.valor_exame || 0)}</p>
                <p className="text-sm text-green-600">Pago: {formatCurrency(item.valor_pago || 0)}</p>
                <Badge variant={item.status_pagamento === 'pago' ? 'default' : 'secondary'}>
                  {item.status_pagamento}
                </Badge>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(item.data_agendamento).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'pacientes': return renderPacientes();
      case 'exames': return renderExames();
      case 'agendamentos': return renderAgendamentos();
      case 'convenios': return renderConvenios();
      case 'faturamento': return renderFaturamento();
      default: return <div>Tipo de relatório não suportado</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {data.length === 0 ? 'Nenhum dado encontrado para os filtros aplicados' : 
           `Mostrando ${data.length} registros`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum registro encontrado</p>
            <p className="text-sm">Tente ajustar os filtros para ver mais resultados</p>
          </div>
        ) : (
          renderContent()
        )}
      </CardContent>
    </Card>
  );
};

export default RelatorioDados;
