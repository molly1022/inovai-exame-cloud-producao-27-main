
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Users, 
  DollarSign,
  TrendingUp,
  Calendar,
  Heart,
  BarChart3
} from "lucide-react";
import { useRelatoriosConvenios } from '@/hooks/useRelatoriosConvenios';

interface RelatorioConveniosProps {
  filtros: any;
}

const RelatorioConvenios = ({ filtros }: RelatorioConveniosProps) => {
  const { desempenhoConvenios, comparativoConvenios, loading } = useRelatoriosConvenios(filtros);

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparativo Geral */}
      {comparativoConvenios && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Consultas Convênios</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {comparativoConvenios.total_convenios}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Consultas Particulares</p>
                  <p className="text-2xl font-bold text-green-800">
                    {comparativoConvenios.total_particulares}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">Ticket Médio Convênios</p>
                  <p className="text-lg font-bold text-purple-800">
                    {formatCurrency(comparativoConvenios.ticket_medio_convenios)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700">Ticket Médio Particular</p>
                  <p className="text-lg font-bold text-orange-800">
                    {formatCurrency(comparativoConvenios.ticket_medio_particulares)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rankings */}
      {comparativoConvenios && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ranking por Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Ranking por Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {comparativoConvenios.ranking_volume.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-800">{index + 1}</span>
                        </div>
                        <span className="font-medium">{item.convenio_nome}</span>
                      </div>
                      <Badge variant="outline">{item.total_consultas} consultas</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Ranking por Faturamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ranking por Faturamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {comparativoConvenios.ranking_faturamento.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-800">{index + 1}</span>
                        </div>
                        <span className="font-medium">{item.convenio_nome}</span>
                      </div>
                      <Badge variant="outline">{formatCurrency(item.faturamento_total)}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Desempenho Detalhado por Convênio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Análise Detalhada por Convênio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {desempenhoConvenios.map((convenio) => (
              <Card key={convenio.convenio_id} className="border-l-4" style={{ borderLeftColor: convenio.cor }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: convenio.cor }}
                      />
                      <CardTitle className="text-lg">{convenio.convenio_nome}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {convenio.percentual_desconto}% desconto
                      </Badge>
                      <Badge variant="secondary">
                        {convenio.pacientes_unicos} pacientes únicos
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Métricas Principais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-600 font-medium">Total Consultas</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {convenio.total_consultas}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-green-600 font-medium">Faturamento</p>
                      <p className="text-lg font-bold text-green-800">
                        {formatCurrency(convenio.faturamento_total)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-purple-600 font-medium">Ticket Médio</p>
                      <p className="text-lg font-bold text-purple-800">
                        {formatCurrency(convenio.ticket_medio)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-orange-600 font-medium">Pacientes Únicos</p>
                      <p className="text-2xl font-bold text-orange-800">
                        {convenio.pacientes_unicos}
                      </p>
                    </div>
                  </div>

                  {/* Status dos Pagamentos */}
                  <div className="mb-6">
                    <h5 className="font-medium mb-3">Status dos Pagamentos</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-green-600 font-medium">Pagos</p>
                        <p className="text-xl font-bold text-green-800">
                          {convenio.consultas_pagas}
                        </p>
                        <Progress 
                          value={convenio.total_consultas > 0 ? (convenio.consultas_pagas / convenio.total_consultas) * 100 : 0} 
                          className="mt-2 h-2"
                        />
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-yellow-600 font-medium">Pendentes</p>
                        <p className="text-xl font-bold text-yellow-800">
                          {convenio.consultas_pendentes}
                        </p>
                        <Progress 
                          value={convenio.total_consultas > 0 ? (convenio.consultas_pendentes / convenio.total_consultas) * 100 : 0} 
                          className="mt-2 h-2"
                        />
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-orange-600 font-medium">Parciais</p>
                        <p className="text-xl font-bold text-orange-800">
                          {convenio.consultas_parciais}
                        </p>
                        <Progress 
                          value={convenio.total_consultas > 0 ? (convenio.consultas_parciais / convenio.total_consultas) * 100 : 0} 
                          className="mt-2 h-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Procedimentos Mais Realizados */}
                  {convenio.procedimentos_mais_realizados.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3">Procedimentos Mais Realizados</h5>
                      <div className="space-y-2">
                        {convenio.procedimentos_mais_realizados.map((proc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{proc.tipo_exame}</p>
                              <p className="text-sm text-gray-600">{proc.quantidade} realizados</p>
                            </div>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(proc.faturamento)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioConvenios;
