
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Target,
  Award,
  AlertTriangle,
  Download,
  BarChart3,
  Settings,
  Lightbulb
} from "lucide-react";
import { useRelatorioExecutivo, FiltrosRelatorioExecutivo } from '@/hooks/useRelatorioExecutivo';

interface RelatorioExecutivoCompletoProps {
  filtros: any;
}

const RelatorioExecutivoCompleto = ({ filtros }: RelatorioExecutivoCompletoProps) => {
  const [opcoes, setOpcoes] = useState<FiltrosRelatorioExecutivo>({
    incluirGraficos: true,
    incluirComparacao: true,
    incluirProjecoes: false,
    incluirKPIs: true
  });

  const filtrosCompletos = { ...filtros, ...opcoes };
  const { dados, loading, gerarRelatorioPDF } = useRelatorioExecutivo(filtrosCompletos);

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  const getImpactColor = (impacto: 'alto' | 'medio' | 'baixo') => {
    switch (impacto) {
      case 'alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
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
            Configurações do Relatório Executivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="incluir-graficos-exec"
                checked={opcoes.incluirGraficos}
                onCheckedChange={(checked) => setOpcoes({...opcoes, incluirGraficos: checked})}
              />
              <Label htmlFor="incluir-graficos-exec">Incluir Gráficos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="incluir-comparacao"
                checked={opcoes.incluirComparacao}
                onCheckedChange={(checked) => setOpcoes({...opcoes, incluirComparacao: checked})}
              />
              <Label htmlFor="incluir-comparacao">Incluir Comparação</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="incluir-projecoes"
                checked={opcoes.incluirProjecoes}
                onCheckedChange={(checked) => setOpcoes({...opcoes, incluirProjecoes: checked})}
              />
              <Label htmlFor="incluir-projecoes">Incluir Projeções</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="incluir-kpis"
                checked={opcoes.incluirKPIs}
                onCheckedChange={(checked) => setOpcoes({...opcoes, incluirKPIs: checked})}
              />
              <Label htmlFor="incluir-kpis">Incluir KPIs</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={gerarRelatorioPDF}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? 'Gerando...' : 'Gerar Relatório Executivo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {dados && (
        <>
          {/* Resumo Executivo */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumo Executivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-800">{dados.resumo_executivo.total_pacientes}</p>
                  <p className="text-sm text-blue-600">Total de Pacientes</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-800">{dados.resumo_executivo.consultas_realizadas}</p>
                  <p className="text-sm text-green-600">Consultas Realizadas</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-800">
                    {formatCurrency(dados.resumo_executivo.faturamento_periodo)}
                  </p>
                  <p className="text-sm text-purple-600">Faturamento do Período</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-800">
                    {dados.resumo_executivo.crescimento_percentual.toFixed(1)}%
                  </p>
                  <p className="text-sm text-orange-600">Crescimento</p>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-800">
                      {dados.resumo_executivo.taxa_ocupacao.toFixed(1)}%
                    </p>
                    <p className="text-sm text-red-600">Taxa de Ocupação</p>
                    <Progress value={dados.resumo_executivo.taxa_ocupacao} className="mt-2" />
                  </div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-800">
                    {formatCurrency(dados.resumo_executivo.ticket_medio)}
                  </p>
                  <p className="text-sm text-yellow-600">Ticket Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs Principais */}
          {opcoes.incluirKPIs && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  KPIs Principais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Novos Pacientes</span>
                      <Badge variant="outline">{dados.kpis_principais.novos_pacientes}</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Taxa de Retorno</span>
                      <Badge variant="outline">{dados.kpis_principais.taxa_retorno.toFixed(1)}%</Badge>
                    </div>
                    <Progress value={dados.kpis_principais.taxa_retorno} className="mt-2" />
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Inadimplência</span>
                      <Badge variant="destructive">{dados.kpis_principais.inadimplencia}</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Satisfação Cliente</span>
                      <Badge variant="default">{dados.kpis_principais.satisfacao_cliente}/5</Badge>
                    </div>
                    <Progress value={(dados.kpis_principais.satisfacao_cliente / 5) * 100} className="mt-2" />
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Produtividade Médica</span>
                      <Badge variant="outline">{dados.kpis_principais.produtividade_medica}%</Badge>
                    </div>
                    <Progress value={dados.kpis_principais.produtividade_medica} className="mt-2" />
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Eficiência Operacional</span>
                      <Badge variant="outline">{dados.kpis_principais.eficiencia_operacional}%</Badge>
                    </div>
                    <Progress value={dados.kpis_principais.eficiencia_operacional} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ranking de Desempenho */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ranking de Médicos */}
            {dados.ranking_desempenho.medicos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Médicos por Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {dados.ranking_desempenho.medicos.map((medico, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="min-w-[30px]">
                              {index + 1}º
                            </Badge>
                            <div>
                              <p className="font-medium">{medico.nome}</p>
                              <p className="text-sm text-gray-600">
                                {medico.consultas} consultas • Avaliação: {medico.avaliacao}
                              </p>
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
            {dados.ranking_desempenho.convenios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Convênios por Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {dados.ranking_desempenho.convenios.map((convenio, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="min-w-[30px]">
                              {index + 1}º
                            </Badge>
                            <div>
                              <p className="font-medium">{convenio.nome}</p>
                              <p className="text-sm text-gray-600">
                                {convenio.volume} consultas • Margem: {(convenio.margem * 100).toFixed(0)}%
                              </p>
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
          </div>

          {/* Insights Estratégicos */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Insights Estratégicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dados.insights_estrategicos.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getImpactColor(insight.impacto)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.categoria}
                        </Badge>
                        <Badge variant={insight.impacto === 'alto' ? 'destructive' : insight.impacto === 'medio' ? 'default' : 'secondary'}>
                          {insight.impacto.toUpperCase()}
                        </Badge>
                      </div>
                      {insight.impacto === 'alto' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                    </div>
                    <p className="font-medium mb-2">{insight.insight}</p>
                    <p className="text-sm opacity-80">
                      <strong>Ação recomendada:</strong> {insight.acao_recomendada}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RelatorioExecutivoCompleto;
