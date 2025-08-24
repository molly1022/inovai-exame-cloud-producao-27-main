
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText,
  Download,
  Settings,
  BarChart3,
  PieChart
} from "lucide-react";
import { useRelatoriosFaturamentoPersonalizado, FiltrosFaturamentoPersonalizado } from '@/hooks/useRelatoriosFaturamentoPersonalizado';

interface RelatorioFaturamentoPersonalizadoProps {
  filtros: any;
}

const RelatorioFaturamentoPersonalizado = ({ filtros }: RelatorioFaturamentoPersonalizadoProps) => {
  const [opcoes, setOpcoes] = useState<FiltrosFaturamentoPersonalizado>({
    incluirGraficos: true,
    incluirDetalhamento: true,
    agruparPor: 'medico',
    ordenarPor: 'valor'
  });

  const filtrosCompletos = { ...filtros, ...opcoes };
  const { dados, loading, gerarRelatorioPDF } = useRelatoriosFaturamentoPersonalizado();

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
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
      {/* Configurações do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Relatório Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="incluir-graficos"
                checked={opcoes.incluirGraficos}
                onCheckedChange={(checked) => setOpcoes({...opcoes, incluirGraficos: checked})}
              />
              <Label htmlFor="incluir-graficos">Incluir Gráficos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="incluir-detalhamento"
                checked={opcoes.incluirDetalhamento}
                onCheckedChange={(checked) => setOpcoes({...opcoes, incluirDetalhamento: checked})}
              />
              <Label htmlFor="incluir-detalhamento">Incluir Detalhamento</Label>
            </div>

            <div className="space-y-2">
              <Label>Agrupar Por</Label>
              <Select
                value={opcoes.agruparPor}
                onValueChange={(value: any) => setOpcoes({...opcoes, agruparPor: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medico">Médico</SelectItem>
                  <SelectItem value="convenio">Convênio</SelectItem>
                  <SelectItem value="tipo_exame">Tipo de Exame</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ordenar Por</Label>
              <Select
                value={opcoes.ordenarPor}
                onValueChange={(value: any) => setOpcoes({...opcoes, ordenarPor: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="valor">Valor</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="quantidade">Quantidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => gerarRelatorioPDF(filtrosCompletos)}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? 'Gerando...' : 'Gerar PDF Personalizado'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {dados && (
        <>
          {/* Resumo Financeiro Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Faturamento Total</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(dados.faturamento_total)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Faturamento Realizado</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatCurrency(dados.faturamento_realizado)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700">Faturamento Pendente</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {formatCurrency(dados.faturamento_pendente)}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Consultas</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {dados.total_consultas}
                    </p>
                    <p className="text-xs text-purple-600">
                      Ticket: {formatCurrency(dados.ticket_medio)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ranking de Médicos */}
          {opcoes.incluirDetalhamento && dados.ranking_medicos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ranking de Médicos por Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {dados.ranking_medicos.map((medico, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="min-w-[30px]">
                            {index + 1}º
                          </Badge>
                          <div>
                            <p className="font-medium">{medico.medico_nome}</p>
                            <p className="text-sm text-gray-600">{medico.consultas} consultas</p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">
                          {formatCurrency(medico.faturamento)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Ranking de Convênios */}
          {opcoes.incluirDetalhamento && dados.ranking_convenios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Ranking de Convênios por Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {dados.ranking_convenios.map((convenio, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="min-w-[30px]">
                            {index + 1}º
                          </Badge>
                          <div>
                            <p className="font-medium">{convenio.convenio_nome}</p>
                            <p className="text-sm text-gray-600">{convenio.consultas} consultas</p>
                          </div>
                        </div>
                        <p className="font-bold text-blue-600">
                          {formatCurrency(convenio.faturamento)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Métodos de Pagamento */}
          {dados.metodos_pagamento.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dados.metodos_pagamento.map((metodo, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{metodo.metodo}</p>
                        <p className="text-sm text-gray-600">{metodo.percentual.toFixed(1)}% do total</p>
                      </div>
                      <p className="font-bold">
                        {formatCurrency(metodo.valor)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default RelatorioFaturamentoPersonalizado;
