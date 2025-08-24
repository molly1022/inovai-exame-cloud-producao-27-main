
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ValoresReceberTableProps {
  agendamentosFuturos: Array<{
    id: string;
    data_agendamento: string;
    paciente: string;
    medico: string;
    valor_exame: number;
    valor_pago: number;
    status_pagamento: string;
    tipo_exame: string;
    dias_ate_consulta?: number;
  }>;
  pagamentosVencidos: Array<{
    id: string;
    data_agendamento: string;
    paciente: string;
    medico: string;
    valor_devido: number;
    dias_vencido: number;
    tipo_exame: string;
  }>;
}

const ValoresReceberTable = ({ agendamentosFuturos, pagamentosVencidos }: ValoresReceberTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'vencido': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalFuturo = agendamentosFuturos.reduce((sum, item) => 
    sum + (item.valor_exame - item.valor_pago), 0
  );

  const totalVencido = pagamentosVencidos.reduce((sum, item) => 
    sum + item.valor_devido, 0
  );

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Consultas Futuras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(totalFuturo)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {agendamentosFuturos.length} consultas agendadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pagamentos Vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(totalVencido)}
            </div>
            <p className="text-xs text-red-600 mt-1">
              {pagamentosVencidos.length} pagamentos em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Consultas Futuras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Consultas Futuras Agendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agendamentosFuturos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma consulta futura</h3>
              <p className="text-gray-600">
                Não há consultas agendadas para os próximos dias.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor a Receber</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agendamentosFuturos.map((agendamento) => (
                    <TableRow key={agendamento.id}>
                      <TableCell>
                        {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}
                        {agendamento.dias_ate_consulta !== undefined && (
                          <div className="text-xs text-gray-500">
                            {agendamento.dias_ate_consulta === 0 ? 'Hoje' : 
                             agendamento.dias_ate_consulta === 1 ? 'Amanhã' :
                             `${agendamento.dias_ate_consulta} dias`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{agendamento.paciente}</TableCell>
                      <TableCell>{agendamento.medico}</TableCell>
                      <TableCell>{agendamento.tipo_exame}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(agendamento.valor_exame - agendamento.valor_pago)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(agendamento.status_pagamento)}>
                          {agendamento.status_pagamento === 'agendado' ? 'Agendado' : 
                           agendamento.status_pagamento === 'confirmado' ? 'Confirmado' : 
                           agendamento.status_pagamento}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Pagamentos Vencidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Pagamentos em Atraso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pagamentosVencidos.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">Nenhum pagamento em atraso</h3>
              <p className="text-green-600">
                Todos os pagamentos estão em dia!
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data da Consulta</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor Devido</TableHead>
                    <TableHead>Dias em Atraso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentosVencidos.map((pagamento) => (
                    <TableRow key={pagamento.id} className="bg-red-50">
                      <TableCell>
                        {new Date(pagamento.data_agendamento).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">{pagamento.paciente}</TableCell>
                      <TableCell>{pagamento.medico}</TableCell>
                      <TableCell>{pagamento.tipo_exame}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatCurrency(pagamento.valor_devido)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800 border-red-300">
                          {pagamento.dias_vencido} {pagamento.dias_vencido === 1 ? 'dia' : 'dias'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Cobrar
                          </Button>
                          <Button size="sm" variant="default">
                            Registrar Pagamento
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ValoresReceberTable;
