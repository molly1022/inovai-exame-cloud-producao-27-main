import React, { useState } from 'react';
import { FeaturePageGate } from '@/components/FeaturePageGate';
import { useRepassesMedicos } from '@/hooks/useRepassesMedicos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Filter, DollarSign, CheckCircle, Clock, Users } from 'lucide-react';
import { ProcessarRepassesButton } from '@/components/ProcessarRepassesButton';

const Repasses = () => {
  const {
    repasses,
    loading,
    marcarRepasePago,
    cancelarRepasse,
    fetchRepasses
  } = useRepassesMedicos();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [observacoesPagamento, setObservacoesPagamento] = useState('');
  const [filtroMes, setFiltroMes] = useState(format(new Date(), 'yyyy-MM'));
  const [filtroMedico, setFiltroMedico] = useState('');

  const repassesFiltrados = repasses.filter(repasse => {
    const mesRepasse = format(new Date(repasse.mes_referencia), 'yyyy-MM');
    const matchesMes = mesRepasse === filtroMes;
    const matchesMedico = !filtroMedico || repasse.medicos?.nome_completo?.toLowerCase().includes(filtroMedico.toLowerCase());
    return matchesMes && matchesMedico;
  });

  const repassesPendentes = repassesFiltrados.filter(r => r.status === 'pendente');
  const repassesPagos = repassesFiltrados.filter(r => r.status === 'pago');
  const totalPendente = repassesPendentes.reduce((sum, r) => sum + Number(r.valor_repasse), 0);
  const totalPago = repassesPagos.reduce((sum, r) => sum + Number(r.valor_repasse), 0);

  const handleSelectAll = () => {
    if (selectedItems.length === repassesPendentes.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(repassesPendentes.map(r => r.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMarcarPagosLote = async () => {
    for (const id of selectedItems) {
      await marcarRepasePago(id);
    }
    setSelectedItems([]);
    setObservacoesPagamento('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const resumoMedicos = React.useMemo(() => {
    const medicos = new Map();
    repassesFiltrados.forEach(repasse => {
      const medicoId = repasse.medico_id;
      if (!medicos.has(medicoId)) {
        medicos.set(medicoId, {
          id: medicoId,
          nome: repasse.medicos?.nome_completo || 'Médico não encontrado',
          pendente: 0,
          pago: 0,
          total: 0,
          percentualMedio: 0,
          consultas: 0
        });
      }
      const medico = medicos.get(medicoId);
      if (repasse.status === 'pendente') {
        medico.pendente += Number(repasse.valor_repasse);
      } else if (repasse.status === 'pago') {
        medico.pago += Number(repasse.valor_repasse);
      }
      medico.total += Number(repasse.valor_repasse);
      medico.consultas += 1;
      medico.percentualMedio = Number(repasse.percentual_repasse);
    });
    return Array.from(medicos.values());
  }, [repassesFiltrados]);

  return (
    <FeaturePageGate
      feature="repasses"
      featureName="Gestão de Repasses"
      description="Sistema completo para gerenciar repasses de médicos com controle de pagamentos e relatórios detalhados."
      requiredPlan="intermediario_medico"
    >
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestão de Repasses</h1>
          <ProcessarRepassesButton />
        </div>

        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="repasses">Repasses</TabsTrigger>
            <TabsTrigger value="por-medico">Por Médico</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(totalPendente)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {repassesPendentes.length} repasses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPago)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {repassesPagos.length} repasses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalPendente + totalPago)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mês {format(new Date(filtroMes), 'MMMM/yyyy', { locale: ptBR })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Médicos Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {resumoMedicos.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Com repasses no mês
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="repasses" className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Filtrar por médico..."
                  value={filtroMedico}
                  onChange={(e) => setFiltroMedico(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                type="month"
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="w-48"
              />
            </div>

            {selectedItems.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Ação em Lote</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedItems.length} repasses selecionados
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Observações do pagamento (opcional)"
                        value={observacoesPagamento}
                        onChange={(e) => setObservacoesPagamento(e.target.value)}
                        className="min-w-64"
                        rows={2}
                      />
                      <Button onClick={handleMarcarPagosLote}>
                        Marcar como Pagos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Histórico Detalhado</CardTitle>
                  {repassesPendentes.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedItems.length === repassesPendentes.length ? 'Desmarcar' : 'Selecionar'} Pendentes
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Consulta</TableHead>
                      <TableHead>Data Consulta</TableHead>
                      <TableHead>Valor Consulta</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Repasse</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          Carregando repasses...
                        </TableCell>
                      </TableRow>
                    ) : repassesFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          Nenhum repasse encontrado para o período
                        </TableCell>
                      </TableRow>
                    ) : (
                      repassesFiltrados.map((repasse) => (
                        <TableRow key={repasse.id}>
                          <TableCell>
                            {repasse.status === 'pendente' && (
                              <Checkbox
                                checked={selectedItems.includes(repasse.id)}
                                onCheckedChange={() => handleSelectItem(repasse.id)}
                              />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {repasse.medicos?.nome_completo || 'Médico não encontrado'}
                          </TableCell>
                          <TableCell>
                            {repasse.agendamentos?.tipo_exame || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {repasse.agendamentos?.data_agendamento 
                              ? format(new Date(repasse.agendamentos.data_agendamento), 'dd/MM/yyyy', { locale: ptBR })
                              : 'N/A'
                            }
                          </TableCell>
                          <TableCell>{formatCurrency(Number(repasse.valor_consulta))}</TableCell>
                          <TableCell>{repasse.percentual_repasse}%</TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(Number(repasse.valor_repasse))}
                          </TableCell>
                          <TableCell>
                            <Badge variant={repasse.status === 'pago' ? 'default' : 'secondary'}>
                              {repasse.status === 'pago' ? 'Pago' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {repasse.status === 'pendente' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => marcarRepasePago(repasse.id)}
                                >
                                  Pagar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => cancelarRepasse(repasse.id)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="por-medico" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resumoMedicos.map((medico) => (
                <Card key={medico.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{medico.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pendente:</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(medico.pendente)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pago:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(medico.pago)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="font-bold">
                        {formatCurrency(medico.total)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">% Repasse:</span>
                      <span className="text-sm">{medico.percentualMedio}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Consultas:</span>
                      <span className="text-sm">{medico.consultas}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FeaturePageGate>
  );
};

export default Repasses;